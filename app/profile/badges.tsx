import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getAvatarForLevel } from "../../constants/avatars";
import { supabase } from "../../lib/supabase";

/* ---------- COLORS ---------- */

const COLORS = {
  primaryGreen: "#5DBD76",
  teal: "#35C2C1",
  gray: "#F5F7F8",
  darkText: "#1A1A1A",
};

/* ---------- BADGES (definidos pela app) ---------- */

export const BADGES = [
  {
    id: 1,
    title: "Primeira Volta",
    description: "Concluíste a tua primeira rota.",
    icon: "🚴",
  },
  {
    id: 2,
    title: "10 Rotas",
    description: "Completaste 10 rotas.",
    icon: "🛣️",
  },
  {
    id: 3,
    title: "50 km",
    description: "Percorreste 50 km no total.",
    icon: "📍",
  },
  {
    id: 4,
    title: "100 km",
    description: "Percorreste 100 km no total.",
    icon: "🏁",
  },
];

/* ---------- COMPONENT ---------- */

export default function BadgesScreen() {
  const router = useRouter();

  const [ecoPoints, setEcoPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [userBadgeIds, setUserBadgeIds] = useState<number[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);

  const [loading, setLoading] = useState(true);

  /* ---------- FETCH DATA ---------- */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // User autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Perfil (XP + nível atual)
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points, current_level_id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const xp = profile.total_points ?? 0;
      const levelId = profile.current_level_id ?? 1;

      setEcoPoints(xp);
      setUserLevel(levelId);

      // Badges desbloqueados
      const { data: earnedBadges } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user.id);

      setUserBadgeIds(earnedBadges?.map((b) => b.badge_id) ?? []);

      // Calcular progresso do nível
      const { data: levels } = await supabase
        .from("levels")
        .select("id, level_number, xp_required")
        .order("level_number", { ascending: true });

      if (!levels) {
        setProgressPercent(0);
        setLoading(false);
        return;
      }

      const currentLevel = levels.find((l) => l.id === levelId);

      // próximo nível (se existir)
      const nextLevel = levels.find(
        (l) => l.level_number === (currentLevel?.level_number ?? 1) + 1,
      );

      // último nível → 100%
      if (!currentLevel || !nextLevel) {
        setProgressPercent(1);
      } else {
        const progress =
          (xp - currentLevel.xp_required) /
          (nextLevel.xp_required - currentLevel.xp_required);

        setProgressPercent(Math.min(Math.max(progress, 0), 1));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  /* ---------- LOADING ---------- */

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>A carregar badges…</Text>
      </View>
    );
  }

  /* ---------- UI ---------- */

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
          {/* ===== PROFILE ===== */}
          <View style={styles.profileProgress}>
            <View style={styles.avatarWrapper}>
              <Image
                source={getAvatarForLevel(userLevel)}
                style={styles.bigAvatar}
              />
            </View>

            <Text style={styles.profileName}>Perfil</Text>

            <View style={styles.levelRow}>
              <Text style={styles.levelText}>
                <Text style={{ fontWeight: "bold" }}>{userLevel}</Text> Pedal
                Level
              </Text>
              <Text style={styles.levelDivider}>|</Text>
              <Text style={styles.levelText}>
                <Text style={{ fontWeight: "bold" }}>
                  {ecoPoints.toFixed(0)}
                </Text>{" "}
                Eco Points
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round(progressPercent * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Próximo nível · {Math.round(progressPercent * 100)}%
              </Text>
            </View>
          </View>

          {/* ===== BADGES ===== */}
          {BADGES.map((badge) => {
            const unlocked = userBadgeIds.includes(badge.id);

            return (
              <View
                key={badge.id}
                style={[styles.badgeCard, !unlocked && styles.badgeLocked]}
              >
                <Text style={styles.badgeIcon}>{badge.icon}</Text>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.badgeTitle,
                      !unlocked && { color: "#94a3b8" },
                    ]}
                  >
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeDescription}>
                    {badge.description}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.badgeStatus,
                    unlocked ? { color: COLORS.teal } : { color: "#94a3b8" },
                  ]}
                >
                  {unlocked ? "Desbloqueado" : "Bloqueado"}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
