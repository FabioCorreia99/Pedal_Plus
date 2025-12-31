import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  ViewStyle
} from 'react-native';
import { 
  Eye, 
  EyeOff, 
  Mountain, 
  Map as MapIcon, 
  Check, 
  Move,
  Cloud,
  Bike
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// AJUSTE O CAMINHO DA IMPORTAÇÃO CONFORME A ESTRUTURA DO SEU PROJETO
import { supabase } from '../lib/supabase'; 

import Logo from '../assets/logo_with_name.svg';
import Left from '../assets/init.svg';
import Top from '../assets/init2.svg';
import Right from '../assets/track.svg';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  white: "#FFFFFF",
  gray: "#888888",
  inputBorder: "#333333",
};

// --- COMPONENTE DE ANIMAÇÃO (FORNECIDO) ---
interface FloatingProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  rotate?: boolean;
}

const FloatingElement: React.FC<FloatingProps> = ({ 
  children, 
  style, 
  delay = 0, 
  duration = 4000,
  rotate = true 
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          delay: delay,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const timeout = setTimeout(() => animation.start(), delay);

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [floatAnim, delay, duration]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const rotateInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '5deg'], 
  });

  const animatedStyle = {
    transform: [
      { translateY },
      { rotate: rotate ? rotateInterpolation : '5deg' }
    ]
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

// --- TELA DE SIGN IN ---
export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DO SUPABASE ---
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('./(tabs)/'); 
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('./(tabs)/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erro no Login', error.message);
      } 
      // O redirecionamento acontece automaticamente pelo onAuthStateChange
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />
      
      {/* --- Header Section (Verde com Animações) --- */}
      <View style={styles.headerContainer}>
        
        {/* Ícones Flutuantes de Fundo */}
        <FloatingElement 
          style={{ position: 'absolute', top: 50, left: -50 } as ViewStyle} 
          duration={5000} 
          rotate={true}
        >
          <Left width={170} height={170} color="white" style={{ opacity: 1 }} />
        </FloatingElement>

        <FloatingElement 
          style={{ position: 'absolute', top: -30, right:100 } as ViewStyle} 
          duration={6000} 
          delay={1000}
        >
          <Top width={150} height={150} color="white" strokeWidth={1} style={{ opacity: 1 }} />
        </FloatingElement>

        <FloatingElement 
          style={{ position: 'absolute', bottom: 40, right: -20 } as ViewStyle} 
          duration={5500} 
          delay={500}
        >
          <Right height={120} width={120} color="white" strokeWidth={1} style={{ opacity: 1 }} />
        </FloatingElement>

        {/* Logo Central */}
        <View style={styles.logoWrapper}>
          <Logo width={100} height={100} />
        </View>
      </View>

      {/* --- Body Section (Branco) --- */}
      <View style={styles.bodyContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Welcome back</Text>

            {/* Input de Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#ccc"
                />
                <View style={styles.floatingLabelContainer}>
                  <Text style={styles.floatingLabelText}>email address</Text>
                </View>
              </View>
            </View>

            {/* Input de Senha */}
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  placeholderTextColor="#ccc"
                />
                
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <Eye size={20} color={COLORS.darkText} />
                  ) : (
                    <EyeOff size={20} color={COLORS.darkText} />
                  )}
                </TouchableOpacity>

                <View style={styles.floatingLabelContainer}>
                  <Text style={styles.floatingLabelText}>password</Text>
                </View>
              </View>
            </View>

            {/* Remember Me */}
            <View style={styles.rememberRow}>
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Check size={14} color={COLORS.darkText} />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>forgot your password?</Text>
            </TouchableOpacity>

            {/* Botão Login */}
            <TouchableOpacity 
              style={styles.loginButton} 
              activeOpacity={0.8}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don´t have an account yet? </Text>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <Text style={styles.signupText}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryGreen,
  },
  // --- Header Styles ---
  headerContainer: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden', // Importante para as animações não vazarem
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Logo acima das animações
  },
  logoIconContainer: {
    marginBottom: 10,
    width: 60,
    height: 60,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // --- Body Styles ---
  bodyContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 40,
    paddingHorizontal: 30,
    marginTop: -25, 
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    color: COLORS.darkText,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif', 
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkText,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '400',
  },

  // --- Input Styles ---
  inputGroup: {
    marginBottom: 25,
  },
  inputContainer: {
    position: 'relative',
    height: 55,
    justifyContent: 'center',
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: COLORS.darkText,
  },
  floatingLabelContainer: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: 5,
    zIndex: 1,
  },
  floatingLabelText: {
    fontSize: 14,
    color: COLORS.darkText,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },

  // --- Actions Styles ---
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.darkText,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    // Estilo opcional para checkbox marcado
  },
  rememberText: {
    fontSize: 15,
    color: COLORS.darkText,
  },
  forgotButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotText: {
    color: COLORS.primaryOrange,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.primaryOrange,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.darkText,
    fontSize: 15,
  },
  signupText: {
    color: COLORS.primaryOrange,
    fontSize: 15,
    fontWeight: 'bold',
  },
});