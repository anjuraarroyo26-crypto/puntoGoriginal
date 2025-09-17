// components/CustomButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CustomButton({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "tomato",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
  },
  text: { color: "white", fontWeight: "bold" },
});
