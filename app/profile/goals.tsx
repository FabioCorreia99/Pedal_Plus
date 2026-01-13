import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  green: "#5DBD76",
  gray: "#F5F7F8",
  orange: "#FF9E46",
  text: "#1A1A1A",
  muted: "#666",
};

export default function GoalsScreen() {
  const router = useRouter();

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
          {/* Weekly Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.hello}>Olá, Georg</Text>
            <Text style={styles.subtitle}>Progresso desta semana</Text>

            <ProgressRow
              label="Calorias"
              value="1,240 / 2,000 cal"
              percent={62}
              color="#8DD4A4"
            />
            <ProgressRow
              label="Distância"
              value="172 / 300 km"
              percent={57}
              color="#FFB877"
            />
            <ProgressRow
              label="Percursos"
              value="5 / 8 percursos"
              percent={62}
              color="#9EF0E6"
            />
          </View>

          {/* Goals List */}
          <Text style={styles.sectionTitle}>Configuração dos seus objetivos</Text>

          <GoalRow
            icon="🔥"
            label="Calorias a queimar"
            value="2,000 cal"
            period="5 dias"
          />
          <GoalRow
            icon="🚴"
            label="Distância a percorrer"
            value="300 km"
            period="7 dias"
          />
          <GoalRow
            icon="🏆"
            label="Passeios concluídos"
            value="8 percursos"
            period="por semana"
          />

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
