import { useRouter } from "expo-router";
import { Check, Ruler, X } from "lucide-react-native";
import React, { useState } from "react";
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
  text: "#1A1A1A",
};

type Unit = {
  key: "km" | "mi";
  label: string;
  description: string;
};

const UNITS: Unit[] = [
  {
    key: "km",
    label: "Quilómetros (km)",
    description: "Unidade padrão utilizada na maioria dos países",
  },
  {
    key: "mi",
    label: "Milhas (mi)",
    description: "Usado principalmente nos Estados Unidos e Reino Unido",
  },
];

export default function UnitsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Unit["key"]>("km");

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ruler size={20} color="white" />
          <Text style={styles.headerTitle}>Unidades</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {UNITS.map((unit) => {
            const active = unit.key === selected;

            return (
              <TouchableOpacity
                key={unit.key}
                onPress={() => setSelected(unit.key)}
                style={[styles.card, active && { borderColor: COLORS.green }]}
              >
                <View>
                  <Text style={styles.label}>{unit.label}</Text>
                  <Text style={styles.description}>{unit.description}</Text>
                </View>

                {active && <Check size={20} color={COLORS.green} />}
              </TouchableOpacity>
            );
          })}
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
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },
});
