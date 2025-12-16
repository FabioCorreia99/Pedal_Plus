import {
    ArrowRight,
    Calendar,
    Filter,
    Heart,
    Home,
    MessageCircle,
    Star,
    Zap
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// --- CONSTANTES DE ESTILO ---
const COLORS = { 
  primaryGreen: "#5DBD76", 
  primaryOrange: "#FF9E46", 
  lightGray: "#F8F9FA", 
  darkText: "#1A1A1A",
  textGray: "#9ca3af",
  white: "#FFFFFF"
};

// --- DADOS MOCKADOS ---
const GROUPS_DATA = [
  { id: 1, name: "Ronaldo Time", desc: "bikers who like Ronaldo", img: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=100&h=100&fit=crop" },
  { id: 2, name: "Messi_Time", desc: "We hate Ronaldo", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=100&h=100&fit=crop" },
  { id: 3, name: "Trail Bikers", desc: "Join for fun, talks and hard routes", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=100&h=100&fit=crop" },
];

const POI_DATA = [
  { id: 1, name: "Vondelpark", type: "Parque", rating: 4.8, img: "https://images.unsplash.com/photo-1596423736768-45c117e3a632?w=500&fit=crop" },
  { id: 2, name: "Rijksmuseum", type: "Cultura", rating: 4.9, img: "https://images.unsplash.com/photo-1554463529-e27854014799?w=500&fit=crop" },
];

export default function CommunityScreen() {
  const [activeCategory, setActiveCategory] = useState<'Trending' | 'POI' | 'Groups' | 'Routes'>('Trending');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Componente de Botão de Filtro
  const FilterButton = ({ id, label, icon: Icon }: { id: typeof activeCategory, label: string, icon: any }) => (
    <TouchableOpacity onPress={() => setActiveCategory(id)} style={styles.filterBtnContainer}>
       <View style={[
         styles.filterIconBox, 
         activeCategory === id ? styles.filterIconBoxActive : styles.filterIconBoxInactive
       ]}>
          <Icon size={20} color={activeCategory === id ? 'white' : COLORS.primaryOrange}/>
       </View>
       <Text style={[
         styles.filterLabel, 
         { color: activeCategory === id ? COLORS.primaryOrange : COLORS.textGray }
       ]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: activeCategory === 'Trending' ? COLORS.lightGray : COLORS.primaryGreen }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
         {activeCategory === 'Trending' ? (
            <View style={styles.headerRow}>
               <View>
                  <Text style={styles.headerTitle}>Discover</Text>
                  <Text style={styles.headerSubtitle}>Dive into community-driven insights.</Text>
               </View>
               
               {/* Widget Leaderboard */}
               <TouchableOpacity onPress={() => setShowLeaderboard(true)} style={styles.leaderboardWidget}>
                  <Text style={styles.leaderboardText}>Leaderboard</Text>
                  <Star size={16} color={COLORS.primaryOrange} fill={COLORS.primaryOrange} style={{ marginTop: 4 }}/>
                  {/* Pequena simulação gráfica de pódio */}
                  <View style={styles.podiumContainer}>
                    <View style={styles.podiumBarSmall} />
                    <View style={styles.podiumBarTall} />
                    <View style={styles.podiumBarMedium} />
                  </View>
               </TouchableOpacity>
            </View>
         ) : (
            <View style={styles.headerRowCategory}>
               <Text style={styles.categoryTitle}>{activeCategory}</Text>
               {/* Podes adicionar um X aqui se quiseres fechar a categoria */}
            </View>
         )}
      </View>

      {/* CONTENT SHEET (Borda arredondada quando não é Trending) */}
      <View style={[
        styles.contentSheet, 
        activeCategory === 'Trending' ? { backgroundColor: 'transparent' } : { backgroundColor: '#F5F7F8', borderTopLeftRadius: 40, borderTopRightRadius: 40 }
      ]}>
         
         {/* SEARCH BAR */}
         <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
               <TextInput 
                 placeholder="Search..." 
                 placeholderTextColor="#9ca3af"
                 style={styles.searchInput} 
               />
               <TouchableOpacity style={styles.searchBtn}>
                 <ArrowRight size={16} color="white" />
               </TouchableOpacity>
            </View>
         </View>

         {/* FILTERS ROW */}
         <View style={styles.filtersRow}>
            <FilterButton id="Trending" label="Trending" icon={Home} />
            <FilterButton id="POI" label="POI" icon={Calendar} />
            <FilterButton id="Groups" label="Groups" icon={MessageCircle} />
            <FilterButton id="Routes" label="Routes" icon={Zap} />
         </View>

         {/* DYNAMIC CONTENT */}
         <ScrollView style={{ flex: 1, marginTop: 24 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            
            {/* 1. TRENDING VIEW */}
            {activeCategory === 'Trending' && (
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
            )}

            {/* 2. GROUPS VIEW */}
            {activeCategory === 'Groups' && (
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
            )}

            {/* 3. ROUTES VIEW */}
            {activeCategory === 'Routes' && (
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
            )}

            {/* 4. POI VIEW */}
            {activeCategory === 'POI' && (
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
            )}

         </ScrollView>
      </View>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerRowCategory: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: COLORS.darkText, fontWeight: 'bold' },
  categoryTitle: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, color: '#6b7280', maxWidth: 180, marginTop: 4, lineHeight: 18 },
  
  leaderboardWidget: { 
    backgroundColor: 'white', 
    padding: 8, 
    paddingHorizontal: 12, 
    borderRadius: 16, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ffedd5',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2
  },
  leaderboardText: { fontSize: 10, fontWeight: 'bold', color: COLORS.darkText },
  podiumContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 6 },
  podiumBarSmall: { width: 6, height: 8, backgroundColor: '#cbd5e1', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  podiumBarTall: { width: 6, height: 14, backgroundColor: COLORS.primaryOrange, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  podiumBarMedium: { width: 6, height: 10, backgroundColor: '#94a3b8', borderTopLeftRadius: 2, borderTopRightRadius: 2 },

  contentSheet: { flex: 1, overflow: 'hidden' },
  
  searchContainer: { paddingHorizontal: 24, marginTop: 24 },
  searchBox: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 6, 
    paddingVertical: 6, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    elevation: 2 
  },
  searchInput: { flex: 1, fontSize: 14, paddingHorizontal: 12, color: COLORS.darkText },
  searchBtn: { backgroundColor: COLORS.primaryOrange, padding: 8, borderRadius: 20 },

  filtersRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 24 },
  filterBtnContainer: { alignItems: 'center', width: 70 },
  filterIconBox: { 
    width: 48, height: 48, borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, marginBottom: 8, elevation: 2 
  },
  filterIconBoxActive: { backgroundColor: COLORS.primaryOrange, borderColor: COLORS.primaryOrange },
  filterIconBoxInactive: { backgroundColor: 'white', borderColor: '#ffedd5' },
  filterLabel: { fontSize: 10, fontWeight: 'bold' },

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

  subHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  subHeaderTitle: { fontWeight: 'bold', color: COLORS.darkText },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
  listImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee' },
  listItemTitle: { fontWeight: 'bold', color: COLORS.darkText },
  listItemDesc: { fontSize: 12, color: '#6b7280' },

  routeMiniInfo: { fontSize: 10, color: '#6b7280', marginTop: 4 },

  poiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  poiCard: { width: (width - 60) / 2, backgroundColor: 'white', borderRadius: 16, padding: 8, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1, marginBottom: 12 },
  poiImage: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  poiTitle: { fontWeight: 'bold', fontSize: 14, color: COLORS.darkText },
  poiInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  poiType: { fontSize: 10, color: '#6b7280' },
  poiRating: { fontSize: 10, fontWeight: 'bold', color: COLORS.primaryOrange },
});