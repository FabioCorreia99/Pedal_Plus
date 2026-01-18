import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { ShieldCheck, ShieldOff, UserMinus } from "lucide-react-native";
import { supabase } from "../../lib/supabase";

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  textGray: "#9ca3af",
  white: "#FFFFFF",
  red: "#ef4444",
  blue: "#3b82f6",
};

interface MemberItem {
  user_id: string;
  role: "admin" | "moderator" | "member";
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

interface Props {
  groupId: string;
  ListHeaderComponent: React.ReactElement; // Para manter o cabeçalho visível
  currentUserRole: string | null;
  currentUserId: string | null;
  groupOwnerId: string | undefined;
  onMemberUpdate?: () => void; // <--- NOVO: Callback para atualizar o pai
}

export default function GroupMembersList({
  groupId,
  ListHeaderComponent,
  currentUserRole,
  currentUserId,
  groupOwnerId,
  onMemberUpdate,
}: Props) {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          user_id,
          role,
          profiles (full_name, username, avatar_url)
        `,
        )
        .eq("group_id", groupId)
        .order("role", { ascending: true }); // Admin primeiro

      if (error) throw error;

      // Sanitizar dados
      const cleanMembers = data.map((m: any) => ({
        ...m,
        profiles: m.profiles || {
          full_name: null,
          username: "Utilizador",
          avatar_url: null,
        },
      }));

      setMembers(cleanMembers);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível carregar os membros.");
    } finally {
      setLoading(false);
    }
  };

  // --- AÇÕES DE ADMIN ---

  const handleKick = (member: MemberItem) => {
    Alert.alert(
      "Expulsar Membro",
      `Tens a certeza que queres remover ${member.profiles.full_name || member.profiles.username}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Expulsar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("group_members")
                .delete()
                .eq("group_id", groupId)
                .eq("user_id", member.user_id);

              if (error) throw error;

              setMembers((prev) =>
                prev.filter((m) => m.user_id !== member.user_id),
              );

              if (onMemberUpdate) onMemberUpdate();

              Alert.alert("Sucesso", "Utilizador removido.");
            } catch (e: any) {
              Alert.alert("Erro", e.message);
            }
          },
        },
      ],
    );
  };

  const handlePromote = (member: MemberItem) => {
    Alert.alert(
      "Promover a Admin",
      `Tornar ${member.profiles.full_name || member.profiles.username} administrador?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Promover",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("group_members")
                .update({ role: "admin" })
                .eq("group_id", groupId)
                .eq("user_id", member.user_id);

              if (error) throw error;

              // Atualiza localmente
              setMembers((prev) =>
                prev.map((m) =>
                  m.user_id === member.user_id ? { ...m, role: "admin" } : m,
                ),
              );

              // Avisa o pai
              if (onMemberUpdate) onMemberUpdate();

              Alert.alert("Sucesso", "Utilizador promovido.");
            } catch (e: any) {
              Alert.alert("Erro", e.message);
            }
          },
        },
      ],
    );
  };

  const handleDemote = (member: MemberItem) => {
    Alert.alert(
      "Despromover",
      `Remover privilégios de administrador de ${member.profiles.full_name || member.profiles.username}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Despromover",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("group_members")
                .update({ role: "member" })
                .eq("group_id", groupId)
                .eq("user_id", member.user_id);

              if (error) throw error;

              setMembers((prev) =>
                prev.map((m) =>
                  m.user_id === member.user_id ? { ...m, role: "member" } : m,
                ),
              );

              if (onMemberUpdate) onMemberUpdate();

              Alert.alert("Sucesso", "Utilizador despromovido.");
            } catch (e: any) {
              Alert.alert("Erro", e.message);
            }
          },
        },
      ],
    );
  };

  const renderMember = ({ item }: { item: MemberItem }) => {
    const isMe = item.user_id === currentUserId;

    // Verificar papéis
    const isOwner = item.user_id === groupOwnerId;
    const isAdminRole = item.role === "admin";
    const displayAdmin = isOwner || isAdminRole;

    // Permissões do utilizador atual
    const iAmOwner = currentUserId === groupOwnerId;
    const iAmAdmin = currentUserRole === "admin" || iAmOwner;

    // Alvo é Admin ou Dono?
    const targetIsAdminOrOwner = isAdminRole || isOwner;

    return (
      <View style={styles.memberCard}>
        <Image
          source={{
            uri:
              item.profiles.avatar_url ||
              "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {item.profiles.full_name ||
              item.profiles.username ||
              "Desconhecido"}{" "}
            {isMe && "(Tu)"}
          </Text>

          <Text
            style={[
              styles.role,
              displayAdmin && {
                color: COLORS.primaryOrange,
                fontWeight: "bold",
              },
            ]}
          >
            {isOwner ? "Dono" : isAdminRole ? "Administrador" : "Membro"}
          </Text>
        </View>

        {/* BLOCO 1: Ações em Membros Normais */}
        {iAmAdmin && !isMe && !targetIsAdminOrOwner && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => handlePromote(item)}
              style={[styles.iconBtn, { backgroundColor: "#EBF5FF" }]}
            >
              <ShieldCheck size={18} color={COLORS.blue} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleKick(item)}
              style={[styles.iconBtn, { backgroundColor: "#FEF2F2" }]}
            >
              <UserMinus size={18} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        )}

        {/* BLOCO 2: Ações em Administradores (Só Dono pode ver) */}
        {iAmOwner && !isMe && targetIsAdminOrOwner && !isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => handleDemote(item)}
              style={[styles.iconBtn, { backgroundColor: "#FFF4E5" }]}
            >
              <ShieldOff size={18} color={COLORS.primaryOrange} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleKick(item)}
              style={[styles.iconBtn, { backgroundColor: "#FEF2F2" }]}
            >
              <UserMinus size={18} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={members}
      renderItem={renderMember}
      keyExtractor={(item) => item.user_id}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        !loading ? <Text style={styles.emptyText}>Sem membros.</Text> : null
      }
      ListFooterComponent={
        loading ? (
          <ActivityIndicator
            color={COLORS.primaryGreen}
            style={{ marginTop: 20 }}
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.darkText },
  role: { fontSize: 12, color: COLORS.textGray, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: { padding: 8, borderRadius: 8 },
  emptyText: { textAlign: "center", color: COLORS.textGray, marginTop: 20 },
});
