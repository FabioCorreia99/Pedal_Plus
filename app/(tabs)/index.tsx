import InteractiveMap from '@/components/InteractiveMap';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import ConfirmState from '../../components/home/confirmStateView';
import NavigatingState from '../../components/home/navigationStateView';
import SearchState from '../../components/home/searchStateView';
import { fetchBikeRoute, RideMode } from '../../services/routesAPI';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string;

type LatLng = { latitude: number; longitude: number };

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

  const originRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setOrigin(coords);
      setOriginLabel('Current Location');
    })();
  }, []);

  useEffect(() => {
    if (origin && destination && routeState === 'search') {
      setRouteState('confirm');
    }
  }, [origin, destination, routeState]);

  const handleConfirmDestination = () => {
    if (destination) {
      setRouteState('navigating');
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (routeState !== 'confirm') return;
      if (!origin || !destination) return;

      try {
        const result = await fetchBikeRoute(origin, destination, GOOGLE_MAPS_API_KEY, rideMode);
        if (!cancelled) {
          setRouteCoords(result.coords);
          setRouteMeta({ distanceMeters: result.distanceMeters, duration: result.duration });
        }
      } catch (e) {
        if (!cancelled) {
          setRouteCoords([]);
          setRouteMeta({}); // important
        }
        console.log('fetchBikeRoute error', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routeState, origin, destination, rideMode]);

  const resetInputs = () => {
    setOrigin(null);
    setDestination(null);
    setOriginLabel('');
    setDestinationLabel('');
    setRouteCoords([]);
    setRouteMeta({});
    setRouteState('search');
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
        currentPosition={routeState === 'navigating' ? origin ?? undefined : undefined}
        mapPaddingBottom={getMapPaddingBottom()}
        routeCoordinates={routeCoords}
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
          distanceMeters={routeMeta.distanceMeters}
          duration={routeMeta.duration}
         />
      )}
    </View>
  );
}
