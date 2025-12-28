import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Filter, Heart } from 'lucide-react-native';

const COLORS = { primaryOrange: "#FF9E46", darkText: "#1A1A1A", textGray: "#9ca3af" };

export default function RoutesView() {
  return (
    <View>
      <View style={styles.subHeaderRow}>
        <Text style={styles.subHeaderTitle}>Top Routes</Text>
        <Filter size={16} color="#9ca3af"/>
      </View>
      
      {[1,2].map(i => (
          <View key={i} style={styles.feedCard}>
            <Image source={{ uri: `https://source.unsplash.com/random/500x300?forest,road,${i}` }} style={{ width: '100%', height: 120 }} />
            <View style={styles.feedCardContent}>
                <View>
                  <Text style={styles.feedTitle}>Route Name</Text>
                  <Text style={styles.routeMiniInfo}>
                    <Text style={{color:COLORS.primaryOrange}}>●</Text> A <Text style={{color:'#ccc'}}>••</Text> <Text style={{color:'#ef4444'}}>●</Text> B  <Text style={{marginLeft:8}}>13km 17min</Text>
                  </Text>
                </View>
                <Heart size={16} color="#9ca3af"/>
            </View>
          </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  subHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  subHeaderTitle: { fontWeight: 'bold', color: COLORS.darkText },
  feedCard: { 
    backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', marginBottom: 24, 
    shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 
  },
  feedCardContent: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedTitle: { fontWeight: 'bold', fontSize: 16, color: COLORS.darkText },
  routeMiniInfo: { fontSize: 10, color: '#6b7280', marginTop: 4 },
});