import { useRouter } from "expo-router";
import { Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabase";

const COLORS = {
  green: "#5DBD76",
  gray: "#F5F7F8",
  orange: "#FF9E46",
  danger: "#FF4646",
  text: "#1A1A1A",
};

export default function AccountSettingsScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- SAVE CHANGES ---------- */
  const handleSave = async () => {
    try {
      setLoading(true);

      if (email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) {
          Alert.alert("Erro ao atualizar email", error.message);
          return;
        }

        Alert.alert(
          "Confirmação necessária",
          "Enviámos um email para confirmar a alteração."
        );
      }

      if (password) {
        if (password.length < 6) {
          Alert.alert("Erro", "A password deve ter pelo menos 6 caracteres");
          return;
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          Alert.alert("Erro ao atualizar password", error.message);
          return;
        }

        Alert.alert("Sucesso", "Palavra-passe atualizada");
        setPassword("");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- DELETE ACCOUNT (MOCK) ---------- */
  const handleDeleteAccount = () => {
    Alert.alert("Eliminar Conta", "Esta ação é permanente e irreversível.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () =>
          Alert.alert(
            "Ainda não disponível",
            "A eliminação de conta será implementada mais tarde."
          ),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conta</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={{ padding: 24 }}>
          {/* EMAIL */}
          <Text style={styles.sectionTitle}>Alterar Email</Text>
          <TextInput
            placeholder="Novo email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          {/* PASSWORD */}
          <Text style={styles.sectionTitle}>Alterar Palavra-passe</Text>
          <TextInput
            placeholder="Nova palavra-passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveText}>
              {loading ? "A guardar..." : "Guardar Alterações"}
            </Text>
          </TouchableOpacity>

          {/* DELETE ACCOUNT */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteAccount}
          >
            <Trash2 size={18} color={COLORS.danger} />
            <Text style={styles.deleteText}>Eliminar Conta</Text>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: COLORS.orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 32,
    paddingVertical: 16,
  },
  deleteText: {
    color: COLORS.danger,
    fontWeight: "600",
    fontSize: 16,
  },
});
