import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { supabase } from "../../lib/supabase";

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  teal: "#35C2C1",
  danger: "#FF4646",
  gray: "#F5F7F8",
};

type Gender = "male" | "female" | "other" | null;

export default function EditProfileScreen() {
  const router = useRouter();

  /* ---------- STATE ---------- */
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [gender, setGender] = useState<Gender>(null);
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------- HELPERS ---------- */
  function getInitial(username: string) {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  }

  /* ---------- LOAD PROFILE ---------- */
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Erro", "Utilizador não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        Alert.alert("Erro", "Não foi possível carregar o perfil");
        return;
      }

      setUsername(data.username ?? "");
      setName(data.full_name ?? "");
      setBio(data.bio ?? "");
      setLink(data.website_link ?? "");
      setGender(data.gender ?? null);
      setBirthday(data.birthday ? new Date(data.birthday) : null);
      setAvatarUrl(data.avatar_url ?? null);

      setLoading(false);
    })();
  }, []);

  /* ---------- IMAGE PICK + UPLOAD ---------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      const fileExt = uri.split(".").pop() ?? "jpg";
      const fileName = `${user.id}.${fileExt}`;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        Alert.alert("Erro", uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      setAvatarUrl(data.publicUrl);
    } catch (err) {
      Alert.alert("Erro", "Falha ao fazer upload da imagem");
      console.error(err);
    }
  };

  const removeAvatar = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    setAvatarUrl(null);
  };

  /* ---------- SAVE PROFILE ---------- */
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome é obrigatório.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        bio: bio || null,
        website_link: link || null,
        gender,
        birthday: birthday ? birthday.toISOString().split("T")[0] : null,
        avatar_url: avatarUrl, // mantém a foto
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    Alert.alert("Sucesso", "Perfil atualizado.");
    router.back();
  };

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={{ padding: 24 }}>
          {/* AVATAR */}
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{getInitial(username)}</Text>
              </View>
            )}
            <Text style={styles.avatarHint}>Alterar foto</Text>
          </TouchableOpacity>

          {avatarUrl && (
            <TouchableOpacity onPress={removeAvatar}>
              <Text style={styles.removeAvatar}>Remover foto</Text>
            </TouchableOpacity>
          )}

          {/* PUBLIC DATA */}
          <Text style={styles.sectionTitle}>Dados públicos</Text>

          <Label text="Nome *" />
          <TextInput value={name} onChangeText={setName} style={styles.input} />

          <Label text="Bio" />
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.textArea]}
            multiline
          />

          <Label text="Link" />
          <TextInput
            value={link}
            onChangeText={setLink}
            style={styles.input}
            autoCapitalize="none"
          />

          {/* PRIVATE DATA */}
          <Text style={styles.sectionTitle}>Dados privados</Text>

          <Label text="Género" />
          <View style={styles.genderRow}>
            {[
              { label: "Masculino", value: "male" },
              { label: "Feminino", value: "female" },
              { label: "Outro", value: "other" },
            ].map((g) => (
              <TouchableOpacity
                key={g.value}
                onPress={() => setGender(g.value as Gender)}
                style={[
                  styles.genderBtn,
                  gender === g.value && styles.genderBtnActive,
                ]}
              >
                <Text
                  style={{
                    color: gender === g.value ? "white" : COLORS.darkText,
                    fontWeight: "600",
                  }}
                >
                  {g.label}
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
  headerTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  cancelText: { color: "white", fontWeight: "600" },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  avatarContainer: { alignItems: "center", marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  initialsCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: { fontSize: 36, fontWeight: "bold", color: "white" },
  avatarHint: { marginTop: 8, fontSize: 12, color: "#777" },
  removeAvatar: {
    textAlign: "center",
    color: COLORS.danger,
    marginBottom: 24,
    fontWeight: "600",
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  genderRow: { flexDirection: "row", marginBottom: 16 },
  genderBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#EDEDED",
    alignItems: "center",
  },
  genderBtnActive: { backgroundColor: COLORS.primaryGreen },
  saveBtn: {
    backgroundColor: COLORS.primaryOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
