import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

const COLORS = {
  green: "#5DBD76",
  gray: "#F5F7F8",
  orange: "#FF9E46",
  text: "#1A1A1A",
  muted: "#666",
};

const metricLabelMap: Record<string, string> = {
  duracao: "Duração",
  distância: "Distância",
  calorias: "Calorias",
  frequência: "Frequência",
  impacto_ecológico: "Impacto Ecológico",
};

const metricUnitMap: Record<string, string> = {
  duracao: "min",
  distância: "km",
  calorias: "cal",
  frequência: "x",
  impacto_ecológico: "pts",
};


interface UserGoal {
  id: string;
  metric: string;
  duration: string;
  target_value: number;
  current_value: number;
}

export default function GoalsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) return;

      const { data, error } = await supabase
        .from("user_goals")
        .select("id, metric, duration, target_value, current_value")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        console.error(error.message);
        return;
      }

      setGoals(data ?? []);
    } catch (err) {
      console.error("Erro a buscar goals", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Goals</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* weeklyly Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.hello}>Olá, Georg</Text>
            <Text style={styles.subtitle}>Progresso desta semana</Text>

            {loading ? (
  <Text>A carregar...</Text>
) : (
  goals.map((goal) => {
    const percent =
      goal.target_value > 0
        ? Math.min(
            Math.round((goal.current_value / goal.target_value) * 100),
            100
          )
        : 0;

    return (
      <ProgressRow
        key={goal.id}
        label={metricLabelMap[goal.metric] ?? goal.metric}
        value={`${goal.current_value} / ${goal.target_value} ${
          metricUnitMap[goal.metric] ?? ""
        }`}
        percent={percent}
        color="#8DD4A4"
      />
    );
  })
)}

          </View>

          {/* Goals List */}
          <Text style={styles.sectionTitle}>
            Configuração dos seus objetivos
          </Text>

{goals.map((goal) => (
  <GoalRow
    key={goal.id}
    icon="🎯"
    label={metricLabelMap[goal.metric] ?? goal.metric}
    value={`${goal.target_value} ${
      metricUnitMap[goal.metric] ?? ""
    }`}
    period={goal.duration}
  />
))}


          {/* CTA */}
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.push("/profile/new-goal")}
          >
            <Text style={styles.ctaText}>Definir Novo Goal</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------- COMPONENTS ---------- */

function ProgressRow({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.progressRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>

      <Text style={styles.percent}>{percent}%</Text>
    </View>
  );
}

function GoalRow({
  icon,
  label,
  value,
  period,
}: {
  icon: string;
  label: string;
  value: string;
  period: string;
}) {
  return (
    <View style={styles.goalRow}>
      <Text style={styles.goalIcon}>{icon}</Text>

      <View style={{ flex: 1 }}>
        <Text style={styles.goalLabel}>{label}</Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.goalValue}>{value}</Text>
        <Text style={styles.goalPeriod}>{period}</Text>
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
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  progressCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  hello: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 16,
  },
  progressRow: {
    marginBottom: 14,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#EEE",
    borderRadius: 20,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 20,
  },
  percent: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  goalValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  goalPeriod: {
    fontSize: 12,
    color: COLORS.muted,
  },
  cta: {
    marginTop: 24,
    backgroundColor: COLORS.orange,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
