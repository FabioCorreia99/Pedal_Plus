import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Filter, Heart, Zap, Clock, Map, Plus } from 'lucide-react-native';
import { supabase } from '../../lib/supabase'; // Ajusta o caminho se necessário

const COLORS = { 
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A", 
  textGray: "#9ca3af",
  lightGray: "#F5F7F8",
  white: "#FFFFFF"
};

// Interface correspondente à tabela 'routes'
interface RouteItem {
  id: string; // UUID
  name: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  distance_km: number | null;
  estimated_duration_min: number | null;
  cover_photo_url: string | null;
  likes_count: number;
}

export default function RoutesView() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      // Busca rotas ordenadas por popularidade (likes)
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('likes_count', { ascending: false });

      if (error) {
        console.error('Erro ao buscar rotas:', error.message);
      } else {
        setRoutes(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = () => {
    console.log("Navegar para criar rota");
    // navigation.navigate('CreateRoute');
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'hard': return '#EF4444'; // Red
      case 'medium': return '#F59E0B'; // Amber
      case 'easy': return COLORS.primaryGreen;
      default: return COLORS.textGray;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryOrange} />
        <Text style={styles.loadingText}>Loading top routes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sub-Header */}
      <View style={styles.subHeaderRow}>
        <Text style={styles.subHeaderTitle}>Top Routes</Text>
        
        <View style={styles.actionsRow}>
          {routes.length > 0 && (
            <TouchableOpacity onPress={handleCreateRoute} style={styles.createMiniBtn}>
              <Plus size={16} color={COLORS.primaryOrange} />
              <Text style={styles.createMiniText}>Create</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity>
             <Filter size={20} color={COLORS.textGray}/>
          </TouchableOpacity>
        </View>
      </View>
      
      {routes.length === 0 ? (
        // --- EMPTY STATE ---
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Zap size={48} color={COLORS.primaryGreen} /> 
          </View>
          
          <Text style={styles.emptyTitle}>No Routes Yet</Text>
          <Text style={styles.emptyDesc}>
            Be the first to map a path! Create a route and share your favorite cycling trails with the community.
          </Text>

          <TouchableOpacity 
            style={styles.createMainBtn}
            onPress={handleCreateRoute}
            activeOpacity={0.8}
          >
            <Plus size={20} color="white" style={{marginRight: 8}} />
            <Text style={styles.createMainBtnText}>Create Route</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // --- LISTA DE ROTAS ---
        <View style={styles.routesList}>
          {routes.map(route => (
              <TouchableOpacity key={route.id} style={styles.routeCard} activeOpacity={0.9}>
                {/* Imagem de Capa */}
                <Image 
                  source={{ 
                    uri: route.cover_photo_url || `https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=500&auto=format&fit=crop` 
                  }} 
                  style={styles.cardImage} 
                />
                
                {/* Badge de Dificuldade (Overlay) */}
                {route.difficulty && (
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(route.difficulty) }]}>
                    <Text style={styles.difficultyText}>{route.difficulty}</Text>
                  </View>
                )}

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.routeTitle}>{route.name}</Text>
                      <View style={styles.likesContainer}>
                         <Heart size={14} color={COLORS.textGray} />
                         <Text style={styles.likesText}>{route.likes_count || 0}</Text>
                      </View>
                    </View>
                    
                    {/* Linha de Detalhes (Distância e Duração) */}
                    <View style={styles.routeDetailsRow}>
                      <View style={styles.detailItem}>
                         <Map size={14} color={COLORS.primaryOrange} />
                         <Text style={styles.detailText}>
                           {route.distance_km ? `${route.distance_km} km` : '-'}
                         </Text>
                      </View>
                      
                      <Text style={styles.divider}>•</Text>
                      
                      <View style={styles.detailItem}>
                         <Clock size={14} color={COLORS.textGray} />
                         <Text style={styles.detailText}>
                           {route.estimated_duration_min ? `${route.estimated_duration_min} min` : '-'}
                         </Text>
                      </View>
                    </View>

                    {/* Descrição Curta (opcional) */}
                    {route.description && (
                      <Text style={styles.routeDesc} numberOfLines={1}>
                        {route.description}
                      </Text>
                    )}
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

  // Route Card
  routesList: {
    paddingHorizontal: 20,
  },
  routeCard: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    overflow: 'hidden', 
    marginBottom: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, 
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  cardImage: { 
    width: '100%', 
    height: 140,
    backgroundColor: '#eee'
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardContent: { 
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeTitle: { 
    fontWeight: '700', 
    fontSize: 16, 
    color: COLORS.darkText,
    flex: 1,
    marginRight: 10,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  routeDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  divider: {
    marginHorizontal: 8,
    color: '#ddd',
  },
  routeDesc: { 
    fontSize: 12, 
    color: COLORS.textGray, 
    marginTop: 4 
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