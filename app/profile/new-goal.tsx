import { useRouter } from "expo-router";
import { ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
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

const GOAL_TYPES = [
  { label: "Distância", value: "distance" },
  { label: "Calorias", value: "calories" },
  { label: "Frequência", value: "frequency" },
  { label: "Impacto Ecológico", value: "eco_impact" },
];


const PERIODS = [
  { label: "Dia", value: "daily" },
  { label: "Semana", value: "weekly" },
  { label: "Mês", value: "monthly" },
];

export default function NewGoalScreen() {
  const router = useRouter();

  const [goalType, setGoalType] = useState(GOAL_TYPES[0]);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [value, setValue] = useState("600");

  const [showTypeOptions, setShowTypeOptions] = useState(false);
  const [showPeriodOptions, setShowPeriodOptions] = useState(false);

  const handleSave = async () => {
    if (!value) {
      Alert.alert("Erro", "Define um valor para o objetivo.");
      return;
    }

    try {
      // 1. User autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert("Erro", "Utilizador não autenticado.");
        return;
      }

      // 2. Datas
      const startDate = new Date();
      const endDate = new Date(startDate);

      if (period.value === "daily") endDate.setDate(endDate.getDate() + 1);
      if (period.value === "weekly") endDate.setDate(endDate.getDate() + 7);
      if (period.value === "monthly") endDate.setMonth(endDate.getMonth() + 1);

      // 3. Inserir goal
      const { error } = await supabase.from("user_goals").insert({
        user_id: user.id,
        metric: goalType.value, // ex: "calorias" → "calorias"
        duration: period.value, // dia | semana | mês
        target_value: Number(value),
        current_value: 0,
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert("Sucesso", "Objetivo criado com sucesso.");
      router.back();
    } catch (err) {
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
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
        <View style={{ padding: 24 }}>
          <Text style={styles.title}>Definir Novo Goal</Text>

          {/* Goal Type */}
          <Text style={styles.label}>Tipo de Goal</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => {
              setShowTypeOptions(!showTypeOptions);
              setShowPeriodOptions(false);
            }}
          >
            <Text style={styles.selectText}>{goalType.label}</Text>
            <ChevronDown size={18} color="#555" />
          </TouchableOpacity>

          {showTypeOptions && (
            <View style={styles.dropdown}>
              {GOAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.option}
                  onPress={() => {
                    setGoalType(type);
                    setShowTypeOptions(false);
                  }}
                >
                  <Text style={styles.optionText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Value */}
          <Text style={styles.label}>Valor</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Period */}
          <Text style={styles.label}>Período</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => {
              setShowPeriodOptions(!showPeriodOptions);
              setShowTypeOptions(false);
            }}
          >
            <Text style={styles.selectText}>{period.label}</Text>
            <ChevronDown size={18} color="#555" />
          </TouchableOpacity>

          {showPeriodOptions && (
            <View style={styles.dropdown}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={styles.option}
                  onPress={() => {
                    setPeriod(p);
                    setShowPeriodOptions(false);
                  }}
                >
                  <Text style={styles.optionText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  select: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontWeight: "600",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
  },
  option: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  optionText: {
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: COLORS.orange,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
