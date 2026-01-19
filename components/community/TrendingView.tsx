import ActivityList from "@/components/activity/ActivityList";
import { Heart, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- CORES (Mantendo a consistência) ---
const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  textGray: "#9ca3af",
  white: "#FFFFFF",
  cardBg: "#F5F5F5",
};

interface Route {
  id: string;
  name: string;
  start: string;
  end: string;
  image: string;
}

export default function TrendingView() {
  const [routesData, setRoutesData] = useState<Route[]>([]);
  const [feedMode, setFeedMode] = useState<"public" | "friends">("public");

  useEffect(() => {
    // AQUI: Adiciona a tua chamada ao Supabase para buscar as rotas reais
    // Exemplo:
    // const { data } = await supabase.from('routes').select('*');
    // setRoutesData(data);

    // DADOS MOCKADOS (Para visualizar o carrossel agora)
    setRoutesData([
      {
        id: "1",
        name: "Marginal",
        start: "Varzim Lazer",
        end: "Forte de São João",
        image:
          "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: "2",
        name: "Stadium Run",
        start: "Main Gate",
        end: "North Exit",
        image:
          "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: "3",
        name: "Forest Trail",
        start: "Entrance",
        end: "Lake View",
        image:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop",
      },
    ]);
  }, []);

  const renderRouteCard = ({ item }: { item: Route }) => (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <TouchableOpacity>
            <Heart size={18} color={COLORS.darkText} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardLocationRow}>
          <MapPin
            size={14}
            color={COLORS.primaryOrange}
            fill={COLORS.primaryOrange}
          />
          <Text style={styles.cardLocationText} numberOfLines={1}>
            <Text style={styles.boldText}>{item.start}</Text> •••••
            <MapPin size={14} color="#D00" style={{ marginLeft: 4 }} />
            <Text style={styles.boldText}> {item.end}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 1. CARROSSEL DE ROTAS (Horizontal) */}
      <View style={styles.carouselSection}>
        <Text style={styles.sectionTitle}>Rotas em Tendência</Text>
        <FlatList
          data={routesData}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderRouteCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={295} // Largura do card (280) + margem (15) para efeito magnético
          decelerationRate="fast"
        />
      </View>

      {/* 2. FEED ACTIVITY */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Atividade recente</Text>

        <View style={styles.feedToggleRow}>
          <TouchableOpacity onPress={() => setFeedMode("public")}>
            <Text
              style={[
                styles.feedToggleText,
                feedMode === "public" && styles.feedToggleActive,
              ]}
            >
              Populares
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFeedMode("friends")}>
            <Text
              style={[
                styles.feedToggleText,
                feedMode === "friends" && styles.feedToggleActive,
              ]}
            >
              Amigos
            </Text>
          </TouchableOpacity>
        </View>

        <ActivityList mode={feedMode} limit={50} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: 15,
    paddingHorizontal: 20, // Alinhado com o padding do ecrã principal
  },

  // CARROSSEL
  carouselSection: {
    marginBottom: 30,
  },
  carouselContent: {
    paddingLeft: 20, // Espaço inicial à esquerda
    paddingRight: 5,
  },
  cardContainer: {
    width: 280,
    height: 190, // Altura ligeiramente maior para acomodar melhor o texto
    marginRight: 15,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16, // Mais arredondado conforme design moderno
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  cardImage: {
    width: "100%",
    height: 115,
    backgroundColor: "#E0E0E0",
  },
  cardContent: {
    padding: 12,
    justifyContent: "space-between",
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: COLORS.darkText,
    flex: 1,
    marginRight: 8,
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  cardLocationText: {
    fontSize: 12,
    color: COLORS.darkText,
    marginLeft: 6,
    flex: 1,
  },
  boldText: {
    fontWeight: "600",
  },

  // FEED
  feedSection: {
    marginTop: 10,
  },
  feedItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ddd",
  },
  feedTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.darkText,
  },
  feedDate: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 2,
  },
  feedAction: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },
  feedToggleRow: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  feedToggleText: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "500",
  },

  feedToggleActive: {
    color: "#FF9E46",
    fontWeight: "700",
  },
});
