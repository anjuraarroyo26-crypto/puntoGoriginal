// screens/Caja.js
import React, { useContext, useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert } from "react-native";
import { CashContext } from "../context/CashContext";

export default function Caja() {
  const { isOpen, initialCash, openCash, closeCash } = useContext(CashContext);
  const [amount, setAmount] = useState("");

  const handleOpen = () => {
    const value = parseFloat(amount) || 0;
    if (value < 0) {
      Alert.alert("Error", "El monto inicial no puede ser negativo.");
      return;
    }
    openCash(value);
    setAmount("");
    Alert.alert("Caja abierta", `Se abrió la caja con $${value}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💵 Caja</Text>

      {!isOpen ? (
        <View style={styles.card}>
          <Text style={styles.label}>Ingrese el monto inicial:</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Button title="Abrir Caja" onPress={handleOpen} />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Caja abierta con:</Text>
          <Text style={styles.value}>${initialCash}</Text>
          <Button title="Cerrar Caja" color="red" onPress={closeCash} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    width: "90%",
    alignItems: "center",
  },
  label: { fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    width: "100%",
    textAlign: "center",
  },
  value: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
});
