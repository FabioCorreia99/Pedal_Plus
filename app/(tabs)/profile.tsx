import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Settings, X } from 'lucide-react-native';

const COLORS = { primaryGreen: "#5DBD76", primaryOrange: "#FF9E46", darkText: "#1A1A1A", teal: "#35C2C1" };

export default function ProfileScreen() {
  const [subView, setSubView] = useState('main');

  // --- Sub-components simplificados para caber no ficheiro ---
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
      {subView === 'edit' && <><SubViewHeader title="Editar Perfil" /><View style={styles.content}><Text style={{padding:24}}>Formulário de Edição...</Text></View></>}
      {subView === 'settings' && <><SubViewHeader title="Definições" /><View style={styles.content}><Text style={{padding:24}}>Lista de Definições...</Text></View></>}
      {subView === 'badges' && <><SubViewHeader title="Crachás" /><View style={styles.content}><Text style={{padding:24}}>Lista de Crachás...</Text></View></>}
      {subView === 'goals' && <><SubViewHeader title="Objetivos" /><View style={styles.content}><Text style={{padding:24}}>Lista de Objetivos...</Text></View></>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: '#F5F7F8', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  profileCard: { backgroundColor: 'white', marginTop: -40, marginHorizontal: 24, borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  dashBtn: { flex: 1, backgroundColor: COLORS.primaryOrange, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 4 },
  dashBtnText: { color: 'white', fontWeight: 'bold' },
});