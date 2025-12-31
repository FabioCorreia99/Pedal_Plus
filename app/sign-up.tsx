import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Lock, User, Smile } from 'lucide-react-native';
import AuthBackground from '../components/AnimatedBackground';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);

    // Validação básica
    if(!email || !password || !username) {
        Alert.alert('Erro', 'Preenche todos os campos obrigatórios.');
        setLoading(false);
        return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // Isto vai para o trigger que criámos na BD
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      Alert.alert('Erro', signUpError.message);
    } else {
      Alert.alert('Sucesso', 'Conta criada! Verifica o teu email ou faz login.');
      router.replace('./sign-in'); // Ou router.replace('/(tabs)') se o email confirm estiver desligado
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-white">
      <AuthBackground />

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-8 pt-12 z-10">
        
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="absolute top-12 left-8 p-2 bg-white/80 rounded-full z-20"
        >
          <ArrowLeft color="#4B5563" size={24} />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-800 mb-8 mt-10">
          Cria a tua conta
        </Text>

        {/* Input Username (Obrigatório) */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4 border border-gray-200">
          <Smile color="#9CA3AF" size={20} />
          <TextInput
            className="flex-1 ml-3 text-gray-800 text-base"
            placeholder="Username (único)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Input Full Name */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4 border border-gray-200">
          <User color="#9CA3AF" size={20} />
          <TextInput
            className="flex-1 ml-3 text-gray-800 text-base"
            placeholder="Nome Completo"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Input Email */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4 border border-gray-200">
          <Mail color="#9CA3AF" size={20} />
          <TextInput
            className="flex-1 ml-3 text-gray-800 text-base"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Input Password */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-8 border border-gray-200">
          <Lock color="#9CA3AF" size={20} />
          <TextInput
            className="flex-1 ml-3 text-gray-800 text-base"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Botão Registar */}
        <TouchableOpacity 
          onPress={signUpWithEmail}
          disabled={loading}
          className="w-full bg-green-600 py-4 rounded-xl items-center shadow-md mb-6"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Criar Conta</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}