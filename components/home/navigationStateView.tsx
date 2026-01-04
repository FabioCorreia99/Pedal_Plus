import { AlertTriangle, ArrowLeft, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavigatingStateProps {
  onBack: () => void;
}

export default function NavigatingState({ onBack }: NavigatingStateProps) {
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
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#666' }}>In 100m</Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>13:06</Text>
          <Text style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: 12 }}>3 MIN • 0.6 KM</Text>
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
