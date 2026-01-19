import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FriendRequest {
  user_id: string;
  profiles: {
    username: string | null;
  } | null;
}

export default function FriendRequestsList() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("friendships")
      .select(
        `
    user_id,
    profiles:profiles!friendships_user_id_fkey (
      username
    )
  `,
      )
      .eq("friend_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Erro pedidos:", error.message);
      setLoading(false);
      return;
    }

    setRequests((data as FriendRequest[]) ?? []);

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  const acceptRequest = async (fromUserId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("user_id", fromUserId)
      .eq("friend_id", user.id);

    if (error) {
      console.error("Erro ao aceitar:", error.message);
      return;
    }

    fetchRequests();
  };

  const rejectRequest = async (fromUserId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("user_id", fromUserId)
      .eq("friend_id", user.id);

    if (error) {
      console.error("Erro ao rejeitar:", error.message);
      return;
    }

    fetchRequests();
  };

  if (loading) {
    return <Text style={styles.state}>A carregar pedidos…</Text>;
  }

  if (!requests.length) {
    return <Text style={styles.state}>Sem pedidos pendentes</Text>;
  }

  return (
    <View>
      {requests.map((r) => (
        <View key={r.user_id} style={styles.item}>
          <Text style={styles.username}>
            {r.profiles?.username ?? "Utilizador"}
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => acceptRequest(r.user_id)}
              style={styles.acceptBtn}
            >
              <Text style={styles.acceptText}>Aceitar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => rejectRequest(r.user_id)}
              style={styles.rejectBtn}
            >
              <Text style={styles.rejectText}>Recusar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
  },
  acceptBtn: {
    backgroundColor: "#5DBD76",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  acceptText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },
  state: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: "#9ca3af",
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: "#FF4646",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },

  rejectText: {
    color: "#FF4646",
    fontWeight: "700",
    fontSize: 12,
  },
});
