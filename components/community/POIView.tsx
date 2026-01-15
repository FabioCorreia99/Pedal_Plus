import { Filter, Heart, MapPin, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase'; // Ajusta o caminho se necessário

const { width } = Dimensions.get('window');

// --- CORES ---
const COLORS = { 
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A", 
  textGray: "#9ca3af",
  lightGray: "#F5F7F8",
  white: "#FFFFFF"
};

// Interface compatível com a tua tabela 'pois'
interface POIItem {
  id: string; // UUID
  name: string;
  category: string | null;
  likes_count: number;
  latitude?: number;
  longitude?: number;
  // Como a tabela não tem imagem, geramos visualmente ou usamos placeholder
}

// Função auxiliar para obter imagem baseada na categoria (já que não está no DB)
const getPlaceholderImage = (category: string | null) => {
  const cat = category ? category.toLowerCase() : '';
  if (cat.includes('parque') || cat.includes('park')) return 'https://images.unsplash.com/photo-1596423736768-45c117e3a632?w=500&fit=crop';
  if (cat.includes('museu') || cat.includes('museum')) return 'https://images.unsplash.com/photo-1554463529-e27854014799?w=500&fit=crop';
  if (cat.includes('caf') || cat.includes('food')) return 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&fit=crop';
  // Default
  return 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&fit=crop';
};

export default function POIView() {
  const [pois, setPois] = useState<POIItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPOIs();
  }, []);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      // Busca dados da tabela 'pois' ordenados por likes_count (Popularidade)
      const { data, error } = await supabase
        .from('pois')
        .select('*')
        .order('likes_count', { ascending: false });

      if (error) {
        console.error('Erro ao buscar POIs:', error.message);
      } else {
        setPois(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestPOI = () => {
    console.log("Navegar para sugerir POI");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryOrange} />
        <Text style={styles.loadingText}>Loading popular spots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sub-Header com Filtro e Botão de Sugerir */}
      <View style={styles.subHeaderRow}>
        <Text style={styles.subHeaderTitle}>Popular Spots</Text>
        
        <View style={styles.actionsRow}>
           {pois.length > 0 && (
            <TouchableOpacity onPress={handleSuggestPOI} style={styles.createMiniBtn}>
              <Plus size={16} color={COLORS.primaryOrange} />
              <Text style={styles.createMiniText}>Suggest</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity>
             <Filter size={20} color={COLORS.textGray}/>
          </TouchableOpacity>
        </View>
      </View>
      
      {pois.length === 0 ? (
        // --- EMPTY STATE ---
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MapPin size={48} color={COLORS.primaryGreen} /> 
          </View>
          
          <Text style={styles.emptyTitle}>No Spots Found</Text>
          <Text style={styles.emptyDesc}>
            It seems there are no points of interest listed yet. Be the first to share a hidden gem!
          </Text>

          <TouchableOpacity 
            style={styles.createMainBtn}
            onPress={handleSuggestPOI}
            activeOpacity={0.8}
          >
            <Plus size={20} color="white" style={{marginRight: 8}} />
            <Text style={styles.createMainBtnText}>Suggest a Spot</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // --- GRID DE POIS ---
        <View style={styles.poiGrid}>
            {pois.map(p => (
              <TouchableOpacity key={p.id} style={styles.poiCard} activeOpacity={0.9}>
                  <Image 
                    source={{ uri: getPlaceholderImage(p.category) }} 
                    style={styles.poiImage} 
                  />
                  
                  <View style={styles.cardContent}>
                    <Text style={styles.poiTitle} numberOfLines={1}>{p.name}</Text>
                    
                    <View style={styles.poiInfoRow}>
                      <Text style={styles.poiType}>{p.category || 'Spot'}</Text>
                      <View style={styles.ratingBadge}>
                        <Heart size={10} color={COLORS.primaryOrange} fill={COLORS.primaryOrange} style={{marginRight: 4}} />
                        <Text style={styles.poiRating}>{p.likes_count || 0}</Text>
                      </View>
                    </View>
                  </View>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  
  // Header
  subHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20, 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subHeaderTitle: { 
    fontSize: 18,
    fontWeight: '700', 
    color: COLORS.darkText 
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  createMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  createMiniText: {
    fontSize: 12,
    color: COLORS.primaryOrange,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Grid & Card
  poiGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, // Espaço entre os cartões
    paddingHorizontal: 20, 
  },
  poiCard: { 
    // Cálculo: (LarguraTotal - PaddingHorizontal(40) - Gap(12)) / 2 colunas
    width: (width - 52) / 2, 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 8, 
    // Sombras
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, 
    shadowRadius: 4,
    elevation: 3, 
    marginBottom: 4 
  },
  poiImage: { 
    width: '100%', 
    height: 110, 
    borderRadius: 12, 
    marginBottom: 8,
    backgroundColor: '#eee'
  },
  cardContent: {
    paddingHorizontal: 4,
    paddingBottom: 4
  },
  poiTitle: { 
    fontWeight: '700', 
    fontSize: 14, 
    color: COLORS.darkText,
    marginBottom: 4
  },
  poiInfoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 2 
  },
  poiType: { 
    fontSize: 11, 
    color: COLORS.textGray,
    flex: 1,
    marginRight: 4,
    textTransform: 'capitalize'
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  poiRating: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: COLORS.primaryOrange 
  },

  // Loading
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textGray,
    fontSize: 14
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EAFDF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  createMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createMainBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});