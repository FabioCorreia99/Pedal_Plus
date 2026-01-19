import {
  ArrowLeft,
  Clock,
  Heart,
  Map as MapIcon,
  Navigation,
  TrendingUp
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

import InteractiveMap from '../InteractiveMap';

import { useNavigationIntent } from '@/context/NavigationContext';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router'; // or your navigation library
import { LatLng } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  textGray: "#9ca3af",
  lightGray: "#F5F7F8",
  white: "#FFFFFF",
  red: "#ef4444"
};

interface RouteDetailProps {
  visible: boolean;
  routeId: string | null;
  onClose: () => void;
}

interface RouteData {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  distance_km: number;
  estimated_duration_min: number;
  path_data: any; 
  creator_id: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export default function RouteDetailView({ visible, routeId, onClose }: RouteDetailProps) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [mapCoordinates, setMapCoordinates] = useState<{latitude: number, longitude: number}[]>([]);
  const [origin, setOrigin] = useState<{latitude: number, longitude: number} | undefined>(undefined);
  const [destination, setDestination] = useState<{latitude: number, longitude: number} | undefined>(undefined);

  const { setIntent } = useNavigationIntent();
  const router = useRouter();

  const handleStartNavigation = async () => {
    if (!origin || !destination) {
      Alert.alert('Erro', 'Não foi possível carregar os pontos da rota.');
      return;
    }

    const currentLoc = await Location.getCurrentPositionAsync({});
    const userPosition = {
      latitude: currentLoc.coords.latitude,
      longitude: currentLoc.coords.longitude,
    };

    const distanceToOrigin = calculateDistance(userPosition, origin);

    if (distanceToOrigin > 0.05) {
      Alert.alert(
        'Navegar até o Início',
        `Você está a ${(distanceToOrigin).toFixed(1)}km do início da rota. Deseja navegar até lá primeiro?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Navegar para o Início',
            onPress: () => {
              // Use staged-route for two-phase navigation
              setIntent({
                type: 'staged-route',
                currentOrigin: userPosition,
                routeOrigin: origin,
                routeDestination: destination,
                currentOriginLabel: 'Localização Atual',
                routeOriginLabel: route?.name + ' (Início)' || 'Início da Rota',
                routeDestinationLabel: route?.name + ' (Fim)' || 'Fim da Rota',
              });
              onClose();
              router.push('/(tabs)');
            },
          },
        ]
      );
    } else {
      // User is close enough, start the route navigation directly
      setIntent({
        type: 'route',
        origin: origin,
        destination: destination,
        originLabel: route?.name + ' (Início)' || 'Origem',
        destinationLabel: route?.name + ' (Fim)' || 'Destino',
      });
      onClose();
      router.push('/(tabs)');
    }
  };

  // Add this distance calculation helper
  const calculateDistance = (point1: LatLng, point2: LatLng) => {
    const R = 6371; // Earth radius in km
    const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.latitude * Math.PI) / 180) *
      Math.cos((point2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (visible && routeId) {
      fetchRouteDetails();
    }
  }, [visible, routeId]);

  const fetchRouteDetails = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // 1. Buscar Detalhes da Rota
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          profiles:profiles!routes_creator_id_fkey (
            full_name, 
            username, 
            avatar_url
          )
        `)
        .eq('id', routeId)
        .single();

      if (error) throw error;

      // 2. Contar likes reais
      const { count: realLikeCount } = await supabase
        .from('route_likes')
        .select('*', { count: 'exact', head: true }) 
        .eq('route_id', routeId);

      let userLiked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from('route_likes')
          .select('user_id')
          .eq('route_id', routeId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        userLiked = !!likeData;
      }

      setRoute(data);
      setLikesCount(realLikeCount || 0);
      setIsLiked(userLiked);

      // 3. Processar GeoJSON
      if (data.path_data && data.path_data.coordinates) {
        const coords = data.path_data.coordinates.map((coord: number[]) => ({
          latitude: coord[1], 
          longitude: coord[0]
        }));
        
        setMapCoordinates(coords);
        if (coords.length > 0) {
          setOrigin(coords[0]);
          setDestination(coords[coords.length - 1]);
        }
      }

    } catch (error) {
      console.error('Error loading route:', error);
      Alert.alert('Erro', 'Não foi possível carregar a rota.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userId) return;

    const newStatus = !isLiked;
    setIsLiked(newStatus);
    setLikesCount(prev => newStatus ? prev + 1 : prev - 1);

    try {
      if (newStatus) {
        await supabase.from('route_likes').insert({ route_id: routeId, user_id: userId });
      } else {
        await supabase.from('route_likes').delete().eq('route_id', routeId).eq('user_id', userId);
      }
    } catch (error) {
      console.error('Like error:', error);
      setIsLiked(!newStatus);
      setLikesCount(prev => !newStatus ? prev + 1 : prev - 1);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'hard': return COLORS.red;
      case 'medium': return COLORS.primaryOrange;
      default: return COLORS.primaryGreen;
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'hard': return 'Difícil';
      case 'medium': return 'Moderado';
      default: return 'Fácil';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen" 
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        
        {/* --- MAPA --- */}
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.loadingMap}>
              <ActivityIndicator color={COLORS.primaryGreen} />
            </View>
          ) : (
            <InteractiveMap
              zoom={15} // Aumentado para aproximar mais a câmara
              showRoute={true}
              origin={origin}
              destination={destination}
              routeCoordinates={mapCoordinates}
              mapPaddingBottom={10} // Padding mínimo para maximizar o espaço da rota
            />
          )}

          {/* Header Flutuante */}
          <View style={styles.floatingHeader}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <ArrowLeft color={COLORS.darkText} size={24} />
            </TouchableOpacity>
            
            <View style={styles.rightHeaderBtns}>
              <TouchableOpacity style={[styles.iconBtn, {marginLeft: 8}]} onPress={handleLike}>
                <Heart 
                  color={isLiked ? COLORS.red : COLORS.darkText} 
                  fill={isLiked ? COLORS.red : 'transparent'} 
                  size={24} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- DETALHES --- */}
        <View style={styles.sheetContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primaryGreen} style={{marginTop: 40}} />
          ) : (
            <>
              {/* Pega visual */}
              <View style={styles.dragHandle} />

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
                
                {/* Título e Autor */}
                <View style={styles.titleSection}>
                  <Text style={styles.routeTitle}>{route?.name}</Text>
                  
                  <View style={styles.authorRow}>
                    <Image 
                      source={{ uri: route?.profiles?.avatar_url || "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg" }} 
                      style={styles.authorAvatar} 
                    />
                    <View>
                      <Text style={styles.authorLabel}>Criado por</Text>
                      <Text style={styles.authorName}>
                        {route?.profiles?.full_name || route?.profiles?.username || 'Desconhecido'}
                      </Text>
                    </View>
                    <View style={styles.likesBadge}>
                      <Heart size={12} color={COLORS.red} fill={COLORS.red} />
                      <Text style={styles.likesText}>{likesCount}</Text>
                    </View>
                  </View>
                </View>

                {/* Estatísticas */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <MapIcon size={20} color={COLORS.textGray} />
                    <Text style={styles.statValue}>{route?.distance_km} km</Text>
                    <Text style={styles.statLabel}>Distância</Text>
                  </View>
                  
                  <View style={[styles.statItem, styles.statBorder]}>
                    <Clock size={20} color={COLORS.textGray} />
                    <Text style={styles.statValue}>{route?.estimated_duration_min} min</Text>
                    <Text style={styles.statLabel}>Duração</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <TrendingUp size={20} color={getDifficultyColor(route?.difficulty || 'easy')} />
                    <Text style={[styles.statValue, {color: getDifficultyColor(route?.difficulty || 'easy')}]}>
                      {getDifficultyLabel(route?.difficulty || 'easy')}
                    </Text>
                    <Text style={styles.statLabel}>Dificuldade</Text>
                  </View>
                </View>

                {/* Descrição */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sobre a Rota</Text>
                  <Text style={styles.description}>
                    {route?.description || "Sem descrição fornecida pelo criador."}
                  </Text>
                </View>

              </ScrollView>

              {/* Botão Flutuante */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.startBtn} onPress={handleStartNavigation}>
                  <Navigation size={24} color="white" />
                  <Text style={styles.startBtnText}>Iniciar Navegação</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', 
  },
  mapContainer: {
    // Altura de 40% permite um melhor ajuste do zoom (fitCoordinates) sem perder a estética
    height: height * 0.38, 
    width: '100%',
  },
  loadingMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  rightHeaderBtns: {
    flexDirection: 'row',
  },

  // Sheet Container
  sheetContainer: {
    flex: 1,
    marginTop: -25, // Sobreposição
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },

  // Conteúdo
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  routeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  authorLabel: {
    fontSize: 11,
    color: COLORS.textGray,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  likesBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  likesText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.red,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F0F0F0',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textGray,
    textTransform: 'uppercase',
  },

  // Descrição
  section: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },

  // Footer Button
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  startBtn: {
    backgroundColor: COLORS.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});