import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { NavigationProvider } from "@/context/NavigationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <NavigationProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {/* Definimos headerShown: false para esconder a barra de topo padrão em todas as páginas */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* 1. Rota Inicial (Welcome Page) */}
          <Stack.Screen name="index" />

          {/* 2. Rotas de Autenticação */}
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />

          {/* 3. Aplicação Principal (Tabs) */}
          <Stack.Screen name="(tabs)" />

          {/* 4. Modais (com cabeçalho visível se necessário) */}
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </NavigationProvider>
  );
}
