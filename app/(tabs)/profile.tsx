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

export default function ProfileScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("week");

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Vê o meu perfil no Pedal+ 🚴‍♂️",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* Esquerda — Editar Perfil */}
        <TouchableOpacity onPress={() => router.push("/profile/edit")}>
          <Edit size={22} color="white" />
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.headerTitle}>Perfil</Text>

        {/* Direita — Share + Settings */}
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
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200",
              }}
              style={styles.avatar}
            />

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.name}>Georg Knorr</Text>

              <View style={styles.statsRow}>
                <Stat label="Rides" value="270" />
                <Stat label="Seguidores" value="102" />
                <Stat label="A seguir" value="178" />
              </View>
            </View>
          </View>

          {/* Activity */}
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Atividade</Text>

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

          {/* Dashboard */}
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Dashboard</Text>

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

          {/* Logout */}
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
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: "#666" }}>{label}</Text>
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
    justifyContent: "space-between",
    marginTop: 12,
    paddingRight: 16,
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
});
