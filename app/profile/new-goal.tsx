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

const COLORS = {
  green: "#5DBD76",
  gray: "#F5F7F8",
  orange: "#FF9E46",
  text: "#1A1A1A",
  muted: "#666",
};

const GOAL_TYPES = [
  "Duração",
  "Distância",
  "Calorias",
  "Frequência",
  "Impacto Ecológico",
];

const PERIODS = ["Dia", "Semana", "Mês"];

export default function NewGoalScreen() {
  const router = useRouter();

  const [goalType, setGoalType] = useState("Duração");
  const [period, setPeriod] = useState("Dia");
  const [value, setValue] = useState("600");

  const [showTypeOptions, setShowTypeOptions] = useState(false);
  const [showPeriodOptions, setShowPeriodOptions] = useState(false);

  const handleSave = () => {
    if (!value) {
      Alert.alert("Erro", "Define um valor para o objetivo.");
      return;
    }

    Alert.alert("Objetivo criado", "O novo objetivo foi definido com sucesso.");
    router.back();
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
            <Text style={styles.selectText}>{goalType}</Text>
            <ChevronDown size={18} color="#555" />
          </TouchableOpacity>

          {showTypeOptions && (
            <View style={styles.dropdown}>
              {GOAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.option}
                  onPress={() => {
                    setGoalType(type);
                    setShowTypeOptions(false);
                  }}
                >
                  <Text style={styles.optionText}>{type}</Text>
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
            <Text style={styles.selectText}>{period}</Text>
            <ChevronDown size={18} color="#555" />
          </TouchableOpacity>

          {showPeriodOptions && (
            <View style={styles.dropdown}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.option}
                  onPress={() => {
                    setPeriod(p);
                    setShowPeriodOptions(false);
                  }}
                >
                  <Text style={styles.optionText}>{p}</Text>
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
