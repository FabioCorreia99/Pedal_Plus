import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import InteractiveMap from '../../components/InteractiveMap';

const COLORS = { primaryGreen: "#5DBD76", primaryOrange: "#FF9E46" };

export default function FavoritesScreen() {
  const [tab, setTab] = useState<'Routes' | 'Locations'>('Routes');
  
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 }}>
         <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Favoritos</Text>
         <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setTab('Routes')} style={[styles.tab, tab === 'Routes' && styles.tabActive]}><Text style={[styles.tabText, tab === 'Routes' ? {color:'black'} : {color:'white'}]}>Rotas</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('Locations')} style={[styles.tab, tab === 'Locations' && styles.tabActive]}><Text style={[styles.tabText, tab === 'Locations' ? {color:'black'} : {color:'white'}]}>Locais</Text></TouchableOpacity>
         </View>
      </View>
      <View style={styles.content}>
         <View style={styles.mapContainer}><InteractiveMap /></View>
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 16, alignItems: 'center' }}>
            <Text style={{ color: COLORS.primaryOrange, fontWeight: 'bold', fontSize: 18 }}>{tab === 'Routes' ? '8 Lugares' : '4 Lugares'}</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.primaryOrange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}><Text style={{ color: COLORS.primaryOrange, fontWeight: 'bold', fontSize: 12, marginRight: 4 }}>Ordenar</Text><ChevronDown size={14} color={COLORS.primaryOrange}/></TouchableOpacity>
         </View>
         <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.item}>
                 <Image source={{ uri: `https://source.unsplash.com/random/100x100?map,${i}` }} style={{ width: 56, height: 56, borderRadius: 28 }} />
                 <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={{ fontWeight: 'bold' }}>{tab === 'Routes' ? 'Rota Casa-Trabalho' : 'Casa'}</Text>
                    <Text style={{ fontSize: 12, color: '#999' }}>12km • 25min</Text>
                 </View>
                 <TouchableOpacity style={styles.goBtn}><Text style={{color:'white', fontWeight:'bold'}}>Ir</Text></TouchableOpacity>
              </View>
            ))}
         </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: { flex: 1, paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, alignItems: 'center' },
  tabActive: { backgroundColor: '#F5F7F8' },
  tabText: { fontWeight: 'bold' },
  content: { flex: 1, backgroundColor: '#F5F7F8', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  mapContainer: { height: 160, margin: 24, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  goBtn: { backgroundColor: COLORS.primaryOrange, paddingHorizontal: 24, paddingVertical: 8, borderRadius: 12 }
});