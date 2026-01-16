import { MapPin } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  primaryGreen: "#5DBD76",
  primaryOrange: "#FF9E46",
};

interface ConfirmStateProps {
  originLabel: string;
  destinationLabel: string;
  rideMode: string;
  distanceMeters?: number;
  duration?: string;
  onRideModeChange: (mode: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmState({
  originLabel,
  destinationLabel,
  rideMode,
  distanceMeters,
  duration,
  onRideModeChange,
  onCancel,
  onConfirm,
}: ConfirmStateProps) {

  const durationInMinutes = duration ? Math.ceil(parseInt(duration) / 60) : null;
  const durationStr = durationInMinutes ? durationInMinutes.toString() : 'N/A';
  const distanceInKm = distanceMeters ? (distanceMeters / 1000).toFixed(1) : null;
  const arrivalTime = durationInMinutes
    ? new Date(Date.now() + durationInMinutes * 60000)
    : null;
  const arrivalHours = arrivalTime ? arrivalTime.getHours() : null;
  const arrivalMinutes = arrivalTime ? arrivalTime.getMinutes().toString().padStart(2, '0') : null;
  const arrivalTimeStr = arrivalTime ? `${arrivalHours}:${arrivalMinutes}` : 'N/A';
  const PILL_WIDTH = 96;

  return (
    <View style={styles.bottomSheet}>

      <View
        style={{
          position: 'absolute',
          top: -256,
          left: 24,
          alignItems: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <View
          style={{
            width: PILL_WIDTH,
            backgroundColor: 'white',
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 999,
            elevation: 5,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{durationStr} min</Text>
          <Text style={{ color: '#6b7280' }}>Duração</Text>
        </View>

        <View
          style={{
            width: PILL_WIDTH,
            backgroundColor: 'white',
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 999,
            elevation: 5,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{arrivalTimeStr}</Text>
          <Text style={{ color: '#6b7280' }}>Chegada</Text>
        </View>

        <View
          style={{
            width: PILL_WIDTH,
            backgroundColor: 'white',
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 999,
            elevation: 5,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>
            {distanceInKm ?? 'N/A'} km
          </Text>
          <Text style={{ color: '#6b7280' }}>Distância</Text>
        </View>
      </View>

      <View style={{ padding: 24 }}>
        <View style={[styles.card, { marginBottom: 24 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <MapPin color="#facc15" size={20} />
            <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>{originLabel || 'Origem'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin color="#ef4444" size={20} />
            <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>{destinationLabel || 'Destino'}</Text>
          </View>
        </View>

        <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Modo de Navegação</Text>
        <View style={{ flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 4, borderRadius: 12, marginBottom: 32 }}>
          {['Sport', 'Tourist', 'Safest'].map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => onRideModeChange(mode)}
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
            onPress={onCancel}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ddd'
            }}
          >
            <Text style={{ fontWeight: 'bold', color: '#666' }}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 16,
              alignItems: 'center',
              backgroundColor: COLORS.primaryOrange
            }}
          >
            <Text style={{ fontWeight: 'bold', color: 'white' }}>Começar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
});
