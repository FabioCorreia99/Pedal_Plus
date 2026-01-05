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
  mapPaddingBottom = 0, // Default no padding
}) => {
  const mapRef = React.useRef<MapView>(null);

  // Convert zoom level to latitudeDelta (approximate conversion)
  const latitudeDelta = 180 / Math.pow(2, zoom);
  const longitudeDelta = latitudeDelta * 1.5;

  React.useEffect(() => {
    // Fit map to show both markers when route is displayed
    if (showRoute && origin && destination && mapRef.current) {
      mapRef.current.fitToCoordinates([origin, destination], {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  }, [showRoute, origin, destination]);

  React.useEffect(() => {
    if (origin && mapRef.current && !showRoute) {
      // Use setTimeout to ensure map is fully loaded
      setTimeout(() => {
        mapRef.current?.animateCamera({
          center: {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
          zoom: zoom,
        }, { duration: 800 });
      }, 100);
    }
  }, [origin, showRoute]);

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
        mapPadding={{ 
          top: 0, 
          right: 0, 
          bottom: mapPaddingBottom, 
          left: 0 
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {/* Origin Marker (Yellow) */}
        {origin && (
          <Marker
            coordinate={origin}
            pinColor="#facc15"
            title="Origin"
          />
        )}

        {/* Destination Marker (Red) */}
        {showRoute && destination && (
          <Marker
            coordinate={destination}
            pinColor="#ef4444"
            title="Destination"
          />
        )}

        {/* Current Position Marker (Green) */}
        {showRoute && currentPosition && (
          <Marker
            coordinate={currentPosition}
            pinColor="#5DBD76"
            title="You are here"
          />
        )}

        {/* Route Polyline */}
        {showRoute && origin && destination && (
          <Polyline
            coordinates={[origin, destination]}
            strokeColor="#4338ca"
            strokeWidth={5}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>
      
      {/* Blue overlay */}
      <View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: 'rgba(30, 58, 138, 0.1)', pointerEvents: 'none' }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default InteractiveMap;
