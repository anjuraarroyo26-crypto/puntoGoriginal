// screens/InventoryScreen.js
import React, { useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, StyleSheet, Alert, Modal } from "react-native";
import { InventoryContext } from "../context/InventoryContext";

const InventoryScreen = () => {
  const { inventory, restockMaterial, consumeMaterial, addRawMaterial } = useContext(InventoryContext);

  // Modal para agregar nueva materia prima
  const [modalVisible, setModalVisible] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: "", qty: "" });

  // Agregar nueva materia prima
  const handleAddMaterial = () => {
    const name = newMaterial.name.trim();
    const qty = parseInt(newMaterial.qty, 10);

    if (!name || isNaN(qty) || qty <= 0) {
      Alert.alert("Error", "Completa todos los campos correctamente (cantidad > 0)");
      return;
    }

    addRawMaterial(name, qty);
    setModalVisible(false);
    setNewMaterial({ name: "", qty: "" });
    Alert.alert("✅ Materia prima agregada");
  };

  // Actualizar stock existente
  const handleUpdateStock = (id, amount) => {
    try {
      if (amount > 0) restockMaterial(id, amount);
      else consumeMaterial(id, Math.abs(amount));
    } catch (error) {
      console.error("Error actualizando stock:", error);
      Alert.alert("Error", "Ocurrió un problema al actualizar el stock");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventario</Text>

      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.name}: {item.qty}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#f44336" }]}
                onPress={() => handleUpdateStock(item.id, -1)}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#4CAF50" }]}
                onPress={() => handleUpdateStock(item.id, 1)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Botón para abrir modal */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>➕ Agregar materia prima</Text>
      </TouchableOpacity>

      {/* Modal para agregar nueva materia prima */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nueva Materia Prima</Text>
            <TextInput
              placeholder="Nombre"
              value={newMaterial.name}
              onChangeText={(text) => setNewMaterial(prev => ({ ...prev, name: text }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Cantidad"
              value={newMaterial.qty}
              onChangeText={(text) => setNewMaterial(prev => ({ ...prev, qty: text }))}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button title="Agregar" onPress={handleAddMaterial} />
            <Button title="Cancelar" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFD700" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: "#FFF8DC",
  },
  itemText: { fontWeight: "bold", fontSize: 16 },
  buttonRow: { flexDirection: "row" },
  button: { padding: 8, borderRadius: 5, marginHorizontal: 4 },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  addButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  addButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  modalBackground: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#00000099" },
  modalContainer: { backgroundColor: "white", borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
});

export default InventoryScreen;
