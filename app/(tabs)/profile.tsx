import FriendRequestsList from "@/components/friends/FriendRequestsList";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Edit, LogOut, Settings, Share2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ActivityList from "../../components/activity/ActivityList";
import { supabase } from "../../lib/supabase";

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  teal: "#35C2C1",
  danger: "#FF4646",
  gray: "#F5F7F8",
};

type Period = "week" | "month" | "quarter";

const ACTIVITY_DATA: Record<Period, number[]> = {
  week: [10, 20, 15, 30, 20, 10, 35],
  month: [20, 30, 25, 40, 35, 30, 45],
  quarter: [30, 45, 40, 60, 55, 50, 65],
};

/* ---------- TYPES ---------- */

interface Profile {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

/* ---------- SCREEN ---------- */

export default function ProfileScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("week");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);
  const [ridesCount, setRidesCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      fetchFriendsStats();
      fetchRidesStats();
    }, []),
  );

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.warn("Utilizador não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar profile:", error.message);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchFriendsStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("friendships")
      .select("user_id, friend_id")
      .eq("status", "accepted")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (error) {
      console.error("Erro ao buscar amigos:", error.message);
      return;
    }

    const uniqueFriends = new Set<string>();

    data?.forEach((row) => {
      if (row.user_id === user.id) {
        uniqueFriends.add(row.friend_id);
      } else {
        uniqueFriends.add(row.user_id);
      }
    });

    setFriendsCount(uniqueFriends.size);
  };

  const fetchRidesStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { count, error } = await supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("completed_at", "is", null);

    if (error) {
      console.error("Erro ao contar rides:", error.message);
      return;
    }

    setRidesCount(count ?? 0);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Erro", error.message);
      } else {
        router.replace("/sign-in");
      }
    } catch {
      Alert.alert("Erro", "Ocorreu um problema ao terminar sessão.");
    }
  };

  const getProfileLink = () => {
    if (!profile) return null;

    if (profile.username) {
      return `https://pedal.plus/u/${profile.username}`;
    }

    return `https://pedal.plus/u/id`;
  };

  const handleShare = async () => {
    if (!profile) return;

    const displayName =
      profile.full_name || profile.username || "um utilizador do Pedal+";

    const link = getProfileLink();

    const message = [
      `🚴 ${displayName} está no Pedal+!`,
      "",
      "Segue as minhas atividades e pedala comigo.",
      "",
      link,
    ].join("\n");

    try {
      await Share.share({ message });
    } catch (error) {
      console.error("Erro ao partilhar perfil:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/profile/edit")}>
          <Edit size={22} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Perfil</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare}>
            <Share2 size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/profile/settings")}>
            <Settings size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <ScrollView>
          {/* PROFILE CARD */}
          <View style={styles.profileCard}>
            <Avatar
              username={profile?.username}
              avatarUrl={profile?.avatar_url}
            />

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.name}>
                {loadingProfile
                  ? "—"
                  : profile?.full_name ||
                    profile?.username ||
                    "Utilizador Pedal+"}
              </Text>

              <View style={styles.statsRow}>
                <Stat label="Rides" value={ridesCount.toString()} />
                <Stat label="Amigos" value={friendsCount.toString()} />
              </View>
            </View>
          </View>

          <FriendRequestsList hideWhenEmpty />

          {/* ACTIVITY */}
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Resumo de Atividade</Text>

            <View style={styles.periodSelector}>
              <PeriodButton
                label="Semana"
                active={period === "week"}
                onPress={() => setPeriod("week")}
              />
              <PeriodButton
                label="Mês"
                active={period === "month"}
                onPress={() => setPeriod("month")}
              />
              <PeriodButton
                label="3 Meses"
                active={period === "quarter"}
                onPress={() => setPeriod("quarter")}
              />
            </View>

            <View style={styles.chart}>
              {ACTIVITY_DATA[period].map((val, i) => (
                <View key={i} style={styles.chartItem}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: val * 2, backgroundColor: COLORS.teal },
                    ]}
                  />
                  <Text style={styles.chartLabel}>
                    {["S", "T", "Q", "Q", "S", "S", "D"][i]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* DASHBOARD */}
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Painel</Text>

            <View style={{ flexDirection: "row", gap: 16 }}>
              <TouchableOpacity
                style={styles.dashBtn}
                onPress={() => router.push("/profile/badges")}
              >
                <Text style={styles.dashBtnText}>Badges</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dashBtnSecondary}
                onPress={() => router.push("/profile/goals")}
              >
                <Text style={styles.dashBtnText}>Goals</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ACTIVITY (FEED) */}
          <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Atividades Recentes</Text>
            <ActivityList mode="me" limit={5} />
          </View>

          {/* LOGOUT */}
          <View style={{ paddingHorizontal: 24, marginTop: 40 }}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={20} color={COLORS.danger} />
              <Text style={styles.logoutText}>Terminar Sessão</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------- COMPONENTS ---------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: "#6b7280" }}>{label}</Text>
    </View>
  );
}

function PeriodButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.periodBtn,
        active && { backgroundColor: COLORS.primaryGreen },
      ]}
    >
      <Text
        style={{
          color: active ? "white" : COLORS.darkText,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Avatar({
  username,
  avatarUrl,
}: {
  username?: string | null;
  avatarUrl?: string | null;
}) {
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={styles.avatar} />;
  }

  const initial = username?.charAt(0).toUpperCase() ?? "?";

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitial}>{initial}</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    gap: 20,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  profileCard: {
    backgroundColor: "white",
    marginTop: 10,
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkText,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 32,
    marginTop: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  chartCard: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 24,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#EDEDED",
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  chartItem: {
    alignItems: "center",
    width: 20,
  },
  chartBar: {
    width: 12,
    borderRadius: 6,
  },
  chartLabel: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4,
  },
  dashBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  dashBtnSecondary: {
    flex: 1,
    backgroundColor: COLORS.teal,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  dashBtnText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: "600",
    fontSize: 16,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitial: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
});
