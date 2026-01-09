import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { InteractiveMapProps } from './InteractiveMap.types';

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  zoom = 12,
  showRoute = false,
  origin,
  destination,
  currentPosition,
  mapPaddingBottom = 0,
  routeCoordinates = [],
  isNavigating = false,
  userHeading = 0,
}) => {
  const mapRef = React.useRef<MapView>(null);

  // Convert zoom level to deltas (simple approximation)
  const latitudeDelta = 180 / Math.pow(2, zoom);
  const longitudeDelta = latitudeDelta * 1.5;

  React.useEffect(() => {
    if (!showRoute || !mapRef.current) return;

    const coordsToFit =
      routeCoordinates.length >= 2
        ? routeCoordinates
        : origin && destination
          ? [origin, destination]
          : [];

    if (coordsToFit.length >= 2) {
      mapRef.current.fitToCoordinates(coordsToFit, {
        edgePadding: { top: 100, right: 50, bottom: mapPaddingBottom + 20, left: 50 },
        animated: true,
      });
    }
  }, [showRoute, origin, destination, routeCoordinates, mapPaddingBottom]);

  React.useEffect(() => {
    if (origin && mapRef.current && !showRoute) {
      setTimeout(() => {
        mapRef.current?.animateCamera(
          {
            center: { latitude: origin.latitude, longitude: origin.longitude },
            zoom,
          },
          { duration: 800 }
        );
      }, 100);
    }
  }, [origin, showRoute, zoom]);

  // Animate camera for navigation mode
  React.useEffect(() => {
    if (!isNavigating || !currentPosition || !mapRef.current) return;

    mapRef.current.animateCamera(
      {
        center: {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
        },
        pitch: 55, // Tilted view (0-90, higher = more tilted)
        heading: userHeading, // Rotate map based on direction
        zoom: 17, // Closer zoom for navigation
      },
      { duration: 300 } // Smooth animation
    );
  }, [isNavigating, currentPosition, userHeading]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: origin ? origin.latitude : 52.3676,
          longitude: origin ? origin.longitude : 4.9041,
          latitudeDelta,
          longitudeDelta,
        }}
        mapPadding={{ top: 0, right: 0, bottom: mapPaddingBottom, left: 0 }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {origin && <Marker coordinate={origin} pinColor="#facc15" title="Origin" />}

        {showRoute && destination && (
          <Marker coordinate={destination} pinColor="#ef4444" title="Destination" />
        )}

        {showRoute && currentPosition && (
          <Marker coordinate={currentPosition} pinColor="#5DBD76" title="You are here" />
        )}

        {showRoute && routeCoordinates.length >= 2 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4338ca"
            strokeWidth={5}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(30, 58, 138, 0.1)', pointerEvents: 'none' },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject },
});

export default InteractiveMap;
