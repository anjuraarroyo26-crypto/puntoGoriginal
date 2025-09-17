import React, { useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { InventoryContext } from "../context/InventoryContext";

const Inventory = () => {
  const { inventory, restockMaterial, consumeMaterial } = useContext(InventoryContext);

  const handleUpdateStock = (id, amount) => {
    if (amount > 0) {
      restockMaterial(id, amount);
    } else {
      consumeMaterial(id, Math.abs(amount));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventario</Text>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.name}: {item.qty}</Text>
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                onPress={() => handleUpdateStock(item.id, -1)}
                style={styles.minusButton}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleUpdateStock(item.id, 1)}
                style={styles.plusButton}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemText: { fontWeight: "bold" },
  buttonsRow: { flexDirection: "row" },
  minusButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  plusButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  buttonText: { color: "white" },
});

export default Inventory;
