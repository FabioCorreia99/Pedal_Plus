import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  Dimensions,
  Modal
} from 'react-native';
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  Zap, 
  ChevronRight,
  Star,
  ArrowRight
} from 'lucide-react-native';

// --- IMPORTAÇÃO DOS COMPONENTES DA COMUNIDADE ---
import TrendingView from '../../components/community/TrendingView';
import GroupsView from '../../components/community/GroupsView';
import RoutesView from '../../components/community/RoutesView';
import POIView from '../../components/community/POIView';
import LeaderboardModal from '../../components/community/LeaderboardView';

// --- CONSTANTES E CORES ---
const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  lightGray: "#F5F7F8",
  textGray: "#9ca3af",
  white: "#FFFFFF",
  podium1: "#FCD34D", 
  podium2: "#CDE8E9", 
  podium3: "#FCA5A5", 
};

const { width } = Dimensions.get('window');

// --- COMPONENTE PRINCIPAL ---
export default function CommunityScreen() {
  const [activeCategory, setActiveCategory] = useState<'Trending' | 'POI' | 'Groups' | 'Routes'>('Trending');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // --- COMPONENTE DE FILTRO ---
  const FilterButton = ({ id, label, icon: Icon }: { id: typeof activeCategory, label: string, icon: any }) => (
    <TouchableOpacity onPress={() => setActiveCategory(id)} style={styles.filterBtnContainer}>
       <View style={[
         styles.filterIconBox, 
         activeCategory === id ? styles.filterIconBoxActive : styles.filterIconBoxInactive
       ]}>
          <Icon size={24} color={activeCategory === id ? 'white' : COLORS.primaryOrange} strokeWidth={2}/>
       </View>
       <Text style={[
         styles.filterLabel, 
         { color: activeCategory === id ? COLORS.primaryOrange : COLORS.textGray, fontWeight: activeCategory === id ? '700' : '400' }
       ]}>{label}</Text>
    </TouchableOpacity>
  );

  // --- RENDERIZADORES AUXILIARES ---
  const renderPodiumGraphic = () => (
    <View style={styles.podiumContainer}>
      <View style={styles.podiumColumnContainer}>
        <Text style={styles.podiumNumber}>2</Text>
        <View style={[styles.podiumBar, { height: 30, backgroundColor: COLORS.podium2 }]} />
      </View>
      <View style={styles.podiumColumnContainer}>
        <View style={styles.starIcon}><Text style={{fontSize: 12}}>⭐</Text></View>
        <Text style={styles.podiumNumber}>1</Text>
        <View style={[styles.podiumBar, { height: 40, backgroundColor: COLORS.podium1 }]} />
      </View>
      <View style={styles.podiumColumnContainer}>
        <Text style={styles.podiumNumber}>3</Text>
        <View style={[styles.podiumBar, { height: 20, backgroundColor: COLORS.podium3 }]} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: activeCategory === 'Trending' ? COLORS.white : COLORS.primaryGreen }]}>
      {/* CABEÇALHO VERDE RESTAURADO */}
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Community</Text>
        </View>
      </SafeAreaView>

      {/* ÁREA DE CONTEÚDO (SHEET) */}
      <View style={[
        styles.contentSheet, 
        activeCategory === 'Trending' 
          ? { backgroundColor: COLORS.white } 
          : { backgroundColor: '#F5F7F8', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }
      ]}>
         
         <ScrollView 
            style={styles.mainScroll} 
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
         >
            {/* Secção de Título Dinâmico (Discover ou Nome da Categoria) */}
            <View style={[styles.dynamicHeaderWrapper, activeCategory !== 'Trending' && { marginTop: 20 }]}>
               {activeCategory === 'Trending' ? (
                  <View style={styles.headerRowTrending}>
                     <View style={styles.headerTextContainer}>
                        <Text style={styles.discoverTitle}>Discover</Text>
                        <Text style={styles.discoverDesc}>Dive into community-driven insights with trending routes, hotspots and people to ride with.</Text>
                     </View>
                     
                     <TouchableOpacity onPress={() => setShowLeaderboard(true)} style={styles.leaderboardWidget}>
                        <Text style={styles.leaderboardLabel}>Leaderboard</Text>
                        {renderPodiumGraphic()}
                     </TouchableOpacity>
                  </View>
               ) : (
                  <View style={styles.headerRowCategory}>
                     {/* Se quiseres o título da categoria aqui dentro também: */}
                     <Text style={styles.categorySheetTitle}>{activeCategory}</Text>
                  </View>
               )}
            </View>

            {/* Barra de Pesquisa */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <TextInput 
                  placeholder="Search..." 
                  placeholderTextColor="#9ca3af" 
                  style={styles.searchInput} 
                  editable={false}
                />
                <TouchableOpacity style={styles.searchBtn}>
                  <ChevronRight size={20} color={COLORS.primaryOrange} />
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

            {/* Conteúdo das Views */}
            <View style={styles.dynamicContentArea}>
               {activeCategory === 'Trending' && <TrendingView />}
               {activeCategory === 'Groups' && <GroupsView />}
               {activeCategory === 'Routes' && <RoutesView />}
               {activeCategory === 'POI' && <POIView />}
            </View>
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
    flex: 1,
  },
  // Header Fixo
  headerSafeArea: {
    backgroundColor: COLORS.primaryGreen,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    alignItems: 'center', // Centra o título "Community"
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Sheet de Conteúdo
  contentSheet: {
    flex: 1, 
    width: '100%',
  },
  mainScroll: {
    flex: 1,
  },
  
  // Header Dinâmico (dentro do Scroll)
  dynamicHeaderWrapper: {
    paddingHorizontal: 20,
    marginTop: 35, // Aumentado para afastar do cabeçalho
    marginBottom: 35, // Aumentado espaçamento inferior
  },
  headerRowTrending: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  discoverTitle: {
    fontSize: 36, // Aumentado
    color: COLORS.darkText,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  discoverDesc: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  headerRowCategory: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categorySheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
    letterSpacing: 0.5,
  },

  // Leaderboard Widget
  leaderboardWidget: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12, // Aumentado
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 110, // Aumentado
    height: 110, // Altura fixa maior
    justifyContent: 'center',
  },
  leaderboardLabel: {
    fontSize: 12, // Aumentado
    color: COLORS.darkText,
    marginBottom: 8,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 30, 
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: COLORS.darkText,
    marginLeft: 5,
  },
  searchBtn: {
    padding: 5,
  },

  // Filters
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filterBtnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5, 
  },
  filterIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  filterIconBoxActive: {
    backgroundColor: COLORS.primaryOrange,
  },
  filterIconBoxInactive: {
    backgroundColor: COLORS.white,
  },
  filterLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Dynamic Content
  dynamicContentArea: {
    flex: 1,
  },

  // Podium Graphic (Mini)
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4, // Aumentado gap
    height: 60, // Aumentado altura total do container
  },
  podiumColumnContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  podiumBar: {
    width: 20, // Aumentado largura
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  podiumNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
  },
  starIcon: {
    marginBottom: -2,
    zIndex: 1,
  },
});