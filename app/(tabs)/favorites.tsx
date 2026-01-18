import {
  addFavoriteLocation,
  getFavoriteLocations,
  removeFavoriteLocation,
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

import SwipeableItem from "@/components/SwipeableItem";

/* ===============================
   TYPES & CONSTANTS
=============================== */

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
};

type LatLng = { latitude: number; longitude: number };
type FavoriteCategory = "home" | "work" | "favorite";

/* ===============================
   HELPERS
=============================== */

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

/* ===============================
   SCREEN
=============================== */

export default function FavoritesScreen() {
  const [locations, setLocations] = useState<FavoriteLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);

  const { setIntent } = useNavigationIntent();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<FavoriteCategory | null>(null);

  /* ===============================
     LOAD FAVORITES
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
     SORT & SPLIT
  =============================== */
  const sorted = [...locations].sort((a, b) => {
    const order = { home: 0, work: 1, favorite: 2 };
    return (order[a.category] ?? 99) - (order[b.category] ?? 99);
  });

  const home = sorted.find((l) => l.category === "home");
  const work = sorted.find((l) => l.category === "work");
  const others = sorted.filter(
    (l) => l.category !== "home" && l.category !== "work",
  );

  const mapFavorites = React.useMemo(
    () =>
      sorted.map((l) => ({
        latitude: l.latitude,
        longitude: l.longitude,
        category: l.category,
      })),
    [sorted],
  );

  /* ===============================
     MODAL HANDLER
     (define contexto + abre modal)
  =============================== */
  function openModal(category: FavoriteCategory) {
    setEditingCategory(category);
    setShowModal(true);
  }

  /* ===============================
     RENDER
  =============================== */
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
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
          {/* CASA */}
          <Item
            icon="🏠"
            title="Casa"
            subtitle={home?.name ?? "Definir morada"}
            action="Ir"
            onPress={() => {
              if (!home) {
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
            onLongPress={() => openModal("home")}
          />

          {/* TRABALHO */}
          <Item
            icon="💼"
            title="Trabalho"
            subtitle={work?.name ?? "Definir morada"}
            action="Ir"
            onPress={() => {
              if (!work) {
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
            onLongPress={() => openModal("work")}
          />

          {/* OUTROS FAVORITOS */}
          {others.length === 0 && (
            <Text style={styles.emptyText}>Nenhum favorito ainda</Text>
          )}

          {others.map((l) => (
            <SwipeableItem
              key={l.id}
              enabled={l.category === "favorite"}
              onDelete={async () => {
                if (!l.id) return;

                await removeFavoriteLocation(l.id);

                setLocations((prev) => prev.filter((item) => item.id !== l.id));
              }}
            >
              <Item
                icon="⭐"
                title="Favorito"
                subtitle={l.name}
                action="Ir"
                onPress={() => {
                  setIntent({
                    type: "location",
                    destination: {
                      latitude: l.latitude,
                      longitude: l.longitude,
                    },
                    destinationLabel: l.name,
                  });

                  router.push("/");
                }}
              />
            </SwipeableItem>
          ))}
        </ScrollView>

        {/* ADD FAVORITE BUTTON */}
        <TouchableOpacity
          style={styles.addFavoriteBtn}
          onPress={() => openModal("favorite")}
        >
          <Text style={styles.addFavoriteIcon}>＋</Text>
          <Text style={styles.addFavoriteText}>Adicionar favorito</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <LocationPickerModal
        visible={showModal}
        category={editingCategory}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
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
            // favoritos → adiciona
            if (editingCategory === "favorite") {
              return normalizeLocations([...prev, saved]);
            }

            // home / work → substitui
            const filtered = prev.filter((l) => l.category !== editingCategory);
            return normalizeLocations([...filtered, saved]);
          });

          setShowModal(false);
          setEditingCategory(null);
        }}
      />
    </View>
  );
}

/* ===============================
   ITEM COMPONENT
=============================== */

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
    </TouchableOpacity>
  );
}

/* ===============================
   STYLES
=============================== */

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

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

  goBtn: {
    backgroundColor: COLORS.primaryOrange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  goBtnText: {
    color: "white",
    fontWeight: "bold",
  },

  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 24,
  },

  addFavoriteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: COLORS.primaryOrange,
  },

  addFavoriteIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryOrange,
    marginRight: 8,
  },

  addFavoriteText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primaryOrange,
  },
});
