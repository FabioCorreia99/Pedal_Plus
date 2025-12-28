import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Filter } from 'lucide-react-native';

const COLORS = { darkText: "#1A1A1A", textGray: "#9ca3af" };

const GROUPS_DATA = [
  { id: 1, name: "Ronaldo Time", desc: "bikers who like Ronaldo", img: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=100&h=100&fit=crop" },
  { id: 2, name: "Messi_Time", desc: "We hate Ronaldo", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=100&h=100&fit=crop" },
  { id: 3, name: "Trail Bikers", desc: "Join for fun, talks and hard routes", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=100&h=100&fit=crop" },
];

export default function GroupsView() {
  return (
    <View>
      <View style={styles.subHeaderRow}>
        <Text style={styles.subHeaderTitle}>Following Groups</Text>
        <Filter size={16} color="#9ca3af"/>
      </View>
      
      {GROUPS_DATA.map(g => (
          <View key={g.id} style={styles.listItem}>
            <Image source={{ uri: g.img }} style={styles.listImage} />
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.listItemTitle}>{g.name}</Text>
                <Text style={styles.listItemDesc}>{g.desc}</Text>
            </View>
          </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  subHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  subHeaderTitle: { fontWeight: 'bold', color: COLORS.darkText },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
  listImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee' },
  listItemTitle: { fontWeight: 'bold', color: COLORS.darkText },
  listItemDesc: { fontSize: 12, color: '#6b7280' },
});