// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Heart, Home, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const COLORS = {
  primaryOrange: "#FF9E46",
};

// Componente da Barra Personalizada
function MyTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let IconComponent: any;
        let label = "";

        if (route.name === "index") {
          IconComponent = Home;
          label = "Home";
        } else if (route.name === "favorites") {
          IconComponent = Heart;
          label = "Favoritos";
        } else if (route.name === "community") {
          IconComponent = MessageCircle;
          label = "Comunidade";
        } else if (route.name === "profile") {
          IconComponent = User;
          label = "Perfil";
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.navItem}
          >
            {IconComponent && (
              <IconComponent
                size={24}
                color={isFocused ? COLORS.primaryOrange : "#9ca3af"}
                strokeWidth={isFocused ? 2.5 : 2}
              />
            )}
            <Text
              style={[
                styles.navText,
                { color: isFocused ? COLORS.primaryOrange : "#9ca3af" },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <MyTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="favorites" />
        <Tabs.Screen name="community" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#f3f4f6",
    backgroundColor: "white",
    paddingBottom: 30, // Padding extra para iPhones sem botão
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },
});
