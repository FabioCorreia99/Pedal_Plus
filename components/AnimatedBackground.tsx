import { Compass, Footprints, Map, Mountain, Tent, Trees } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

// Configuração dos ícones flutuantes
// Podes adicionar ou remover ícones aqui e mudar as posições (top, left)
const FLOATING_ICONS = [
  { Icon: Map, size: 64, top: '15%', left: '10%', delay: 0 },
  { Icon: Compass, size: 48, top: '25%', left: '80%', delay: 1000 },
  { Icon: Footprints, size: 56, top: '55%', left: '15%', delay: 500 },
  { Icon: Mountain, size: 72, top: '65%', left: '75%', delay: 1500 },
  { Icon: Tent, size: 40, top: '85%', left: '30%', delay: 200 },
  { Icon: Trees, size: 50, top: '10%', left: '60%', delay: 800 },
];

const FloatingIcon = ({ Icon, size, top, left, delay }: any) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Efeito de levitação: Sobe e desce infinitamente
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
        ),
        -1, // Infinito
        true // Reverse (vai e volta suavemente)
      )
    );
  }, [translateY, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View 
      style={[
        { position: 'absolute', top, left, opacity: 0.15 }, // Opacidade baixa para ser subtil
        animatedStyle
      ]}
    >
      <Icon size={size} color="#000" /> 
      {/* Muda a cor acima para branco se o teu fundo for escuro */}
    </Animated.View>
  );
};

export default function AuthBackground() {
  return (
    <View className="absolute inset-0 bg-white items-center justify-center overflow-hidden">
      {/* Aqui podes mudar a cor de fundo 'bg-white' para outra cor se quiseres */}
      
      {/* Renderiza todos os ícones configurados acima */}
      {FLOATING_ICONS.map((item, index) => (
        <FloatingIcon 
          key={index}
          Icon={item.Icon}
          size={item.size}
          top={item.top}
          left={item.left}
          delay={item.delay}
        />
      ))}
    </View>
  );
}