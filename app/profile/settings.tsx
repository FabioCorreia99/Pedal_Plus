import { useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    Globe,
    HelpCircle,
    Info,
    Lock,
    Phone,
    Ruler,
    User,
    X,
} from "lucide-react-native";
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
};

export default function SettingsScreen() {
  const router = useRouter();

  const Item = ({
    icon: Icon,
    label,
    onPress,
  }: {
    icon: any;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Icon size={20} color={COLORS.text} />
        <Text style={styles.itemText}>{label}</Text>
      </View>
      <ChevronRight size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.green }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Definições</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={22} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Section title="Account">
            <Item
              icon={User}
              label="Perfil"
              onPress={() => router.push("/profile/edit")}
            />
            <Item
              icon={Lock}
              label="Conta"
              onPress={() => router.push("/profile/settings/account")}
            />
            <Item
              icon={Bell}
              label="Notificações"
              onPress={() => router.push("/profile/settings/notifications")}
            />
          </Section>

          <Section title="Preferences">
            <Item
              icon={Globe}
              label="Idioma"
              onPress={() => router.push("/profile/settings/language")}
            />
            <Item
              icon={Ruler}
              label="Unidades"
              onPress={() => router.push("/profile/settings/units")}
            />
          </Section>

          <Section title="Help">
            <Item
              icon={HelpCircle}
              label="Perguntas Frequentes"
              onPress={() => router.push("/profile/settings/faq")}
            />
            <Item
              icon={Phone}
              label="Contacte-nos"
              onPress={() => router.push("/profile/settings/contact")}
            />
            <Item
              icon={Info}
              label="Sobre"
              onPress={() => router.push("/profile/settings/about")}
            />
          </Section>
        </ScrollView>
      </View>
    </View>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

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
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 8,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemText: {
    fontSize: 16,
  },
});
