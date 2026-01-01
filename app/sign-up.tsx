import { useRouter } from 'expo-router';
import {
  Eye,
  EyeOff
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

import { supabase } from '../lib/supabase';

import Left from '../assets/init.svg';
import Top from '../assets/init2.svg';
import Logo from '../assets/logo_with_name.svg';
import Right from '../assets/track.svg';

const { width, height } = Dimensions.get('window');

// --- CORES ---
const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  white: "#FFFFFF",
  grayBorder: "#888888",
};

// --- ANIMAÇÃO FLUTUANTE (Solicitada) ---
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

// --- TELA DE CADASTRO (REGISTER) ---
export default function SignUpScreen() {
  const router = useRouter();
  
  // Estados do Formulário
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de Controle
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DO SUPABASE ---
  useEffect(() => {
    // Verifica se já existe sessão ativa
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
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !username || !confirmPassword) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      // 1. VERIFICAÇÃO PRÉVIA: O username já existe?
      // Como a tabela profiles é pública (geralmente), podemos consultar.
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        Alert.alert('Erro', 'Este nome de utilizador já está em uso. Por favor, escolha outro.');
        setLoading(false);
        return; 
      }
      if (checkError) {
        Alert.alert('Erro', 'Erro ao verificar nome de utilizador: ' + checkError.message);
        setLoading(false);
        return;
      }
      // Criação de conta no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Salvando username nos metadados
          },
        },
      });

      if (error) {
        Alert.alert('Erro no Cadastro', error.message);
      } else {
        // Se o email confirmation estiver desligado no Supabase, loga direto.
        // Se estiver ligado, avisa o usuário.
        if (data.session) {
           router.replace('./(tabs)/');
        } else {
           Alert.alert('Sucesso', 'Verifique seu e-mail para confirmar o cadastro!');
           router.replace('./sign-in'); // Ou para a tela de login
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryGreen} />
      
      {/* --- CABEÇALHO VERDE --- */}
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
          style={{ position: 'absolute', bottom: 20, right: -20 } as ViewStyle} 
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

      {/* --- CORPO BRANCO --- */}
      <View style={styles.bodyContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.welcomeText}>Welcome</Text>

            {/* Input: Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>email address</Text>
              <TextInput 
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Input: Username */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>username</Text>
              <TextInput 
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Input: Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>password</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={styles.inputPasswordFlex}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  {isPasswordVisible ? 
                    <Eye size={20} color={COLORS.darkText} /> : 
                    <EyeOff size={20} color={COLORS.darkText} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Input: Re-type Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>re-type password</Text>
              <View style={styles.passwordContainer}>
                <TextInput 
                  style={styles.inputPasswordFlex}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                  {isConfirmPasswordVisible ? 
                    <Eye size={20} color={COLORS.darkText} /> : 
                    <EyeOff size={20} color={COLORS.darkText} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Registrar */}
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            {/* Rodapé Link */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/sign-in')}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryGreen,
  },
  // --- Header Styles ---
  headerContainer: {
    height: height * 0.30, // 35% da tela
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconWrapper: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  logoText: {
    fontSize: 36,
    color: COLORS.white,
    fontWeight: '500',
    letterSpacing: 1,
  },
  decorativeLeft: {
    position: 'absolute',
    top: 60,
    left: 20,
    opacity: 0.8,
  },
  decorativeRight: {
    position: 'absolute',
    top: 80,
    right: 20,
    opacity: 0.8,
  },
  
  // --- Body Styles ---
  bodyContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden', // Garante que o conteudo respeite o radius
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
  },
  welcomeText: {
    fontSize: 38,
    color: COLORS.darkText,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif', // Tenta imitar a fonte serifada
    marginBottom: 30,
  },

  // --- Input Styles Customizados ---
  inputWrapper: {
    marginBottom: 25,
    position: 'relative',
    height: 55, // Altura fixa para alinhar layout
    justifyContent: 'center',
  },
  // O label flutuante com fundo branco para "cortar" a linha
  inputLabel: {
    position: 'absolute',
    top: -10, // Sobe para ficar na linha da borda
    left: 20,
    zIndex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 5,
    fontSize: 14,
    color: COLORS.darkText,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.darkText,
    borderRadius: 25, // Borda bem arredondada como na imagem
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: COLORS.darkText,
    zIndex: 0,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkText,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    zIndex: 0,
  },
  inputPasswordFlex: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
    height: 50, // Garante altura clicável
  },

  // --- Botão ---
  registerButton: {
    backgroundColor: COLORS.primaryOrange,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // --- Footer ---
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.darkText,
  },
  signInLink: {
    fontSize: 14,
    color: COLORS.primaryOrange,
    fontWeight: '500',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    zIndex: 10, // Logo acima das animações
  },
});