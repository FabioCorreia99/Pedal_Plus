import * as Location from 'expo-location';
import { AlertTriangle, ArrowLeft, MapPin, Search } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import InteractiveMap from '../../components/InteractiveMap';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const COLORS = {
  primaryGreen: "#5DBD76", 
  primaryOrange: "#FF9E46", 
  darkText: "#1A1A1A",
};

export default function HomeScreen() {
  type LatLng = { latitude: number; longitude: number };
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [originLabel, setOriginLabel] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [routeState, setRouteState] = useState<'search' | 'confirm' | 'navigating'>('search');
  const [rideMode, setRideMode] = useState('Tourist');
  const [showOriginSearch, setShowOriginSearch] = useState(false);
  const [showDestinationSearch, setShowDestinationSearch] = useState(false);
  
  const originRef = useRef<any>(null);
  const destinationRef = useRef<any>(null);
   
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setOrigin(coords);
      setOriginLabel('Current Location');
    })();
  }, []);

  useEffect(() => {
    if (origin && destination && routeState === 'search') {
      setRouteState('confirm');
    }
  }, [origin, destination, routeState]);

  const handleConfirmDestination = () => {
    if (destination) {
      setRouteState('navigating');
    }
  };

  const resetInputs = () => {
    setOrigin(null);
    setDestination(null);
    setOriginLabel('');
    setDestinationLabel('');
    setRouteState('search');
    if (originRef.current) originRef.current.clear();
    if (destinationRef.current) destinationRef.current.clear();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#eff6ff' }}>
      <InteractiveMap
        lat={origin?.latitude ?? 52.3676}
        lon={origin?.longitude ?? 4.9041}
        zoom={13}
        showRoute={routeState !== 'search'}
        origin={origin ?? undefined}
        destination={destination ?? undefined}
        currentPosition={routeState === 'navigating' ? origin ?? undefined : undefined}
      />

      {/* SEARCH STATE */}
      {routeState === 'search' && (
        <View style={[styles.bottomSheet, { height: '55%' }]}>
           <View style={{ paddingHorizontal: 24, marginTop: -30 }}>
             <View style={[styles.card, showOriginSearch || showDestinationSearch ? { zIndex: 10000 } : {}]}>
               {/* ORIGIN */}
               <View style={styles.searchRow}>
                 <MapPin color={COLORS.primaryOrange} size={20} />
                 {showOriginSearch ? (
                   <View style={{ flex: 1, marginLeft: 12 }}>
                     <GooglePlacesAutocomplete
                       ref={originRef}
                       placeholder="Search origin"
                       fetchDetails={true}
                       debounce={300}
                       onPress={(data, details = null) => {
                         if (details) {
                           setOrigin({
                             latitude: details.geometry.location.lat,
                             longitude: details.geometry.location.lng,
                           });
                           setOriginLabel(data.description);
                           setShowOriginSearch(false);
                         }
                       }}
                       query={{
                         key: GOOGLE_API_KEY,
                         language: 'pt',
                         components: 'country:pt',
                       }}
                       styles={{
                         container: { flex: 0 },
                         textInput: {
                           height: 38,
                           fontSize: 14,
                           paddingVertical: 0,
                         },
                         listView: {
                          position: 'absolute',
                          top: 40,
                          zIndex: 9999,  // Increase from 1000
                          backgroundColor: 'white',
                          borderRadius: 8,
                          elevation: 10,  // Add higher elevation than card
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                        },
                       }}
                       enablePoweredByContainer={false}
                       textInputProps={{
                         autoFocus: true,
                       }}
                     />
                   </View>
                 ) : (
                   <TouchableOpacity 
                     style={{ flex: 1, marginLeft: 12 }}
                     onPress={() => setShowOriginSearch(true)}
                   >
                     <Text style={{ fontSize: 14, color: originLabel ? '#1A1A1A' : '#999' }}>
                       {originLabel || 'Origin'}
                     </Text>
                   </TouchableOpacity>
                 )}
               </View>
               
               <View style={{ height: 1, backgroundColor: '#eee' }} />
               
               {/* DESTINATION */}
               <View style={styles.searchRow}>
                 <MapPin color="#ef4444" size={20} />
                 {showDestinationSearch ? (
                   <View style={{ flex: 1, marginLeft: 12 }}>
                     <GooglePlacesAutocomplete
                       ref={destinationRef}
                       placeholder="Search destination"
                       fetchDetails={true}
                       debounce={300}
                       onPress={(data, details = null) => {
                         if (details) {
                           setDestination({
                             latitude: details.geometry.location.lat,
                             longitude: details.geometry.location.lng,
                           });
                           setDestinationLabel(data.description);
                           setShowDestinationSearch(false);
                         }
                       }}
                       query={{
                         key: GOOGLE_API_KEY,
                         language: 'pt',
                         components: 'country:pt',
                       }}
                       styles={{
                         container: { flex: 0 },
                         textInput: {
                           height: 38,
                           fontSize: 14,
                           paddingVertical: 0,
                         },
                         listView: {
                           position: 'absolute',
                           top: 40,
                           zIndex: 1000,
                           backgroundColor: 'white',
                           borderRadius: 8,
                           elevation: 5,
                         },
                       }}
                       enablePoweredByContainer={false}
                       keepResultsAfterBlur={true}
                       textInputProps={{
                         autoFocus: true,
                       }}
                     />
                   </View>
                 ) : (
                   <TouchableOpacity 
                     style={{ flex: 1, marginLeft: 12 }}
                     onPress={() => setShowDestinationSearch(true)}
                   >
                     <Text style={{ fontSize: 14, color: destinationLabel ? '#1A1A1A' : '#999' }}>
                       {destinationLabel || 'Destination'}
                     </Text>
                   </TouchableOpacity>
                 )}
               </View>
             </View>
           </View>
           
           <ScrollView style={{ flex: 1, padding: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Rotas Recentes</Text>
              {[1, 2].map(i => (
                <TouchableOpacity 
                  key={i} 
                  style={{flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6'}}
                >
                   <Image 
                     source={{ uri: `https://source.unsplash.com/random/100x100?road,${i}` }} 
                     style={{width: 56, height: 56, borderRadius: 28, marginRight: 16}} 
                   />
                   <View>
                     <Text style={{fontWeight:'bold'}}>Casa ••• Trabalho</Text>
                     <Text style={{color:'#999', fontSize: 12}}>13km • 17min</Text>
                   </View>
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
                 <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                   <MapPin color="#facc15" size={20} />
                   <Text style={{marginLeft: 10, fontWeight: 'bold'}}>{originLabel || 'Origin'}</Text>
                 </View>
                 <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <MapPin color="#ef4444" size={20} />
                   <Text style={{marginLeft: 10, fontWeight: 'bold'}}>{destinationLabel || 'Destination'}</Text>
                 </View>
              </View>
              <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Navigation Mode</Text>
              <View style={{ flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 4, borderRadius: 12, marginBottom: 32 }}>
                 {['Sport', 'Tourist', 'Safest'].map(mode => (
                    <TouchableOpacity 
                      key={mode} 
                      onPress={() => setRideMode(mode)} 
                      style={{ 
                        flex: 1, 
                        paddingVertical: 12, 
                        alignItems: 'center', 
                        borderRadius: 8, 
                        backgroundColor: rideMode === mode ? 'white' : 'transparent', 
                        elevation: rideMode === mode ? 2 : 0 
                      }}
                    >
                       <Text style={{ 
                         fontSize: 12, 
                         fontWeight: 'bold', 
                         color: rideMode === mode ? COLORS.primaryGreen : '#9ca3af' 
                       }}>
                         {mode}
                       </Text>
                    </TouchableOpacity>
                 ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                 <TouchableOpacity 
                   onPress={() => setRouteState('search')} 
                   style={{ 
                     flex: 1, 
                     padding: 16, 
                     borderRadius: 16, 
                     alignItems: 'center', 
                     borderWidth: 1, 
                     borderColor: '#ddd' 
                   }}
                 >
                   <Text onPress={resetInputs} style={{fontWeight:'bold', color: '#666'}}>Cancel</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   onPress={handleConfirmDestination}
                   style={{ 
                     flex: 1, 
                     padding: 16, 
                     borderRadius: 16, 
                     alignItems: 'center', 
                     backgroundColor: COLORS.primaryOrange 
                   }}
                 >
                   <Text style={{fontWeight:'bold', color: 'white'}}>Start</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </View>
      )}

      {/* NAVIGATING STATE */}
      {routeState === 'navigating' && (
        <>
          <TouchableOpacity 
            onPress={() => setRouteState('confirm')} 
            style={{ 
              position: 'absolute', 
              top: 60, 
              left: 16, 
              zIndex: 20, 
              backgroundColor: 'white', 
              padding: 12, 
              borderRadius: 50 
            }}
          >
             <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <View style={[
            styles.bottomSheet, 
            { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
          ]}>
             <View style={{ alignItems: 'center' }}>
                <View style={{ backgroundColor: '#ffedd5', padding: 12, borderRadius: 16, marginBottom: 4 }}>
                  <AlertTriangle size={28} color="#f97316" />
                </View>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>In 100m</Text>
             </View>
             <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>13:06</Text>
                <Text style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}>3 MIN • 0.6 KM</Text>
             </View>
             <TouchableOpacity style={{ backgroundColor: 'white', padding: 12, borderRadius: 50, elevation: 5 }}>
               <Search size={24} color="#333"/>
             </TouchableOpacity>
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
