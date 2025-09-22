import React, { useContext } from "react";
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { CashContext } from "../context/CashContext";

export default function CashHistory() {
  const { cashHistory, removeCashRecord } = useContext(CashContext);

  const handleDelete = (id) => {
    Alert.alert(
      "Eliminar cierre",
      "¿Estás seguro de que quieres eliminar este cierre?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => removeCashRecord(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Historial de Cierres</Text>

      {cashHistory.length === 0 ? (
        <Text>No hay cierres registrados aún</Text>
      ) : (
        <FlatList
          data={cashHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onLongPress={() => handleDelete(item.id)}
            >
              <Text>📅 {item.date}</Text>
              <Text>💵 Inicial: ${item.initialCash}</Text>
              <Text>🛒 Ventas: ${item.salesTotal}</Text>
              <Text>💸 Gastos: ${item.expensesTotal}</Text>
              <Text>📦 Final: ${item.finalCash}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: "#fff", 
    paddingTop: 70 // 🔹 Evita que choque con la barra de notificaciones
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
});
