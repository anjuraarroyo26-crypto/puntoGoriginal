import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { InventoryContext } from "../context/InventoryContext";

const AddMaterialScreen = ({ navigation }) => {
  const { addRawMaterial } = useContext(InventoryContext);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  const handleAdd = () => {
    const quantity = parseInt(qty, 10);
    if (!name.trim() || isNaN(quantity) || quantity <= 0) {
      Alert.alert("Error", "Completa todos los campos correctamente (cantidad > 0)");
      return;
    }
    addRawMaterial(name.trim(), quantity);
    Alert.alert("✅ Materia prima agregada");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Materia Prima</Text>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Cantidad" value={qty} onChangeText={setQty} keyboardType="numeric" style={styles.input} />
      <Button title="Agregar" onPress={handleAdd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 15 }
});

export default AddMaterialScreen;
