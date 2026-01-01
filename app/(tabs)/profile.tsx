import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { Settings, X, LogOut, ChevronRight, User, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase'; // Certifica-te que o caminho está correto

const COLORS = { 
  primaryGreen: "#5DBD76", 
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A", 
  teal: "#35C2C1",
  danger: "#FF4646", // Adicionei cor de erro/logout
  gray: "#F5F7F8"
};

export default function ProfileScreen() {
  const [subView, setSubView] = useState('main');
  const router = useRouter();

  // --- LÓGICA DE LOGOUT ---
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Erro', error.message);
      } else {
        // Redireciona para o login após sair
        router.replace('/sign-in'); 
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um problema ao sair.');
    }
  };

  // --- COMPONENTES AUXILIARES ---

  // Item simples de menu para as definições
  const SettingsItem = ({ icon: Icon, label, color = COLORS.darkText, onPress }: any) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Icon size={22} color={color} />
        <Text style={{ fontSize: 16, color: color, fontWeight: '500' }}>{label}</Text>
      </View>
      <ChevronRight size={20} color="#CCC" />
    </TouchableOpacity>
  );

  const MainView = () => (
    <>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between' }}>
         <TouchableOpacity onPress={() => setSubView('edit')}><Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Editar</Text></TouchableOpacity>
         <TouchableOpacity onPress={() => setSubView('settings')}><Settings color="white" size={24} /></TouchableOpacity>
      </View>
      <View style={styles.content}>
         <ScrollView>
            <View style={styles.profileCard}>
               <Image source={{ uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200" }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'white' }} />
               <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Georg Knorr</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingRight: 16 }}>
                      <View><Text style={{fontSize:16, fontWeight:'bold'}}>270</Text><Text style={{fontSize:12, color:'#666'}}>Rides</Text></View>
                      <View><Text style={{fontSize:16, fontWeight:'bold'}}>102</Text><Text style={{fontSize:12, color:'#666'}}>Seguidores</Text></View>
                      <View><Text style={{fontSize:16, fontWeight:'bold'}}>178</Text><Text style={{fontSize:12, color:'#666'}}>A Seguir</Text></View>
                  </View>
               </View>
            </View>
            
            {/* Stats Chart Mock */}
            <View style={{ marginHorizontal: 24, marginTop: 24, backgroundColor: 'white', padding: 16, borderRadius: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 }}>
                   {[10, 20, 15, 30, 20, 10, 35].map((val, i) => (
                      <View key={i} style={{ alignItems: 'center', width: 20 }}>
                          <View style={{ width: 12, height: val * 3, backgroundColor: i === 6 ? COLORS.teal : '#cbd5e1', borderRadius: 6 }}></View>
                          <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{['S','T','Q','Q','S','S','D'][i]}</Text>
                      </View>
                   ))}
                </View>
            </View>

            <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
               <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Dashboard</Text>
               <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity onPress={() => setSubView('badges')} style={styles.dashBtn}><Text style={styles.dashBtnText}>Crachás</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => setSubView('goals')} style={styles.dashBtn}><Text style={styles.dashBtnText}>Objetivos</Text></TouchableOpacity>
               </View>
            </View>
         </ScrollView>
      </View>
    </>
  );

  const SubViewHeader = ({ title }: { title: string }) => (
    <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
      <TouchableOpacity onPress={() => setSubView('main')}><X color="white" size={24} /></TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primaryGreen }}>
      {subView === 'main' && <MainView />}
      
      {subView === 'edit' && (
        <>
          <SubViewHeader title="Editar Perfil" />
          <View style={styles.content}>
            <Text style={{padding:24}}>Formulário de Edição...</Text>
          </View>
        </>
      )}

      {/* --- TELA DE DEFINIÇÕES COM LOGOUT --- */}
      {subView === 'settings' && (
        <>
          <SubViewHeader title="Definições" />
          <View style={styles.content}>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              
              <Text style={styles.sectionTitle}>Conta</Text>
              <View style={styles.settingsGroup}>
                <SettingsItem icon={User} label="Dados Pessoais" onPress={() => {}} />
                <View style={styles.divider} />
                <SettingsItem icon={Bell} label="Notificações" onPress={() => {}} />
              </View>

              <Text style={styles.sectionTitle}>Ações</Text>
              <View style={styles.settingsGroup}>
                {/* Botão de Logout */}
                <TouchableOpacity style={styles.settingsItem} onPress={handleLogout}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <LogOut size={22} color={COLORS.danger} />
                    <Text style={{ fontSize: 16, color: COLORS.danger, fontWeight: '600' }}>Terminar Sessão</Text>
                  </View>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </>
      )}

      {subView === 'badges' && <><SubViewHeader title="Crachás" /><View style={styles.content}><Text style={{padding:24}}>Lista de Crachás...</Text></View></>}
      {subView === 'goals' && <><SubViewHeader title="Objetivos" /><View style={styles.content}><Text style={{padding:24}}>Lista de Objetivos...</Text></View></>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: COLORS.gray, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  profileCard: { backgroundColor: 'white', marginTop: -40, marginHorizontal: 24, borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  dashBtn: { flex: 1, backgroundColor: COLORS.primaryOrange, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 4 },
  dashBtnText: { color: 'white', fontWeight: 'bold' },
  
  // Novos Estilos para as Definições
  sectionTitle: { fontSize: 14, color: '#888', marginBottom: 8, marginTop: 16, fontWeight: '600', marginLeft: 4 },
  settingsGroup: { backgroundColor: 'white', borderRadius: 16, padding: 8, elevation: 2 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 50 }
});