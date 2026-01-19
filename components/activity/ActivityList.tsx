import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

dayjs.extend(relativeTime);

/* ---------- TYPES ---------- */

interface Activity {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  completed_at: string;
  photo_url: string | null;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

type FeedMode = "public" | "friends" | "me";

interface ActivityListProps {
  mode?: FeedMode;
  limit?: number;
}

/* ---------- COMPONENT ---------- */

export default function ActivityList({
  mode = "public",
  limit = 10,
}: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [canFollowMap, setCanFollowMap] = useState<Record<string, boolean>>({});

  const handleFollow = async (activity: Activity) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    if (activity.user_id === user.id) return;

    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: activity.user_id,
      status: "pending",
    });

    if (error) {
      console.error("Erro ao seguir:", error.message);
      return;
    }

    // 👇 AQUI
    setCanFollowMap((prev) => ({
      ...prev,
      [activity.user_id]: false,
    }));

    alert("Pedido de amizade enviado");
  };

  /* ---------- FETCH ---------- */

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: relations } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      const relatedUserIds = new Set<string>();

      relations?.forEach((r) => {
        if (r.user_id === user.id) {
          relatedUserIds.add(r.friend_id);
        } else {
          relatedUserIds.add(r.user_id);
        }
      });

      let query = supabase
        .from("activities")
        .select(
          `
  id,
  user_id,
  title,
  description,
  distance_km,
  duration_minutes,
  completed_at,
  photo_url,
  profiles (
    username,
    avatar_url
  )
`,
        )

        .order("completed_at", { ascending: false })
        .limit(limit);

      // FEED PESSOAL
      if (mode === "me") {
        query = query.eq("user_id", user.id);
      }

      // FEED PÚBLICO
      if (mode === "public") {
        query = query.eq("visibility", "public");
      }

      // FEED DE AMIGOS
      if (mode === "friends") {
        const { data: friendships, error: friendsError } = await supabase
          .from("friendships")
          .select("user_id, friend_id")
          .eq("status", "accepted")
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        if (friendsError) {
          console.error(friendsError);
          return;
        }

        const friendIds = friendships.map((f) =>
          f.user_id === user.id ? f.friend_id : f.user_id,
        );

        if (!friendIds.length) {
          setActivities([]);
          setLoading(false);
          return;
        }

        query = query.eq("visibility", "friends").in("user_id", friendIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao carregar atividades:", error.message);
        return;
      }

      const activitiesData = (data as unknown as Activity[]) ?? [];
      setActivities(activitiesData);

      // calcular se pode seguir cada user
      const followChecks: Record<string, boolean> = {};

      activitiesData.forEach((activity) => {
        followChecks[activity.user_id] =
          activity.user_id !== user.id && !relatedUserIds.has(activity.user_id);
      });

      setCanFollowMap(followChecks);
    } finally {
      setLoading(false);
    }
  }, [mode, limit]);

  /* ---------- EFFECT ---------- */

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [fetchActivities]),
  );

  /* ---------- STATES ---------- */

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>A carregar atividade…</Text>
      </View>
    );
  }

  if (!activities.length) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>
          {mode === "me"
            ? "Ainda não registaste nenhuma atividade"
            : mode === "friends"
              ? "Ainda não há atividades de amigos"
              : "Ainda não há atividade para mostrar"}
        </Text>
      </View>
    );
  }

  /* ---------- UI ---------- */

  return (
    <View style={styles.list}>
      {activities.map((activity) => {
        const username = activity.profiles?.username ?? "Utilizador";

        return (
          <View key={activity.id} style={styles.item}>
            {/* AVATAR */}
            {activity.profiles?.avatar_url ? (
              <Image
                source={{ uri: activity.profiles.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* TEXTO */}
            <View style={styles.feedTextContainer}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.userName}>{username}</Text>

                {/* BOTÃO FOLLOW */}
                {canFollowMap[activity.user_id] && (
                  <Text
                    onPress={() => handleFollow(activity)}
                    style={{
                      marginLeft: 10,
                      fontSize: 12,
                      color: "#FF9E46",
                      fontWeight: "600",
                    }}
                  >
                    Seguir
                  </Text>
                )}
              </View>

              <Text style={styles.feedDate}>
                {dayjs(activity.completed_at).fromNow()}
              </Text>

              <Text style={styles.feedAction}>
                Completou um passeio de{" "}
                <Text style={styles.bold}>
                  {(activity.distance_km ?? 0).toFixed(1)} km
                </Text>
              </Text>

              {activity.title ? (
                <Text style={styles.subtitle}>{activity.title}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  list: {
    marginTop: 8,
  },

  item: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
  },

  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 15,
    backgroundColor: "#FF9E46",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitial: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  feedTextContainer: {
    flex: 1,
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  feedDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
  },

  feedAction: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },

  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  bold: {
    fontWeight: "600",
  },

  stateContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },

  stateText: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
