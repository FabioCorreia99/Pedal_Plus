import { Calendar, Heart, Home, MessageCircle, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = { primaryOrange: "#FF9E46", lightGray: "#F8F9FA", darkText: "#1A1A1A", primaryGreen: "#5DBD76" };

export default function CommunityScreen() {
  const [activeCategory, setActiveCategory] = useState('Trending');

  const FilterButton = ({ id, label, icon: Icon }: any) => (
    <TouchableOpacity onPress={() => setActiveCategory(id)} style={{ alignItems: 'center', width: 70 }}>
       <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: activeCategory === id ? COLORS.primaryOrange : 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: activeCategory === id ? COLORS.primaryOrange : '#ffedd5', marginBottom: 8, elevation: 2 }}>
          <Icon size={20} color={activeCategory === id ? 'white' : COLORS.primaryOrange}/>
       </View>
       <Text style={{ fontSize: 10, fontWeight: 'bold', color: activeCategory === id ? COLORS.primaryOrange : '#9ca3af' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: activeCategory === 'Trending' ? COLORS.lightGray : COLORS.primaryGreen }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 }}>
         <Text style={{ fontSize: 32, fontWeight: 'bold', color: activeCategory === 'Trending' ? COLORS.darkText : 'white' }}>{activeCategory === 'Trending' ? 'Descobrir' : activeCategory}</Text>
      </View>
      <View style={styles.content}>
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 24 }}>
            <FilterButton id="Trending" label="Trending" icon={Home} />
            <FilterButton id="POI" label="POI" icon={Calendar} />
            <FilterButton id="Groups" label="Groups" icon={MessageCircle} />
            <FilterButton id="Routes" label="Routes" icon={Zap} />
         </View>
         <ScrollView style={{ flex: 1, marginTop: 24 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
             <View style={styles.feedCard}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=500" }} style={{ width: '100%', height: 160 }} />
                <View style={{ padding: 16 }}>
                   <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Passeio na Floresta</Text>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                      <Text style={{ fontSize: 12, color: '#666' }}>14 km • Dificuldade Média</Text>
                      <Heart size={16} color="#999" />
                   </View>
                </View>
             </View>
         </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: '#F5F7F8', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  feedCard: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', marginBottom: 24, elevation: 2 },
});