// screens/Expenses.js
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { ExpensesContext } from "../context/ExpensesContext";

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useContext(ExpensesContext);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!amount || !description) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    addExpense(amount, description);
    setAmount("");
    setDescription("");
  };

  const confirmDelete = (id) => {
    Alert.alert("Confirmar", "¿Eliminar este gasto?", [
      { text: "Cancelar" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteExpense(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💸 Gastos</Text>

      {/* Formulario */}
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Monto"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Agregar Gasto" onPress={handleAdd} />

      {/* Lista de gastos */}
      <FlatList
        data={expenses || []}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.expenseItem}
            onLongPress={() => confirmDelete(item.id)}
          >
            <Text style={styles.expenseText}>
              {item.description} - ${item.amount}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay gastos registrados.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  expenseItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  expenseText: { fontSize: 16 },
  dateText: { fontSize: 12, color: "gray" },
  emptyText: { textAlign: "center", marginTop: 20, color: "gray" },
});
