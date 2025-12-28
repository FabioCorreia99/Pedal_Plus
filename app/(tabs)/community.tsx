import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  StyleSheet, 
  Platform, 
  StatusBar,
  SafeAreaView
} from 'react-native';
import { 
  Star, 
  Home, 
  Calendar, 
  MessageCircle, 
  Zap, 
  ArrowRight 
} from 'lucide-react-native';

// --- IMPORTAÇÃO DOS COMPONENTES DA COMUNIDADE ---
// Certifica-te de que criaste estes ficheiros na pasta 'components/community'
import TrendingView from '../../components/community/TrendingView';
import GroupsView from '../../components/community/GroupsView';
import RoutesView from '../../components/community/RoutesView';
import POIView from '../../components/community/POIView';
import LeaderboardModal from '../../components/community/LeaderboardModal';

const COLORS = { 
  primaryGreen: "#5DBD76", 
  primaryOrange: "#FF9E46", 
  lightGray: "#F8F9FA", 
  darkText: "#1A1A1A",
  textGray: "#9ca3af",
  white: "#FFFFFF"
};

export default function CommunityScreen() {
  const [activeCategory, setActiveCategory] = useState<'Trending' | 'POI' | 'Groups' | 'Routes'>('Trending');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Botão de Filtro Reutilizável
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
      <StatusBar barStyle={activeCategory === 'Trending' ? "dark-content" : "light-content"} />
      
      {/* 1. HEADER (Muda conforme a categoria) */}
      <SafeAreaView>
        <View style={styles.header}>
           {activeCategory === 'Trending' ? (
              <View style={styles.headerRow}>
                 <View>
                    <Text style={styles.headerTitle}>Discover</Text>
                    <Text style={styles.headerSubtitle}>Dive into community-driven insights.</Text>
                 </View>
                 
                 {/* Botão Leaderboard */}
                 <TouchableOpacity onPress={() => setShowLeaderboard(true)} style={styles.leaderboardWidget}>
                    <Text style={styles.leaderboardText}>Leaderboard</Text>
                    <Star size={16} color={COLORS.primaryOrange} fill={COLORS.primaryOrange} style={{ marginTop: 4 }}/>
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
                 {/* Botão opcional para voltar ao Trending */}
                 {/* <TouchableOpacity onPress={() => setActiveCategory('Trending')}><X color="white" size={24} /></TouchableOpacity> */}
              </View>
           )}
        </View>
      </SafeAreaView>

      {/* 2. ÁREA DE CONTEÚDO (SHEET) */}
      <View style={[
        styles.contentSheet, 
        activeCategory === 'Trending' ? { backgroundColor: 'transparent' } : { backgroundColor: '#F5F7F8', borderTopLeftRadius: 40, borderTopRightRadius: 40 }
      ]}>
         
         {/* Barra de Pesquisa */}
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

         {/* Filtros */}
         <View style={styles.filtersRow}>
            <FilterButton id="Trending" label="Trending" icon={Home} />
            <FilterButton id="POI" label="POI" icon={Calendar} />
            <FilterButton id="Groups" label="Groups" icon={MessageCircle} />
            <FilterButton id="Routes" label="Routes" icon={Zap} />
         </View>

         {/* Conteúdo Dinâmico */}
         <ScrollView 
           style={{ flex: 1, marginTop: 24 }} 
           contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} 
           showsVerticalScrollIndicator={false}
         >
            {activeCategory === 'Trending' && <TrendingView />}
            {activeCategory === 'Groups' && <GroupsView />}
            {activeCategory === 'Routes' && <RoutesView />}
            {activeCategory === 'POI' && <POIView />}
         </ScrollView>
      </View>
      
      {/* Modal Sobreposto */}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    paddingTop: Platform.OS === 'android' ? 40 : 10, 
    paddingHorizontal: 24, 
    paddingBottom: 16 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  headerRowCategory: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 10
  },
  headerTitle: { 
    fontSize: 32, 
    color: COLORS.darkText, 
    fontWeight: 'bold',
    // fontFamily: 'Serif', // Opcional
  },
  categoryTitle: { 
    fontSize: 24, 
    color: 'white', 
    fontWeight: 'bold' 
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: '#6b7280', 
    maxWidth: 180, 
    marginTop: 4, 
    lineHeight: 18 
  },
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
  leaderboardText: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: COLORS.darkText 
  },
  podiumContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: 2, 
    marginTop: 6 
  },
  podiumBarSmall: { 
    width: 6, 
    height: 8, 
    backgroundColor: '#cbd5e1', 
    borderTopLeftRadius: 2, 
    borderTopRightRadius: 2 
  },
  podiumBarTall: { 
    width: 6, 
    height: 14, 
    backgroundColor: COLORS.primaryOrange, 
    borderTopLeftRadius: 2, 
    borderTopRightRadius: 2 
  },
  podiumBarMedium: { 
    width: 6, 
    height: 10, 
    backgroundColor: '#94a3b8', 
    borderTopLeftRadius: 2, 
    borderTopRightRadius: 2 
  },
  contentSheet: { 
    flex: 1, 
    overflow: 'hidden' 
  },
  searchContainer: { 
    paddingHorizontal: 24, 
    marginTop: 24 
  },
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
  searchInput: { 
    flex: 1, 
    fontSize: 14, 
    paddingHorizontal: 12, 
    color: COLORS.darkText 
  },
  searchBtn: { 
    backgroundColor: COLORS.primaryOrange, 
    padding: 8, 
    borderRadius: 20 
  },
  filtersRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    marginTop: 24 
  },
  filterBtnContainer: { 
    alignItems: 'center', 
    width: 70 
  },
  filterIconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    marginBottom: 8, 
    elevation: 2 
  },
  filterIconBoxActive: { 
    backgroundColor: COLORS.primaryOrange, 
    borderColor: COLORS.primaryOrange 
  },
  filterIconBoxInactive: { 
    backgroundColor: 'white', 
    borderColor: '#ffedd5' 
  },
  filterLabel: { 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
});