import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { InteractiveMapProps } from './InteractiveMap.types';

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  mapPaddingBottom = 0,
}) => {
  return (
    <View style={[styles.container, { paddingBottom: mapPaddingBottom }]}>
      <View style={styles.card}>
        <Text style={styles.title}>🗺️ Mapa Interativo</Text>
        <Text style={styles.subtitle}>
          O mapa Google Maps está disponível apenas na versão móvel (Android/iOS).
        </Text>
        <View style={styles.mockMap}>
           <Text style={styles.mockText}>[ Mapa Indisponível na Web ]</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  mockMap: {
    width: '100%',
    height: 200,
    backgroundColor: '#e1e4e8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  mockText: {
    color: '#9ca3af',
    fontWeight: '600',
  }
});

export default InteractiveMap;