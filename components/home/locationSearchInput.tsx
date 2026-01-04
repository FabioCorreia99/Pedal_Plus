import { MapPin } from 'lucide-react-native';
import React, { forwardRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface LocationSearchInputProps {
  iconColor: string;
  placeholder: string;
  label: string;
  isSearching: boolean;
  onSearchToggle: () => void;
  onLocationSelect: (coords: { latitude: number; longitude: number }, description: string) => void;
}

const LocationSearchInput = forwardRef<GooglePlacesAutocompleteRef, LocationSearchInputProps>(
  ({ iconColor, placeholder, label, isSearching, onSearchToggle, onLocationSelect }, ref) => {
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
              }}
              enablePoweredByContainer={false}
              textInputProps={{
                autoFocus: true,
              }}
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
  }
});

export default LocationSearchInput;