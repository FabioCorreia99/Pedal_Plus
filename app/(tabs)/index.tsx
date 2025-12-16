import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { MapPin, Search, ArrowLeft, AlertTriangle } from 'lucide-react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import InteractiveMap from '../../components/InteractiveMap';

const COLORS = {
  primaryGreen: "#5DBD76", 
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A",
};

export default function HomeScreen() {
  const [routeState, setRouteState] = useState<'search' | 'confirm' | 'navigating'>('search');
  const [rideMode, setRideMode] = useState('Turist'); 

  // --- Render Functions (Search, Confirm, Navigating) ---
  // (Copiei a lógica exata que tínhamos antes, mas simplifiquei para caber aqui)
  
  return (
    <View style={{ flex: 1, backgroundColor: '#eff6ff' }}>
      <InteractiveMap />
      
      {(routeState === 'confirm' || routeState === 'navigating') && (
         <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg height="100%" width="100%">
               <Path d="M100,200 Q200,300 300,500" fill="none" stroke="#4338ca" strokeWidth="5" strokeDasharray="10,5" strokeLinecap="round" />
               <SvgCircle cx="100" cy="200" r="8" fill="#facc15" stroke="white" strokeWidth="3" />
               <SvgCircle cx="300" cy="500" r="8" fill="#ef4444" stroke="white" strokeWidth="3" />
               {routeState === 'navigating' && <SvgCircle cx="200" cy="300" r="12" fill={COLORS.primaryGreen} stroke="white" strokeWidth="4" />}
            </Svg>
         </View>
      )}

      {/* SEARCH STATE */}
      {routeState === 'search' && (
        <View style={[styles.bottomSheet, { height: '55%' }]}>
           <View style={{ paddingHorizontal: 24, marginTop: -30 }}>
             <View style={styles.card}>
               <View style={styles.searchRow}>
                 <MapPin color={COLORS.primaryOrange} size={20} />
                 <TextInput placeholder="Kosan Tigade" style={{ flex: 1, marginLeft: 12 }} />
               </View>
               <View style={{ height: 1, backgroundColor: '#eee' }} />
               <View style={styles.searchRow}>
                 <MapPin color="#ef4444" size={20} />
                 <TextInput placeholder="Para onde vais?" style={{ flex: 1, marginLeft: 12 }} onFocus={() => setRouteState('confirm')} />
               </View>
             </View>
           </View>
           <ScrollView style={{ flex: 1, padding: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Rotas Recentes</Text>
              {[1, 2].map(i => (
                <TouchableOpacity key={i} onPress={() => setRouteState('confirm')} style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6'}}>
                   <Image source={{ uri: `https://source.unsplash.com/random/100x100?road,${i}` }} style={{width: 56, height: 56, borderRadius: 28, marginRight: 16}} />
                   <View><Text style={{fontWeight:'bold'}}>Casa ••• Trabalho</Text><Text style={{color:'#999', fontSize: 12}}>13km • 17min</Text></View>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>
      )}

      {/* CONFIRM STATE */}
      {routeState === 'confirm' && (
        <View style={styles.bottomSheet}>
           <View style={{ padding: 24 }}>
              <View style={[styles.card, {marginBottom: 24}]}>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}><MapPin color="#facc15" size={20} /><Text style={{marginLeft: 10, fontWeight: 'bold'}}>Origem</Text></View>
                 <View style={{flexDirection: 'row', alignItems: 'center'}}><MapPin color="#ef4444" size={20} /><Text style={{marginLeft: 10, fontWeight: 'bold'}}>Destino</Text></View>
              </View>
              <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Modo de Viagem</Text>
              <View style={{ flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 4, borderRadius: 12, marginBottom: 32 }}>
                 {['Sport', 'Turist', 'Safest'].map(mode => (
                    <TouchableOpacity key={mode} onPress={() => setRideMode(mode)} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: rideMode === mode ? 'white' : 'transparent', elevation: rideMode === mode ? 2 : 0 }}>
                       <Text style={{ fontSize: 12, fontWeight: 'bold', color: rideMode === mode ? COLORS.primaryGreen : '#9ca3af' }}>{mode}</Text>
                    </TouchableOpacity>
                 ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                 <TouchableOpacity onPress={() => setRouteState('search')} style={{ flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' }}><Text style={{fontWeight:'bold', color: '#666'}}>Cancelar</Text></TouchableOpacity>
                 <TouchableOpacity onPress={() => setRouteState('navigating')} style={{ flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: COLORS.primaryOrange }}><Text style={{fontWeight:'bold', color: 'white'}}>Iniciar</Text></TouchableOpacity>
              </View>
           </View>
        </View>
      )}

      {/* NAVIGATING STATE */}
      {routeState === 'navigating' && (
        <>
          <TouchableOpacity onPress={() => setRouteState('confirm')} style={{ position: 'absolute', top: 60, left: 16, zIndex: 20, backgroundColor: 'white', padding: 12, borderRadius: 50 }}>
             <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <View style={[styles.bottomSheet, { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
             <View style={{ alignItems: 'center' }}>
                <View style={{ backgroundColor: '#ffedd5', padding: 12, borderRadius: 16, marginBottom: 4 }}><AlertTriangle size={28} color="#f97316" /></View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>Em 100m</Text>
             </View>
             <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>13:06</Text>
                <Text style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}>3 MIN • 0.6 KM</Text>
             </View>
             <TouchableOpacity style={{ backgroundColor: 'white', padding: 12, borderRadius: 50, elevation: 5 }}><Search size={24} color="#333"/></TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, elevation: 20,
  },
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 16,
    elevation: 5, borderWidth: 1, borderColor: '#f3f4f6'
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }
});