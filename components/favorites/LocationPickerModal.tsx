import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

type LatLng = { latitude: number; longitude: number };

type Category = "home" | "work" | "favorite";

type Props = {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onSelect: (coords: LatLng, description: string) => void;
};

export default function LocationPickerModal({
  visible,
  category,
  onClose,
  onSelect,
}: Props) {
  if (!category) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>
          {category === "home" && "Definir Casa"}
          {category === "work" && "Definir Trabalho"}
          {category === "favorite" && "Adicionar Favorito"}
        </Text>

        <GooglePlacesAutocomplete
          placeholder="Pesquisar morada ou local"
          fetchDetails
          enablePoweredByContainer={false}
          debounce={300}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
            language: "pt",
            components: "country:pt",
            types: "geocode",
            location: "41.1579,-8.6291",
            radius: 30000, // 30 km → cobre o país inteiro
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          onPress={(data, details) => {
            if (!details) return;

            onSelect(
              {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              },
              data.description,
            );
          }}
          styles={{
            textInput: styles.input,
            listView: {
              backgroundColor: "white",
              borderRadius: 12,
            },
          }}
        />

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    backgroundColor: "#f5f7f8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelBtn: {
    marginTop: 24,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
