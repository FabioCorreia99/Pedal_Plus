// components/InteractiveMap.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface InteractiveMapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ lat = 52.3676, lon = 4.9041, zoom = 13 }) => {
  const offset = 0.05;
  const bbox = `${lon - offset},${lat - offset},${lon + offset},${lat + offset}`;
  
  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView 
        source={{ uri: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik` }}
        style={{ flex: 1, opacity: 0.9 }}
        scrollEnabled={true}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30, 58, 138, 0.1)', pointerEvents: 'none' }]} />
    </View>
  );
};

export default InteractiveMap;