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

interface ActivityListProps {
  /** true -> apenas atividades do user logado (Profile)
   *  false -> feed público (Community)
   */
  userOnly?: boolean;
  limit?: number;
}

/* ---------- COMPONENT ---------- */

export default function ActivityList({
  userOnly = false,
  limit = 10,
}: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH ---------- */

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      let query = supabase
        .from("activities")
        .select(
          `
          id,
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

      if (userOnly) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("visibility", "public");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao carregar atividades:", error.message);
        return;
      }

      setActivities((data as unknown as Activity[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, [userOnly, limit]);

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
          {userOnly
            ? "Ainda não registaste nenhuma atividade"
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

            {/* CONTENT */}
            <View style={styles.content}>
              <Text style={styles.name}>{username}</Text>

              <Text style={styles.date}>
                {dayjs(activity.completed_at).fromNow()}
              </Text>

              <Text style={styles.text}>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: "#FF9E46",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  date: {
    fontSize: 12,
    color: "#9ca3af",
    marginVertical: 2,
  },
  text: {
    fontSize: 14,
    color: "#333",
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
