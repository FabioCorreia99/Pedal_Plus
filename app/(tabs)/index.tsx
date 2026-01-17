import InteractiveMap from '@/components/InteractiveMap';
import { saveRecentRoute } from '@/lib/recentRoutes';
import { getCurrentStep, remainingDistanceMeters } from '@/services/navigationCalculations';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import ConfirmState from '../../components/home/confirmStateView';
import NavigatingState from '../../components/home/navigationStateView';
import PostActivityModal from '../../components/home/postActivityModal';
import SearchState from '../../components/home/searchStateView';
import { fetchBikeRoute, NavigationStep, RideMode } from '../../services/routesAPI';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string;

type LatLng = { latitude: number; longitude: number };

// TODO: implement routeId props in PostActivityModal - should be passed if the route is saved in the DB

export default function HomeScreen() {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [originLabel, setOriginLabel] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [routeState, setRouteState] = useState<'search' | 'confirm' | 'navigating'>('search');
  const [rideMode, setRideMode] = useState<RideMode>('Sport');
  const [showOriginSearch, setShowOriginSearch] = useState(false);
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [routeMeta, setRouteMeta] = useState<{ distanceMeters?: number; duration?: string }>({});
  const [currentPosition, setCurrentPosition] = useState<LatLng | null>(null);
  const [liveMeta, setLiveMeta] = useState<{ remainingMeters?: number; etaDate?: Date }>({});
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

  const originRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationRef = useRef<GooglePlacesAutocompleteRef>(null);
  const hasCompletedRoute = useRef(false); // Add this to prevent multiple triggers

  useEffect(() => {
    // Get current location on mount, set as origin in search state input
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      const [address] = await Location.reverseGeocodeAsync(coords);
      const label = [address.name, address.street, address.city].filter(Boolean).join(', ') || 'Localização atual';

      setOrigin(coords);
      setOriginLabel(label);
    })();
  }, []);

  useEffect(() => {
    // Automatically move to confirm state when both origin and destination are set
    if (origin && destination && routeState === 'search') {
      setRouteState('confirm');
    }
  }, [origin, destination, routeState]);

  const handleConfirmDestination = () => {
    // Start navigation
    if (destination) {
      setRouteState('navigating');
      setRouteStartTime(new Date()); // Record when navigation starts
      hasCompletedRoute.current = false; // Reset completion flag
    }
  };

  const handleRouteComplete = useCallback(async () => {

    if (hasCompletedRoute.current) return;
    if (!routeStartTime || !origin || !destination) return;

    hasCompletedRoute.current = true;

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - routeStartTime.getTime();
    const durationMinutes = Math.ceil(durationMs / 60000);

    // Save recent route in local storage
    await saveRecentRoute({
      originLabel,
      destinationLabel,
      origin,
      destination,
      distanceMeters: routeMeta.distanceMeters ?? 0,
      durationMinutes,
      thumbnailUrl: undefined, // optional for now
    });

    setRouteCompletionData({
      durationMinutes,
      completedAt,
    });

    setShowPostModal(true);
  }, [routeStartTime, origin, destination, originLabel, destinationLabel, routeMeta.distanceMeters]);

  const handleClosePostModal = () => {
    setShowPostModal(false);
    resetInputs();
  };

  useEffect(() => {
    // Fetch route when in confirm state and origin/destination change
    let cancelled = false;

    (async () => {
      if (routeState !== 'confirm') return;
      if (!origin || !destination) return;

      try {
        const result = await fetchBikeRoute(origin, destination, GOOGLE_MAPS_API_KEY, rideMode);
        if (!cancelled) {
          setRouteCoords(result.coords);
          setRouteMeta({ distanceMeters: result.distanceMeters, duration: result.duration });
          setRouteSteps(result.steps);
        }
      } catch (e) {
        if (!cancelled) {
          setRouteCoords([]);
          setRouteMeta({});
          setRouteSteps([]);
        }
        console.log('fetchBikeRoute error', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routeState, origin, destination, rideMode]);

  React.useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let mounted = true;

    (async () => {
      if (routeState !== 'navigating') return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

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

          // heading is available from GPS when moving
          if (loc.coords.heading !== null && loc.coords.heading !== -1) {
            setUserHeading(loc.coords.heading);
          }
        }
      );
    })();

    return () => {
      mounted = false;
      sub?.remove();
    };
  }, [routeState]);

  useEffect(() => {
    if (routeState !== 'navigating') return;
    if (!currentPosition) return;
    if (routeCoords.length < 2) return;

    const remaining = remainingDistanceMeters(currentPosition, routeCoords);

    // Simple ETA: scale original duration by remainingDistance/totalDistance
    const total = routeMeta.distanceMeters ?? remaining;
    const totalSeconds = routeMeta.duration ? parseInt(routeMeta.duration) : undefined;
    const remainingSeconds =
      totalSeconds && total > 0 ? Math.round(totalSeconds * (remaining / total)) : undefined;

    const etaDate = remainingSeconds ? new Date(Date.now() + remainingSeconds * 1000) : undefined;

    setLiveMeta({ remainingMeters: remaining, etaDate });
  }, [routeState, currentPosition, routeCoords, routeMeta.distanceMeters, routeMeta.duration]);

  // Add effect to track current step while navigating
  useEffect(() => {
    if (routeState !== 'navigating') return;
    if (!currentPosition || routeSteps.length === 0) return;

    const stepInfo = getCurrentStep(currentPosition, routeSteps);
    setCurrentStep(stepInfo);
  }, [routeState, currentPosition, routeSteps]);

  const resetInputs = () => {
    setOrigin(null);
    setDestination(null);
    setOriginLabel('');
    setDestinationLabel('');
    setRouteCoords([]);
    setRouteMeta({});
    setRouteState('search');
    setRouteStartTime(null);
    setRouteCompletionData(null);
    hasCompletedRoute.current = false; // Reset completion flag
    originRef.current?.clear();
    destinationRef.current?.clear();
  };

  const screenHeight = Dimensions.get('window').height;

  const getMapPaddingBottom = () => {
    if (routeState === 'search') {
      return screenHeight * 0.55;
    } else if (routeState === 'confirm') {
      return 280;
    } else {
      return 120;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#eff6ff' }}>
      <InteractiveMap
        lat={origin?.latitude ?? 52.3676}
        lon={origin?.longitude ?? 4.9041}
        zoom={12}
        showRoute={routeState !== 'search'}
        origin={origin ?? undefined}
        destination={destination ?? undefined}
        currentPosition={routeState === 'navigating' ? currentPosition ?? undefined : undefined}
        mapPaddingBottom={getMapPaddingBottom()}
        routeCoordinates={routeCoords}
        isNavigating={routeState === 'navigating'}
        userHeading={userHeading}
      />

      {routeState === 'search' && (
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

      {routeState === 'confirm' && (
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

      {routeState === 'navigating' && (
        <NavigatingState
          onBack={() => setRouteState('confirm')}
          distanceMeters={liveMeta.remainingMeters ?? routeMeta.distanceMeters}
          duration={routeMeta.duration}
          currentStep={currentStep}
          onRouteComplete={handleRouteComplete}
        />
      )}

      {showPostModal && routeCompletionData && (
        <PostActivityModal
          visible={showPostModal}
          onClose={handleClosePostModal}
          durationMinutes={routeCompletionData.durationMinutes}
          completedAt={routeCompletionData.completedAt}
          routeId={null} // No route ID for now, implement later if we have time
          distanceKm={
            routeMeta.distanceMeters ? routeMeta.distanceMeters / 1000 : undefined
          }
        />
      )}
    </View>
  );
}
