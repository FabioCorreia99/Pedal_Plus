import { useRouter } from 'expo-router'; // Importação do Expo Router
import {
  ChevronRight,
  Plus
} from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import Logo from '../assets/icon.svg';
import InitIcon from '../assets/init.svg';
import Bikes from '../assets/init2.svg';
import Bike1 from '../assets/init3.svg';
import Bike2 from '../assets/init4.svg';
import Bike4 from '../assets/init6.svg';
import { supabase } from '../lib/supabase'; // Importa a tua config do supabase

// --- TIPAGEM ---
interface ColorPalette {
  primaryGreen: string;
  primaryOrange: string;
  darkText: string;
  white: string;
}

const COLORS: ColorPalette = {
  primaryGreen: "#5DBD76", 
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A",
  white: "#FFFFFF",
};

const { height } = Dimensions.get('window');

// --- COMPONENTE DE ANIMAÇÃO (Efeito "Corpos Espaciais") ---
interface FloatingProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;       // Atraso para começarem em momentos diferentes
  duration?: number;    // Velocidade da flutuação
  rotate?: boolean;     // Se deve rodar ou só flutuar
}

const FloatingElement: React.FC<FloatingProps> = ({ 
  children, 
  style, 
  delay = 0, 
  duration = 4000,
  rotate = true 
}) => {
  // Valores animados iniciais
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cria um loop infinito de "respirar/flutuar"
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration,
          easing: Easing.inOut(Easing.sin), // Movimento suave (senoidal)
          useNativeDriver: true,
          delay: delay, // Atraso inicial apenas na primeira execução se configurado fora
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Pequeno timeout para o delay inicial funcionar visualmente desfasado
    const timeout = setTimeout(() => animation.start(), delay);

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [floatAnim, delay, duration]);

  // Interpolação para movimento vertical (Flutuar)
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  // Interpolação para rotação suave (Orbitar)
  const rotateInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '5deg'], // Rotação sutil
  });

  const animatedStyle = {
    transform: [
      { translateY },
      { rotate: rotate ? rotateInterpolation : '0deg' }
    ]
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

// --- TELA PRINCIPAL ---
export default function WelcomeScreen() {
  const router = useRouter();

  // --- LÓGICA DO SUPABASE ---
  useEffect(() => {
    // Verifica se já existe uma sessão ativa ao abrir a app
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Se o utilizador já estiver logado, vai direto para as tabs
          console.log("Sessão encontrada, redirecionando...");
          router.replace('./(tabs)/'); 
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    checkUser();

    // Opcional: Ouvir mudanças de estado (ex: login noutra aba se fosse web)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('./(tabs)/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* --- SEÇÃO SUPERIOR (VERDE + ESPAÇO) --- */}
      <View style={styles.topSection}>
        
        {/* === ÍCONES FLUTUANTES (BACKGROUND) === */}
        {/* Usei delays e durações diferentes para parecer caótico/espacial */}
        
        {/* Topo Esquerda: Montanhas */}
        <FloatingElement 
          style={{ position: 'absolute', top: height * 0.10, left: -10 } as ViewStyle} 
          duration={5000} 
          delay={0}
        >
          <InitIcon width={120} height={120} style={{ opacity: 0.9 }} />
        </FloatingElement>

        {/* Topo Direita: Mapa */}
        <FloatingElement 
          style={{ position: 'absolute', top: 0, right: -5 } as ViewStyle} 
          duration={6000}
          delay={1000}
        >
          <Bikes width={150} height={150} style={{ opacity: 1 }} />
        </FloatingElement>

        {/* Meio Esquerda: Grupo */}
        <FloatingElement 
          style={{ position: 'absolute', top: height * 0.40, left: -15 } as ViewStyle} 
          duration={5500}
          delay={500}
        >
          <Bike1 width={150} height={150}  strokeWidth={1.5} style={{ opacity: 1 }} />
        </FloatingElement>

        {/* Meio Direita: Troféu */}
        <FloatingElement 
          style={{ position: 'absolute', top: height * 0.5, right: 120 } as ViewStyle} 
          duration={4500}
          delay={2000}
        >
          <Bike2 width={100} height={100}  strokeWidth={1.5} style={{ opacity: 1 }} />
        </FloatingElement>

        {/* Fundo Direita: Chat/Love */}
        <FloatingElement 
          style={{ position: 'absolute', bottom: 100, right: -40 } as ViewStyle}
          duration={7000}
          delay={1500}
        >
          <Bike4 width={150} height={150}  strokeWidth={1.5} style={{ opacity: 1 }} />
        </FloatingElement>

        {/* === LOGO CENTRAL === */}
        <Logo width={100} height={100} />
      </View>

      {/* --- SEÇÃO INFERIOR (CARD BRANCO) --- */}
      <View style={styles.bottomSection}>
        <View style={styles.contentContainer}>
          
          <View style={styles.headerTextContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Pedal</Text>
              <Plus color={COLORS.darkText} size={32} strokeWidth={4} style={{ marginTop: 4 }} />
            </View>
            <Text style={styles.subtitle}>
              Kick off every ride with safer, smarter navigation.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            
            <TouchableOpacity 
              style={styles.primaryButton} 
              activeOpacity={0.8}
              onPress={() => router.push('./sign-up' as any)}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              activeOpacity={0.7}
              onPress={() => router.push('./sign-in' as any)}
            >
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
              <ChevronRight color={COLORS.primaryOrange} size={20} strokeWidth={2.5} />
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryGreen,
  } as ViewStyle,
  
  // --- Estilos da Parte Superior ---
  topSection: {
    flex: 0.55, // REDUZIDO de 0.62 para 0.55 (Dá mais espaço para o branco subir)
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  } as ViewStyle,
  
  centerLogoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 10, // Garante que o logo fica acima dos ícones flutuantes
  } as ViewStyle,
  
  logoBracketLeft: {
    width: 30,
    height: 80,
    borderLeftWidth: 6,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderColor: 'white',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    marginRight: -10,
  } as ViewStyle,
  
  logoBracketRight: {
    width: 30,
    height: 80,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderColor: 'white',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    marginLeft: -10,
  } as ViewStyle,

  // --- Estilos da Parte Inferior ---
  bottomSection: {
    flex: 0.45, 
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 8,
  } as ViewStyle,
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    justifyContent: 'space-between',
  } as ViewStyle,
  
  headerTextContainer: {
    alignItems: 'center',
  } as ViewStyle,
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,
  
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: -0.5,
  } as TextStyle,
  
  subtitle: {
    fontSize: 16,
    color: COLORS.darkText,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    paddingHorizontal: 20,
  } as TextStyle,
  
  buttonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  } as ViewStyle,
  
  primaryButton: {
    backgroundColor: COLORS.primaryOrange,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  } as ViewStyle,
  
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  } as TextStyle,
  
  secondaryButton: {
    backgroundColor: COLORS.white,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.primaryOrange,
    flexDirection: 'row',
    gap: 6,
  } as ViewStyle,
  
  secondaryButtonText: {
    color: COLORS.primaryOrange,
    fontSize: 16,
    fontWeight: '700',
  } as TextStyle,
});