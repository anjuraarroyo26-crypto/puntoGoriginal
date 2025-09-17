import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { CashContext } from "../context/CashContext";

export default function OpenCash({ navigation }) {
  const [amount, setAmount] = useState("");
  const { openCash } = useContext(CashContext);

  const handleOpen = () => {
    const value = parseFloat(amount) || 0;
    openCash(value);
    navigation.replace("Main"); // Navega al TabNavigator
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Abrir Caja</Text>
      <Text>Ingrese el monto inicial en caja:</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <Button title="Abrir Caja" onPress={handleOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    width: "80%",
    textAlign: "center",
  },
});
