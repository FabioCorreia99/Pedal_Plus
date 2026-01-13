import { useRouter } from "expo-router";
import { Bell, X } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  green: "#5DBD76",
  gray: "#F5F7F8",
  text: "#1A1A1A",
  muted: "#666",
};

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
};

const NOTIFICATIONS: NotificationSetting[] = [
  {
    id: "weekly_activity",
    title: "Weekly activity summary",
    description: "Receive a summary of your weekly rides.",
  },
  {
    id: "new_badge",
    title: "New badge unlocked",
    description: "Get notified when you unlock a new badge.",
  },
  {
    id: "new_follower",
    title: "New follower",
    description: "Receive a notification when someone follows you.",
  },
  {
    id: "weekly_goal",
    title: "Weekly goal reminder",
    description: "Reminder to complete your weekly goal.",
  },
  {
    id: "app_updates",
    title: "App updates",
    description: "News and updates about Pedal+.",
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    weekly_activity: true,
    new_badge: true,
    new_follower: false,
    weekly_goal: true,
    app_updates: false,
  });

  const toggleSwitch = (id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Bell size={20} color="white" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={{ padding: 24 }}>
          {NOTIFICATIONS.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>

              <Switch
                value={enabled[item.id]}
                onValueChange={() => toggleSwitch(item.id)}
                trackColor={{ true: COLORS.green }}
              />
            </View>
          ))}
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  description: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },
});
