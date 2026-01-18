import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

type LatLng = { latitude: number; longitude: number };

type Props = {
  visible: boolean;
  category: "home" | "work" | null;
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
          Definir {category === "home" ? "Casa" : "Trabalho"}
        </Text>

        <GooglePlacesAutocomplete
          placeholder="Pesquisar morada"
          fetchDetails
          enablePoweredByContainer={false}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
            language: "pt",
          }}
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
