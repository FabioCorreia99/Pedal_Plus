import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Filter } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLORS = { primaryOrange: "#FF9E46", darkText: "#1A1A1A", textGray: "#9ca3af" };

const POI_DATA = [
  { id: 1, name: "Vondelpark", type: "Parque", rating: 4.8, img: "https://images.unsplash.com/photo-1596423736768-45c117e3a632?w=500&fit=crop" },
  { id: 2, name: "Rijksmuseum", type: "Cultura", rating: 4.9, img: "https://images.unsplash.com/photo-1554463529-e27854014799?w=500&fit=crop" },
];

export default function POIView() {
  return (
    <View>
      <View style={styles.subHeaderRow}>
        <Text style={styles.subHeaderTitle}>Popular Spots</Text>
        <Filter size={16} color="#9ca3af"/>
      </View>
      
      <View style={styles.poiGrid}>
          {POI_DATA.map(p => (
            <View key={p.id} style={styles.poiCard}>
                <Image source={{ uri: p.img }} style={styles.poiImage} />
                <Text style={styles.poiTitle}>{p.name}</Text>
                <View style={styles.poiInfoRow}>
                  <Text style={styles.poiType}>{p.type}</Text>
                  <Text style={styles.poiRating}>★ {p.rating}</Text>
                </View>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  subHeaderTitle: { fontWeight: 'bold', color: COLORS.darkText },
  poiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  poiCard: { width: (width - 60) / 2, backgroundColor: 'white', borderRadius: 16, padding: 8, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1, marginBottom: 12 },
  poiImage: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  poiTitle: { fontWeight: 'bold', fontSize: 14, color: COLORS.darkText },
  poiInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  poiType: { fontSize: 10, color: '#6b7280' },
  poiRating: { fontSize: 10, fontWeight: 'bold', color: COLORS.primaryOrange },
});