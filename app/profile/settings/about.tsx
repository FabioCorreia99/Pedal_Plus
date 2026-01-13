import { useRouter } from "expo-router";
import { Info, X } from "lucide-react-native";
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
  text: "#1A1A1A",
  muted: "#666",
};

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Info size={20} color="white" />
          <Text style={styles.headerTitle}>About</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={styles.title}>Pedal+</Text>

          <Text style={styles.paragraph}>
            Pedal+ é uma aplicação focada na promoção da mobilidade sustentável,
            incentivando o uso da bicicleta no dia a dia.
          </Text>

          <Text style={styles.paragraph}>
            Através de um sistema de níveis, Eco Points e Badges, a aplicação
            motiva os utilizadores a manter uma utilização regular e consciente,
            transformando hábitos de mobilidade em desafios positivos.
          </Text>

          <Text style={styles.paragraph}>
            Esta aplicação foi desenvolvida no contexto académico, servindo como
            protótipo funcional para explorar conceitos de experiência do
            utilizador, gamificação e interação móvel.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Versão 1.0.0</Text>
            <Text style={styles.footerText}>© 2026 Pedal+</Text>
          </View>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#999",
  },
});
