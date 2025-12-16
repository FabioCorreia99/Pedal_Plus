// app/(tabs)/_layout.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Heart, MessageCircle, User } from 'lucide-react-native';

const COLORS = {
  primaryOrange: "#FF9E46",
};

// Componente da Barra Personalizada
function MyTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Definir ícone e label baseado na rota
        let IconComponent;
        let label;

        if (route.name === 'index') {
          IconComponent = Home;
          label = 'Home';
        } else if (route.name === 'favorites') {
          IconComponent = Heart;
          label = 'Favoritos';
        } else if (route.name === 'community') {
          IconComponent = MessageCircle;
          label = 'Comunidade';
        } else if (route.name === 'profile') {
          IconComponent = User;
          label = 'Perfil';
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
                color={isFocused ? COLORS.primaryOrange : '#9ca3af'} 
                strokeWidth={isFocused ? 2.5 : 2}
              />
            )}
            <Text style={[
              styles.navText, 
              { color: isFocused ? COLORS.primaryOrange : '#9ca3af' }
            ]}>
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
    <Tabs tabBar={props => <MyTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: 'white',
    paddingBottom: 30, // Padding extra para iPhones sem botão
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
});