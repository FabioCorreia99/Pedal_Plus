import { useRouter } from "expo-router";
import { Check, Languages, X } from "lucide-react-native";
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
  muted: "#666",
};

type Language = {
  code: string;
  label: string;
};

const LANGUAGES: Language[] = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState("pt");

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Languages size={20} color="white" />
          <Text style={styles.headerTitle}>Idioma</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {LANGUAGES.map((lang) => {
            const active = lang.code === selected;

            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setSelected(lang.code)}
                style={[styles.row, active && { borderColor: COLORS.green }]}
              >
                <Text style={styles.label}>{lang.label}</Text>

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
  row: {
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
});
