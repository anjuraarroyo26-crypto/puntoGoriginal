import React, { useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { CashContext } from "../context/CashContext";

export default function CashHistory() {
  const { cashHistory } = useContext(CashContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Historial de Cierres</Text>

      {cashHistory.length === 0 ? (
        <Text>No hay cierres registrados aún</Text>
      ) : (
        <FlatList
          data={cashHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>📅 {item.date}</Text>
              <Text>💵 Inicial: ${item.initialCash}</Text>
              <Text>🛒 Ventas: ${item.salesTotal}</Text>
              <Text>💸 Gastos: ${item.expensesTotal}</Text>
              <Text>📦 Final: ${item.finalCash}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
});
