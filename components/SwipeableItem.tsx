import React from "react";
import { StyleSheet, Text } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
};

export default function SwipeableItem({ children, onDelete }: Props) {
  const renderRightActions = () => {
    return (
      <RectButton style={styles.deleteBtn} onPress={onDelete}>
        <Text style={styles.deleteText}>Apagar</Text>
      </RectButton>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>{children}</Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteBtn: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 96,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});
