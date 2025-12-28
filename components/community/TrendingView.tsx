import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';

const COLORS = { primaryOrange: "#FF9E46", darkText: "#1A1A1A", textGray: "#9ca3af" };

export default function TrendingView() {
  return (
    <View>
      {/* Card Grande de Rota */}
      <View style={styles.feedCard}>
          <Image source={{ uri: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800" }} style={styles.feedImage} />
          <View style={styles.feedCardContent}>
            <Text style={styles.feedTitle}>Forest Loop</Text>
            <View style={styles.feedRouteInfo}>
                <Text style={styles.routeText}>
                  <Text style={{color:COLORS.primaryOrange}}>●</Text> Gedung E <Text style={{color:'#ccc'}}>•••</Text> <Text style={{color:'#ef4444'}}>●</Text> Gedung D
                </Text>
                <Heart size={16} color="#9ca3af"/>
            </View>
          </View>
      </View>

      <Text style={styles.sectionTitle}>Feed Activity</Text>
      
      {/* Item de Feed Simples */}
      <View style={styles.activityItem}>
          <Image source={{ uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100" }} style={styles.avatarSmall} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.userName}>Georg Knorr</Text>
            <Text style={styles.dateText}>Wednesday, Nov 5, 2025</Text>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedCard: { 
    backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', marginBottom: 24, 
    shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 
  },
  feedImage: { width: '100%', height: 160 },
  feedCardContent: { padding: 16 },
  feedTitle: { fontWeight: 'bold', fontSize: 16, color: COLORS.darkText },
  feedRouteInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  routeText: { fontSize: 12, color: '#6b7280', fontWeight: 'bold' },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 16, color: COLORS.darkText },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarSmall: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#eee' },
  userName: { fontWeight: 'bold', color: COLORS.darkText },
  dateText: { fontSize: 12, color: '#6b7280' },
});