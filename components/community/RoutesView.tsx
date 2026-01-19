import { Clock, Filter, Heart, Map, Plus, Zap } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import RouteDetailView from "./RouteDetailView";

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  textGray: "#9ca3af",
  lightGray: "#F5F7F8",
  white: "#FFFFFF",
  red: "#ef4444",
};

interface RouteItem {
  id: string;
  name: string;
  description: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  distance_km: number | null;
  estimated_duration_min: number | null;
  cover_photo_url: string | null;
  likes_count: number;
  user_has_liked: boolean; // Controlado localmente
}

// --- COMPONENTE AUXILIAR PARA IMAGENS SEGURAS ---
// Tenta carregar a URL da BD, se falhar (erro 404 ou file:// inválido), usa o fallback
const SafeRouteImage = ({ uri, style }: { uri: string | null; style: any }) => {
  const [hasError, setHasError] = useState(false);
  const fallback = "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=500&auto=format&fit=crop";

  return (
    <Image
      source={{ uri: (!hasError && uri) ? uri : fallback }}
      style={style}
      onError={() => setHasError(true)} // Se der erro ao carregar, ativa o fallback
      resizeMode="cover"
    />
  );
};

export default function RoutesView() {
  const [allRoutes, setAllRoutes] = useState<RouteItem[]>([]);
  const [likedRoutes, setLikedRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || null;
      setUserId(currentUserId);

      // 1. Buscar TODAS as rotas
      const { data: routesData, error: routesError } = await supabase
        .from("routes")
        .select(`
          *,
          route_likes (user_id)
        `);

      if (routesError) throw routesError;

      const processedAllRoutes = (routesData || []).map((route: any) => {
        const realLikesCount = route.route_likes ? route.route_likes.length : 0;
        
        return {
          ...route,
          user_has_liked: currentUserId 
            ? route.route_likes.some((like: any) => like.user_id === currentUserId)
            : false,
          likes_count: realLikesCount,
          route_likes: undefined
        };
      });

      processedAllRoutes.sort((a: any, b: any) => b.likes_count - a.likes_count);

      setAllRoutes(processedAllRoutes);

      // 2. Buscar APENAS as rotas que eu dei like
      if (currentUserId) {
        const { data: likedData, error: likedError } = await supabase
          .from("route_likes")
          .select(`
            routes (*)
          `)
          .eq("user_id", currentUserId);

        if (likedError) throw likedError;

        const processedLikedRoutes = (likedData || [])
          .map((item: any) => item.routes)
          .filter((r: any) => r !== null)
          .map((route: any) => {
            const match = processedAllRoutes.find((r: any) => r.id === route.id);
            return {
              ...route,
              user_has_liked: true,
              likes_count: match ? match.likes_count : 0
            };
          });

        setLikedRoutes(processedLikedRoutes);
      }

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (routeId: string, currentStatus: boolean) => {
    if (!userId) return;

    const newStatus = !currentStatus;
    
    setAllRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          user_has_liked: newStatus,
          likes_count: newStatus ? r.likes_count + 1 : r.likes_count - 1
        };
      }
      return r;
    }));

    if (newStatus) {
      const routeToAdd = allRoutes.find(r => r.id === routeId);
      if (routeToAdd) {
        setLikedRoutes(prev => [{ ...routeToAdd, user_has_liked: true, likes_count: routeToAdd.likes_count + 1 }, ...prev]);
      }
    } else {
      setLikedRoutes(prev => prev.filter(r => r.id !== routeId));
    }

    try {
      if (newStatus) {
        await supabase.from('route_likes').insert({ route_id: routeId, user_id: userId });
      } else {
        await supabase.from('route_likes').delete().eq('route_id', routeId).eq('user_id', userId);
      }
    } catch (error) {
      console.error("Erro ao dar like:", error);
      fetchData(); 
    }
  };

  const handleCreateRoute = () => {
    console.log("Navegar para criar rota");
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "hard": return "#EF4444";
      case "medium": return "#F59E0B";
      case "easy": return COLORS.primaryGreen;
      default: return COLORS.textGray;
    }
  };

  // --- RENDERIZADORES ---

  const renderSmallCard = ({ item }: { item: RouteItem }) => (
    <TouchableOpacity 
      style={styles.smallCard} 
      activeOpacity={0.8}
      onPress={() => setSelectedRouteId(item.id)}
    >
      {/* Usar SafeRouteImage em vez de Image direta */}
      <SafeRouteImage 
        uri={item.cover_photo_url} 
        style={styles.smallCardImage} 
      />
      
      <View style={styles.smallCardContent}>
        <Text style={styles.smallCardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.smallCardRow}>
          <Map size={12} color={COLORS.primaryOrange} />
          <Text style={styles.smallCardText}>{item.distance_km || 0}km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBigCard = ({ item }: { item: RouteItem }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.routeCard}
      activeOpacity={0.9}
      onPress={() => setSelectedRouteId(item.id)}
    >
      {/* Usar SafeRouteImage em vez de Image direta */}
      <SafeRouteImage 
        uri={item.cover_photo_url} 
        style={styles.cardImage} 
      />

      {item.difficulty && (
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.routeTitle}>{item.name}</Text>
          
          <TouchableOpacity 
            style={styles.likesContainer} 
            onPress={() => handleLike(item.id, item.user_has_liked)}
          >
            <Heart 
              size={18} 
              color={item.user_has_liked ? COLORS.red : COLORS.textGray} 
              fill={item.user_has_liked ? COLORS.red : "transparent"} 
            />
            <Text style={[styles.likesText, item.user_has_liked && {color: COLORS.red}]}>
              {item.likes_count || 0}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.routeDetailsRow}>
          <View style={styles.detailItem}>
            <Map size={14} color={COLORS.primaryOrange} />
            <Text style={styles.detailText}>
              {item.distance_km ? `${item.distance_km} km` : "-"}
            </Text>
          </View>
          <Text style={styles.divider}>•</Text>
          <View style={styles.detailItem}>
            <Clock size={14} color={COLORS.textGray} />
            <Text style={styles.detailText}>
              {item.estimated_duration_min ? `${item.estimated_duration_min} min` : "-"}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.routeDesc} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* SECÇÃO FAVORITOS (Agora em cima) */}
      {likedRoutes.length > 0 && (
        <View style={styles.favSection}>
          <Text style={styles.favSectionTitle}>As Tuas Favoritas</Text>
          <FlatList
            horizontal
            data={likedRoutes}
            renderItem={renderSmallCard}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          />
        </View>
      )}

      <View style={styles.subHeaderRow}>
        <Text style={styles.subHeaderTitle}>Melhores Rotas</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity>
            <Filter size={20} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryOrange} />
        <Text style={styles.loadingText}>A carregar rotas...</Text>
      </View>
    );
  }

  // EMPTY STATE
  if (allRoutes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.subHeaderRow}>
          <Text style={styles.subHeaderTitle}>Melhores Rotas</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Zap size={48} color={COLORS.primaryGreen} />
          </View>
          <Text style={styles.emptyTitle}>Ainda Não Há Rotas</Text>
          <Text style={styles.emptyDesc}>
            Seja o primeiro a criar um percurso! Crie uma rota e partilhe os seus trilhos favoritos.
          </Text>
          <TouchableOpacity style={styles.createMainBtn} onPress={handleCreateRoute}>
            <Plus size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.createMainBtnText}>Criar Rota</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER SECTION (Com Favoritos e Título) */}
      <ListHeader />

      {/* LISTA VERTICAL (Renderizada com map para evitar erro de virtualização) */}
      <View style={{ paddingBottom: 40 }}>
        {allRoutes.map((item) => renderBigCard({ item }))}
      </View>

      <RouteDetailView
        visible={!!selectedRouteId}
        routeId={selectedRouteId}
        onClose={() => {
          setSelectedRouteId(null);
          fetchData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  
  // Headers
  subHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10, 
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  createMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  createMiniText: {
    fontSize: 12,
    color: COLORS.primaryOrange,
    fontWeight: "600",
    marginLeft: 4,
  },

  // SECÇÃO FAVORITOS
  favSection: {
    marginBottom: 0,
  },
  favSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textGray,
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 5,
  },
  smallCard: {
    width: 140,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden'
  },
  smallCardImage: {
    width: '100%',
    height: 70,
    backgroundColor: '#eee'
  },
  smallCardContent: {
    padding: 8,
  },
  smallCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 2
  },
  smallCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  smallCardText: {
    fontSize: 10,
    color: COLORS.textGray
  },

  // CARD GRANDE (ROTAS)
  routeCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    marginHorizontal: 20, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#eee",
  },
  difficultyBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  routeTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: COLORS.darkText,
    flex: 1,
    marginRight: 10,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4, 
  },
  likesText: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '600'
  },
  routeDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  divider: {
    marginHorizontal: 8,
    color: "#ddd",
  },
  routeDesc: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 4,
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textGray,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EAFDF2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkText,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  createMainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: "100%",
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createMainBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});