import { AlertTriangle, ArrowLeft, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavigatingStateProps {
  onBack: () => void;
  distanceMeters?: number;
  duration?: string;
}

export default function NavigatingState({ onBack, distanceMeters, duration }: NavigatingStateProps) {
  const durationInMinutes = duration ? Math.ceil(parseInt(duration) / 60) : null;
  const durationStr = durationInMinutes ? durationInMinutes.toString() : 'N/A';
  const distanceInKm = distanceMeters ? (distanceMeters / 1000).toFixed(1) : null;
  const arrivalTime = durationInMinutes
    ? new Date(Date.now() + durationInMinutes * 60000)
    : null;
  const arrivalHours = arrivalTime ? arrivalTime.getHours() : null;
  const arrivalMinutes = arrivalTime ? arrivalTime.getMinutes().toString().padStart(2, '0') : null;
  const arrivalTimeStr = arrivalTime ? `${arrivalHours}:${arrivalMinutes}` : 'N/A';
  
  return (
    <>
      <TouchableOpacity
        onPress={onBack}
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
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>N/A</Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{arrivalTimeStr}</Text>
          <Text style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}>{durationStr} MIN • {distanceInKm} KM</Text>
        </View>

        <TouchableOpacity style={{ backgroundColor: 'white', padding: 12, borderRadius: 50, elevation: 5 }}>
          <Search size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, elevation: 20,
  },
});
