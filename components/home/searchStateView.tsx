import LocationSearchInput from '@/components/home/locationSearchInput';
import React, { RefObject } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

const COLORS = {
  primaryOrange: "#FF9E46",
};

type LatLng = { latitude: number; longitude: number };

// TODO: Add recent searches functionality

interface SearchStateProps {
  originRef: RefObject<GooglePlacesAutocompleteRef | null>;
  destinationRef: RefObject<GooglePlacesAutocompleteRef | null>;
  originLabel: string;
  destinationLabel: string;
  showOriginSearch: boolean;
  showDestinationSearch: boolean;
  onOriginSearchToggle: () => void;
  onDestinationSearchToggle: () => void;
  onOriginSelect: (coords: LatLng, description: string) => void;
  onDestinationSelect: (coords: LatLng, description: string) => void;
}

export default function SearchState({
  originRef,
  destinationRef,
  originLabel,
  destinationLabel,
  showOriginSearch,
  showDestinationSearch,
  onOriginSearchToggle,
  onDestinationSearchToggle,
  onOriginSelect,
  onDestinationSelect,
}: SearchStateProps) {
  return (
    <View style={[styles.bottomSheet, { height: '55%' }]}>
      <View style={{ paddingHorizontal: 24, marginTop: -30 }}>
        <View style={[styles.card, (showOriginSearch || showDestinationSearch) ? { zIndex: 10000 } : {}]}>
          <LocationSearchInput
            ref={originRef}
            iconColor={COLORS.primaryOrange}
            placeholder="Origem"
            label={originLabel}
            isSearching={showOriginSearch}
            onSearchToggle={onOriginSearchToggle}
            onLocationSelect={(coords, description) => {
              onOriginSelect(coords, description);
            }}
            showCurrentLocationButton={true}
          />

          <LocationSearchInput
            ref={destinationRef}
            iconColor="#ef4444"
            placeholder="Destino"
            label={destinationLabel}
            isSearching={showDestinationSearch}
            onSearchToggle={onDestinationSearchToggle}
            onLocationSelect={(coords, description) => {
              onDestinationSelect(coords, description);
            }}
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Rotas Recentes</Text>
        {[1, 2].map(i => (
          <TouchableOpacity
            key={i}
            style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' }}
          >
            <Image
              source={{ uri: `https://source.unsplash.com/random/100x100?road,${i}` }}
              style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16 }}
            />
            <View>
              <Text style={{ fontWeight: 'bold' }}>Casa ••• Trabalho</Text>
              <Text style={{ color: '#999', fontSize: 12 }}>13km • 17min</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
