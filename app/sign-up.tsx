import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
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
  ViewStyle,
} from "react-native";

import { supabase } from "../lib/supabase";

import Left from "../assets/init.svg";
import Top from "../assets/init2.svg";
import Logo from "../assets/logo_with_name.svg";
import Right from "../assets/track.svg";

const { height } = Dimensions.get("window");

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
  darkText: "#1A1A1A",
  white: "#FFFFFF",
};

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
  rotate = true,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration,
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
    outputRange: ["-15deg", "5deg"],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateY },
            { rotate: rotate ? rotateInterpolation : "5deg" },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace("./(tabs)/");
      }
    };
    checkSession();
  }, []);

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Erro", "Preenche todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As passwords não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existingUser) {
        Alert.alert("Erro", "O username já está em uso.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) {
        Alert.alert("Erro no registo", error.message);
        return;
      }

      router.replace("./(tabs)/");
    } catch {
      Alert.alert("Erro", "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <FloatingElement style={{ position: "absolute", top: 50, left: -50 }}>
          <Left width={170} height={170} color="white" />
        </FloatingElement>

        <FloatingElement
          style={{ position: "absolute", top: -30, right: 100 }}
          delay={1000}
        >
          <Top width={150} height={150} color="white" />
        </FloatingElement>

        <FloatingElement
          style={{ position: "absolute", bottom: 20, right: -20 }}
          delay={500}
        >
          <Right width={120} height={120} color="white" />
        </FloatingElement>

        <Logo width={100} height={100} />
      </View>

      <View style={styles.bodyContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.welcomeText}>Bem-vindo</Text>

            <Input label="endereço de email" value={email} onChange={setEmail} />
            <Input label="nome de utilizador" value={username} onChange={setUsername} />

            <PasswordInput
              label="palavra-passe"
              value={password}
              visible={isPasswordVisible}
              toggle={() => setIsPasswordVisible(!isPasswordVisible)}
              onChange={setPassword}
            />

            <PasswordInput
              label="repetir palavra-passe"
              value={confirmPassword}
              visible={isConfirmPasswordVisible}
              toggle={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
              onChange={setConfirmPassword}
            />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>Registar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push("/sign-in")}>
                <Text style={{ color: COLORS.primaryOrange }}>Iniciar sessão</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

/* ---------- COMPONENTS ---------- */

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} />
    </View>
  );
}

function PasswordInput({
  label,
  value,
  visible,
  toggle,
  onChange,
}: {
  label: string;
  value: string;
  visible: boolean;
  toggle: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPasswordFlex}
          value={value}
          secureTextEntry={!visible}
          onChangeText={onChange}
        />
        <TouchableOpacity onPress={toggle}>
          {visible ? (
            <Eye size={20} color={COLORS.darkText} />
          ) : (
            <EyeOff size={20} color={COLORS.darkText} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryGreen },
  headerContainer: {
    height: height * 0.3,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  scrollContent: {
    padding: 30,
  },
  welcomeText: {
    fontSize: 38,
    textAlign: "center",
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 25,
    position: "relative",
    height: 55,
    justifyContent: "center",
  },

  inputLabel: {
    position: "absolute",
    top: -10,
    left: 20,
    backgroundColor: "white",
    paddingHorizontal: 5,
    fontSize: 14,
    color: COLORS.darkText,
    zIndex: 1,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.darkText,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: COLORS.darkText,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.darkText,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
  },

  inputPasswordFlex: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
  },

  registerButton: {
    backgroundColor: COLORS.primaryOrange,
    height: 55,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
