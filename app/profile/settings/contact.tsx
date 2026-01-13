import { useRouter } from "expo-router";
import { Mail, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  green: "#5DBD76",
  gray: "#F5F7F8",
  text: "#1A1A1A",
  muted: "#666",
  orange: "#FF9E46",
};

export default function ContactScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!email || !subject || !message) {
      Alert.alert("Erro", "Por favor preenche todos os campos.");
      return;
    }

    Alert.alert(
      "Mensagem enviada",
      "A tua mensagem foi enviada com sucesso. Entraremos em contacto brevemente."
    );

    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Mail size={20} color="white" />
          <Text style={styles.headerTitle}>Contact Us</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={styles.description}>
            Se tiveres alguma dúvida, sugestão ou problema, entra em contacto
            connosco através do formulário abaixo.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="exemplo@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Assunto</Text>
          <TextInput
            placeholder="Assunto da mensagem"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
          />

          <Text style={styles.label}>Mensagem</Text>
          <TextInput
            placeholder="Escreve a tua mensagem..."
            value={message}
            onChangeText={setMessage}
            style={[styles.input, styles.textArea]}
            multiline
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submeter</Text>
          </TouchableOpacity>
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
  description: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.text,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: COLORS.orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
