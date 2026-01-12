import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  teal: "#35C2C1",
  gray: "#F5F7F8",
};

export default function EditProfileScreen() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("Georg Knorr");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | null>(
    null
  );
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome é obrigatório.");
      return;
    }

    // Aqui liga-se ao Supabase no futuro
    // name obrigatório, resto opcional

    Alert.alert("Sucesso", "Perfil atualizado.");
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={{ padding: 24 }}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200",
              }}
              style={styles.avatar}
            />
            <Text style={styles.avatarHint}>Alterar foto (falta)</Text>
          </View>

          {/* Public profile data */}
          <Text style={styles.sectionTitle}>Dados públicos</Text>

          <Label text="Nome *" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome"
            style={styles.input}
          />

          <Label text="Bio" />
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Escreve uma breve descrição"
            style={[styles.input, styles.textArea]}
            multiline
          />

          <Label text="Link" />
          <TextInput
            value={link}
            onChangeText={setLink}
            placeholder="https://example.com"
            style={styles.input}
            autoCapitalize="none"
          />

          {/* Private data */}
          <Text style={styles.sectionTitle}>Dados privados</Text>

          <Label text="Género" />
          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g as any)}
                style={[
                  styles.genderBtn,
                  gender === g && styles.genderBtnActive,
                ]}
              >
                <Text
                  style={{
                    color: gender === g ? "white" : COLORS.darkText,
                    fontWeight: "600",
                  }}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label text="Data de nascimento" />
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {birthday ? birthday.toLocaleDateString() : "Selecionar data"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthday || new Date(1990, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setBirthday(date);
              }}
            />
          )}

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar Alterações</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ---------- HELPERS ---------- */

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
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
  cancelText: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    marginTop: 0,
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
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  genderBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#EDEDED",
    alignItems: "center",
  },
  genderBtnActive: {
    backgroundColor: COLORS.primaryGreen,
  },
  saveBtn: {
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
