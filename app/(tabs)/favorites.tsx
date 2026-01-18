import {
  addFavoriteLocation,
  getFavoriteLocations,
} from "@/lib/favoriteLocations";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import InteractiveMap from "@/components/InteractiveMap";
import LocationPickerModal from "@/components/favorites/LocationPickerModal";
import { useNavigationIntent } from "@/context/NavigationContext";
import { router } from "expo-router";

import type { FavoriteLocation } from "@/types/favorites";

const COLORS = { primaryGreen: "#5DBD76", primaryOrange: "#FF9E46" };
type LatLng = { latitude: number; longitude: number };

function normalizeLocations(data: any[]): FavoriteLocation[] {
  return (data ?? []).filter(
    (l): l is FavoriteLocation =>
      l &&
      typeof l === "object" &&
      typeof l.category === "string" &&
      typeof l.latitude === "number" &&
      typeof l.longitude === "number" &&
      typeof l.name === "string",
  );
}

export default function FavoritesScreen() {
  const [locations, setLocations] = useState<FavoriteLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);

  const { setIntent } = useNavigationIntent();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    "home" | "work" | null
  >(null);

  /* ===============================
     LOAD FAVORITES (SAFE)
  =============================== */
  useEffect(() => {
    (async () => {
      const raw = await getFavoriteLocations();
      setLocations(normalizeLocations(raw as any[]));
    })();
  }, []);

  /* ===============================
     CURRENT LOCATION
  =============================== */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  /* ===============================
     SORT & SPLIT (SAFE)
  =============================== */
  const sorted = [...locations].sort((a, b) => {
    const order = { home: 0, work: 1, favorite: 2 };
    return (order[a.category] ?? 99) - (order[b.category] ?? 99);
  });

  const [editingPreview, setEditingPreview] = useState<"home" | "work" | null>(
    null,
  );

  const home = sorted.find((l) => l.category === "home");
  const work = sorted.find((l) => l.category === "work");
  const others = sorted.filter(
    (l) => l.category !== "home" && l.category !== "work",
  );

  const mapFavorites = sorted.map((l) => ({
    latitude: l.latitude,
    longitude: l.longitude,
    category: l.category,
  }));

  function openModal(category: "home" | "work") {
    setEditingCategory(category);
    setShowModal(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      {/* HEADER */}
      <View
        style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 }}
      >
        <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
          Favoritos
        </Text>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {/* MAP */}
        <View style={styles.mapContainer}>
          {currentLocation && (
            <InteractiveMap
              zoom={13}
              showRoute={false}
              origin={currentLocation}
              routeCoordinates={[]}
              mapPaddingBottom={0}
              isNavigating={false}
              favoriteLocations={mapFavorites}
            />
          )}
        </View>

        {/* LIST */}
        <ScrollView style={{ paddingHorizontal: 24 }}>
          <Item
            icon="🏠"
            title="Casa"
            subtitle={home?.name ?? "Definir morada"}
            action={editingPreview === "home" ? "Editar" : "Ir"}
            onPress={() => {
              if (!home) {
                openModal("home");
                return;
              }

              // se estiver em modo editar, abre modal
              if (editingPreview === "home") {
                openModal("home");
                return;
              }

              setIntent({
                type: "location",
                destination: {
                  latitude: home.latitude,
                  longitude: home.longitude,
                },
                destinationLabel: home.name,
              });

              router.push("/");
            }}
            onLongPress={() => {
              setEditingPreview("home");
              openModal("home");
            }}
          />

          <Item
            icon="💼"
            title="Trabalho"
            subtitle={work?.name ?? "Definir morada"}
            action={editingPreview === "work" ? "Editar" : "Ir"}
            onPress={() => {
              if (!work) {
                openModal("work");
                return;
              }

              if (editingPreview === "work") {
                openModal("work");
                return;
              }

              setIntent({
                type: "location",
                destination: {
                  latitude: work.latitude,
                  longitude: work.longitude,
                },
                destinationLabel: work.name,
              });

              router.push("/");
            }}
            onLongPress={() => {
              setEditingPreview("work");
              openModal("work");
            }}
          />

          {others.length === 0 && (
            <Text style={styles.emptyText}>Nenhum favorito ainda</Text>
          )}

          {others.map((l) => (
            <Item
              key={l.id ?? `${l.latitude}-${l.longitude}`}
              icon="⭐"
              title="Favorito"
              subtitle={l.name}
              action="—"
              onPress={() => {}}
            />
          ))}
        </ScrollView>
      </View>

      {/* MODAL */}
      <LocationPickerModal
        visible={showModal}
        category={editingCategory}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
          setEditingPreview(null);
        }}
        onSelect={async (coords, description) => {
          if (!editingCategory) return;

          const saved = await addFavoriteLocation({
            name: description,
            latitude: coords.latitude,
            longitude: coords.longitude,
            category: editingCategory,
          });

          setLocations((prev) => {
            const filtered = prev.filter((l) => l.category !== editingCategory);
            return normalizeLocations([...filtered, saved]);
          });

          setShowModal(false);
          setEditingCategory(null);
          setEditingPreview(null);
        }}
      />
    </View>
  );
}

function Item({
  icon,
  title,
  subtitle,
  action,
  onPress,
  onLongPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  action: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.goBtn}>
          <Text style={styles.goBtnText}>{action}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: "#F5F7F8",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  mapContainer: {
    height: 160,
    margin: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  goBtn: {
    backgroundColor: COLORS.primaryOrange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 24,
  },
  icon: {
    fontSize: 22,
    marginTop: 4,
  },

  textContainer: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 12,
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
  },

  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },

  buttonContainer: {
    justifyContent: "flex-end",
    marginTop: 14,
  },

  goBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});
