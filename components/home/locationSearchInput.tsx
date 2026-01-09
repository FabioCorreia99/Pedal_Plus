import * as Location from 'expo-location';
import { Locate, MapPin } from 'lucide-react-native';
import React, { forwardRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface LocationSearchInputProps {
  iconColor: string;
  placeholder: string;
  label: string;
  isSearching: boolean;
  onSearchToggle: () => void;
  onLocationSelect: (coords: { latitude: number; longitude: number }, description: string) => void;
  showCurrentLocationButton?: boolean;
}

const LocationSearchInput = forwardRef<GooglePlacesAutocompleteRef, LocationSearchInputProps>(
  ({ iconColor, placeholder, label, isSearching, onSearchToggle, onLocationSelect, showCurrentLocationButton }, ref) => {
    const getCurrentLocation = async () => {
      try {
        // Request permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão Negada', 'É necessário acesso à localização para usar esta funcionalidade.');
          return;
        }

        // Get current position
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Reverse geocode to get address
        let addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addresses.length > 0) {
          const address = addresses[0];
          const description = `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
          
          onLocationSelect(
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
            description
          );
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível obter sua localização atual.');
        console.error(error);
      }
    };

    return (
      <View style={styles.searchRow}>
        <MapPin color={iconColor} size={20} />
        {isSearching ? (
          <View style={{ flex: 1, marginLeft: 12 }}>
            <GooglePlacesAutocomplete
              ref={ref}
              placeholder={placeholder}
              fetchDetails={true}
              debounce={300}
              onPress={(data, details = null) => {
                if (details) {
                  onLocationSelect(
                    {
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    },
                    data.description
                  );
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
                  zIndex: 9999,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                },
                row: {
                  paddingVertical: 10,
                },
              }}
              enablePoweredByContainer={false}
              textInputProps={{
                autoFocus: true,
              }}
              renderRightButton={showCurrentLocationButton ? () => (
                <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
                  <Locate color="#FF9331" size={18} />
                </TouchableOpacity>
              ) : undefined}
            />
          </View>
        ) : (
          <TouchableOpacity style={{ flex: 1, marginLeft: 12 }} onPress={onSearchToggle}>
            <Text style={{ fontSize: 14, color: label ? '#1A1A1A' : '#999' }}>
              {label || placeholder}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  searchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  locationButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default LocationSearchInput;