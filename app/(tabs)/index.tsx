import InteractiveMap from "@/components/InteractiveMap";
import { saveRecentRoute } from "@/lib/recentRoutes";
import {
  getCurrentStep,
  remainingDistanceMeters,
} from "@/services/navigationCalculations";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, View } from "react-native";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";

import ConfirmState from "../../components/home/confirmStateView";
import NavigatingState from "../../components/home/navigationStateView";
import PostActivityModal from "../../components/home/postActivityModal";
import SearchState from "../../components/home/searchStateView";
import {
  fetchBikeRoute,
  NavigationStep,
  RideMode,
} from "../../services/routesAPI";

import { useNavigationIntent } from "@/context/NavigationContext";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string;

type LatLng = { latitude: number; longitude: number };

export default function HomeScreen() {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [originLabel, setOriginLabel] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("");
  const [routeState, setRouteState] = useState<
    "search" | "confirm" | "navigating"
  >("search");
  const [rideMode, setRideMode] = useState<RideMode>("Sport");
  const [showOriginSearch, setShowOriginSearch] = useState(false);
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [routeMeta, setRouteMeta] = useState<{
    distanceMeters?: number;
    duration?: string;
  }>({});
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [liveMeta, setLiveMeta] = useState<{
    remainingMeters?: number;
    etaDate?: Date;
  }>({});
  const [routeSteps, setRouteSteps] = useState<NavigationStep[]>([]);
  const [currentStep, setCurrentStep] = useState<{
    step: NavigationStep;
    index: number;
    distanceToEnd: number;
  } | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [showPostModal, setShowPostModal] = useState(false);
  const [routeStartTime, setRouteStartTime] = useState<Date | null>(null);
  const [routeCompletionData, setRouteCompletionData] = useState<{
    durationMinutes: number;
    completedAt: Date;
  } | null>(null);
  const [hasFirstLocationUpdate, setHasFirstLocationUpdate] = useState(false);
  const originRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationRef = useRef<GooglePlacesAutocompleteRef>(null);
  const hasCompletedRoute = useRef(false);
  const [recentPhotoUri, setRecentPhotoUri] = useState<string | null>(null);

  // NEW: Track pending second phase of navigation 
  // when the user clicks a route from communities and isnt on the origin
  const [pendingRoute, setPendingRoute] = useState<{
    origin: LatLng;
    destination: LatLng;
    originLabel: string;
    destinationLabel: string;
  } | null>(null);

  /* Navigation Intent (Favorites → Home) */
  const { intent, clearIntent } = useNavigationIntent();

  /* ===============================
     GET CURRENT LOCATION (ORIGIN)
  =============================== */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      const [address] = await Location.reverseGeocodeAsync(coords);
      const label =
        [address.name, address.street, address.city]
          .filter(Boolean)
          .join(", ") || "Localização atual";

      setOrigin(coords);
      setOriginLabel(label);
    })();
  }, []);

  /* ===============================
     HANDLE INTENT FROM FAVORITES
  =============================== */
  useEffect(() => {
    if (!intent) return;

    if (intent.type === "location") {
      setDestination(intent.destination);
      setDestinationLabel(intent.destinationLabel ?? "");
      setRouteState("confirm");
      clearIntent();
    }

    if (intent.type === "route") {
      setOrigin(intent.origin);
      setDestination(intent.destination);
      setOriginLabel(intent.originLabel ?? "");
      setDestinationLabel(intent.destinationLabel ?? "");
      setRouteState("confirm");
      setPendingRoute(null); // Clear any pending route
      clearIntent();
    }

    // NEW: Handle staged route
    if (intent.type === "staged-route") {
      // First phase: Navigate to route origin
      setOrigin(intent.currentOrigin);
      setDestination(intent.routeOrigin);
      setOriginLabel(intent.currentOriginLabel);
      setDestinationLabel(intent.routeOriginLabel);
      setRouteState("confirm");
      
      // Store the second phase for later
      setPendingRoute({
        origin: intent.routeOrigin,
        destination: intent.routeDestination,
        originLabel: intent.routeOriginLabel,
        destinationLabel: intent.routeDestinationLabel,
      });
      
      clearIntent();
    }
  }, [intent]);

  /* ===============================
     AUTO CONFIRM WHEN BOTH SET
  =============================== */
  useEffect(() => {
    if (origin && destination && routeState === "search") {
      setRouteState("confirm");
    }
  }, [origin, destination, routeState]);

  const handleConfirmDestination = () => {
    if (destination) {
      setRouteState("navigating");
      setRouteStartTime(new Date());
      hasCompletedRoute.current = false;
      setHasFirstLocationUpdate(false);
    }
  };

  const handleRouteComplete = useCallback(async () => {
    if (hasCompletedRoute.current) return;
    if (!routeStartTime || !origin || !destination) return;

    hasCompletedRoute.current = true;

    const completedAt = new Date();
    const durationMinutes = Math.ceil(
      (completedAt.getTime() - routeStartTime.getTime()) / 60000,
    );

    // Check if this is phase 1 of a staged route
    if (pendingRoute) {
      // Don't save this route or show modal
      // Instead, transition to the actual route
      Alert.alert(
        'Início da Rota Alcançado',
        'Você chegou ao início da rota. Pronto para começar?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              setPendingRoute(null);
              resetInputs();
            },
          },
          {
            text: 'Começar Rota',
            onPress: () => {
              // Clear ALL route-related state before starting phase 2
              setCurrentPosition(null); 
              setRouteCoords([]); // Clear old route coordinates
              setRouteSteps([]); // Clear old navigation steps
              setRouteMeta({}); // Clear old metadata
              setLiveMeta({}); // Clear live navigation data
              setCurrentStep(null); // Clear current step
              
              // Set new route parameters
              setOrigin(pendingRoute.origin);
              setDestination(pendingRoute.destination);
              setOriginLabel(pendingRoute.originLabel);
              setDestinationLabel(pendingRoute.destinationLabel);
              setRouteState("confirm");
              
              // Reset completion tracking
              setPendingRoute(null);
              hasCompletedRoute.current = false;
              setRouteStartTime(null);
              setRouteCompletionData(null); 
            },
          },
        ]
      );
      return;
    }

    // Normal route completion flow
    await saveRecentRoute({
      originLabel,
      destinationLabel,
      origin,
      destination,
      distanceMeters: routeMeta.distanceMeters ?? 0,
      durationMinutes,
    });

    setRouteCompletionData({ durationMinutes, completedAt });
    setShowPostModal(true);
  }, [
    routeStartTime,
    origin,
    destination,
    originLabel,
    destinationLabel,
    routeMeta.distanceMeters,
    pendingRoute,
  ]);

  const handleClosePostModal = () => {
    setShowPostModal(false);
    resetInputs();
  };

  /* ===============================
     FETCH ROUTE
  =============================== */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (routeState !== "confirm" || !origin || !destination) return;

      try {
        const result = await fetchBikeRoute(
          origin,
          destination,
          GOOGLE_MAPS_API_KEY,
          rideMode,
        );
        if (!cancelled) {
          setRouteCoords(result.coords);
          setRouteMeta({
            distanceMeters: result.distanceMeters,
            duration: result.duration,
          });
          setRouteSteps(result.steps);
        }
      } catch {
        if (!cancelled) {
          setRouteCoords([]);
          setRouteMeta({});
          setRouteSteps([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routeState, origin, destination, rideMode]);

  /* ===============================
     LIVE LOCATION
  =============================== */
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let mounted = true;

    (async () => {
      if (routeState !== "navigating") return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5,
        },
        (loc) => {
          if (!mounted) return;

          setCurrentPosition({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });

          setHasFirstLocationUpdate(true);

          if (loc.coords.heading != null && loc.coords.heading !== -1) {
            setUserHeading(loc.coords.heading);
          }
        },
      );
    })();

    return () => {
      mounted = false;
      sub?.remove();
    };
  }, [routeState]);

  /* ===============================
     ETA + DISTANCE
  =============================== */
  useEffect(() => {
    if (
      routeState !== "navigating" ||
      !currentPosition ||
      routeCoords.length < 2
    )
      return;

    const remaining = remainingDistanceMeters(currentPosition, routeCoords);

    const total = routeMeta.distanceMeters ?? remaining;
    const totalSeconds = routeMeta.duration
      ? parseInt(routeMeta.duration)
      : undefined;

    const remainingSeconds =
      totalSeconds && total > 0
        ? Math.round((totalSeconds * remaining) / total)
        : undefined;

    setLiveMeta({
      remainingMeters: remaining,
      etaDate: remainingSeconds
        ? new Date(Date.now() + remainingSeconds * 1000)
        : undefined,
    });
  }, [
    routeState,
    currentPosition,
    routeCoords,
    routeMeta.distanceMeters,
    routeMeta.duration,
  ]);

  /* ===============================
     CURRENT STEP
  =============================== */
  useEffect(() => {
    if (
      routeState !== "navigating" ||
      !currentPosition ||
      routeSteps.length === 0
    )
      return;

    setCurrentStep(getCurrentStep(currentPosition, routeSteps));
  }, [routeState, currentPosition, routeSteps]);

  const resetInputs = () => {
    setOrigin(null);
    setDestination(null);
    setOriginLabel("");
    setDestinationLabel("");
    setRouteCoords([]);
    setRouteMeta({});
    setRouteState("search");
    setRouteStartTime(null);
    setRouteCompletionData(null);
    setPendingRoute(null); // Clear pending route
    hasCompletedRoute.current = false;
    originRef.current?.clear();
    destinationRef.current?.clear();
  };

  const screenHeight = Dimensions.get("window").height;

  const getMapPaddingBottom = () => {
    if (routeState === "search") return screenHeight * 0.55;
    if (routeState === "confirm") return 280;
    return 120;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#eff6ff" }}>
      <InteractiveMap
        zoom={12}
        showRoute={routeState !== "search"}
        origin={origin ?? undefined}
        destination={destination ?? undefined}
        currentPosition={
          routeState === "navigating"
            ? (currentPosition ?? undefined)
            : undefined
        }
        mapPaddingBottom={getMapPaddingBottom()}
        routeCoordinates={routeCoords}
        isNavigating={routeState === "navigating"}
        userHeading={userHeading}
      />

      {routeState === "search" && (
        <SearchState
          originRef={originRef}
          destinationRef={destinationRef}
          originLabel={originLabel}
          destinationLabel={destinationLabel}
          showOriginSearch={showOriginSearch}
          showDestinationSearch={showDestinationSearch}
          onOriginSearchToggle={() => setShowOriginSearch(true)}
          onDestinationSearchToggle={() => setShowDestinationSearch(true)}
          onOriginSelect={(coords, description) => {
            setOrigin(coords);
            setOriginLabel(description);
            setShowOriginSearch(false);
          }}
          onDestinationSelect={(coords, description) => {
            setDestination(coords);
            setDestinationLabel(description);
            setShowDestinationSearch(false);
          }}
        />
      )}

      {routeState === "confirm" && (
        <ConfirmState
          originLabel={originLabel}
          destinationLabel={destinationLabel}
          rideMode={rideMode}
          onRideModeChange={(mode) => setRideMode(mode as RideMode)}
          onCancel={resetInputs}
          onConfirm={handleConfirmDestination}
          distanceMeters={routeMeta.distanceMeters}
          duration={routeMeta.duration}
        />
      )}

      {routeState === "navigating" && (
        <NavigatingState
          onBack={() => setRouteState("confirm")}
          distanceMeters={liveMeta.remainingMeters ?? routeMeta.distanceMeters}
          duration={routeMeta.duration}
          currentStep={currentStep}
          onRouteComplete={handleRouteComplete}
          routeStartTime={routeStartTime}
          hasFirstLocationUpdate={hasFirstLocationUpdate}
        />
      )}

      {showPostModal && routeCompletionData && (
        <PostActivityModal
          visible={showPostModal}
          onClose={handleClosePostModal}
          durationMinutes={routeCompletionData.durationMinutes}
          completedAt={routeCompletionData.completedAt}
          routeId={null}
          distanceKm={
            routeMeta.distanceMeters
              ? routeMeta.distanceMeters / 1000
              : undefined
          }
          onConfirmPhoto={async (uri) => {
            if (!origin || !destination) return;

            await saveRecentRoute({
              originLabel,
              destinationLabel,
              origin,
              destination,
              distanceMeters: routeMeta.distanceMeters ?? 0,
              durationMinutes: routeCompletionData.durationMinutes,
              thumbnailUrl: uri,
            });

            setRecentPhotoUri(uri);
          }}
          routeCoords={routeCoords.length > 0 ? routeCoords : undefined}
        />
      )}
    </View>
  );
}
