import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { getAvatarByLevel } from "../../constants/avatars";
import { getUserLevel } from "../../constants/levels";

// Mock data
const ecoPoints = 730;
const userLevel = getUserLevel(ecoPoints);

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  teal: "#35C2C1",
  gray: "#F5F7F8",
  locked: "#CBD5E1",
};

type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

const BADGES: Badge[] = [
  {
    id: "first-ride",
    title: "Primeira Volta",
    description: "Concluíste a tua primeira rota.",
    icon: "🚴",
    unlocked: true,
  },
  {
    id: "ten-rides",
    title: "10 Rotas",
    description: "Completaste 10 rotas.",
    icon: "🛣️",
    unlocked: true,
  },
  {
    id: "fifty-km",
    title: "50 km",
    description: "Percorreste 50 km no total.",
    icon: "📍",
    unlocked: false,
  },
  {
    id: "hundred-km",
    title: "100 km",
    description: "Percorreste 100 km no total.",
    icon: "🏁",
    unlocked: false,
  },
];

export default function BadgesScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Badges</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* ===== PROFILE PROGRESS (TOPO) ===== */}
          <View style={styles.profileProgress}>
            <View style={styles.avatarWrapper}>
              <Image
                source={getAvatarByLevel(userLevel)}
                style={styles.bigAvatar}
              />
            </View>

            <Text style={styles.profileName}>Georg</Text>

            <View style={styles.levelRow}>
              <Text style={styles.levelText}>
                <Text style={{ fontWeight: "bold" }}>{userLevel}</Text> Pedal
                Level
              </Text>

              <Text style={styles.levelDivider}>|</Text>
              <Text style={styles.levelText}>
                <Text style={{ fontWeight: "bold" }}>{ecoPoints}</Text> Eco
                Points
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: "72%" }]} />
              </View>
              <Text style={styles.progressText}>Level up · 72%</Text>
            </View>
          </View>

          {/* ===== BADGES LIST ===== */}
          {BADGES.map((badge) => (
            <View
              key={badge.id}
              style={[styles.badgeCard, !badge.unlocked && styles.badgeLocked]}
            >
              <Text style={styles.badgeIcon}>{badge.icon}</Text>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.badgeTitle,
                    !badge.unlocked && { color: "#94a3b8" },
                  ]}
                >
                  {badge.title}
                </Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>

              <Text
                style={[
                  styles.badgeStatus,
                  badge.unlocked
                    ? { color: COLORS.teal }
                    : { color: "#94a3b8" },
                ]}
              >
                {badge.unlocked ? "Desbloqueado" : "Bloqueado"}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  backText: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },

  /* --- PROFILE PROGRESS --- */
  profileProgress: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 30,
    elevation: 4,
    marginBottom: 12,
  },
  bigAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  levelText: {
    fontSize: 14,
    color: "#444",
  },
  levelDivider: {
    marginHorizontal: 12,
    color: "#AAA",
  },
  progressContainer: {
    width: "100%",
    paddingHorizontal: 24,
  },
  progressBarBackground: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.teal,
    borderRadius: 20,
  },
  progressText: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
    color: COLORS.teal,
  },

  /* --- BADGES --- */
  badgeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 3,
    gap: 16,
  },
  badgeLocked: {
    backgroundColor: "#F1F5F9",
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkText,
  },
  badgeDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  badgeStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
});
