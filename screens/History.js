// screens/History.js
import React, { useContext, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SalesContext } from "../context/SalesContext";
import { ExpensesContext } from "../context/ExpensesContext";
import { CashContext } from "../context/CashContext";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function History() {
  const { salesHistory } = useContext(SalesContext);
  const { expenses } = useContext(ExpensesContext);
  const { cashHistory } = useContext(CashContext);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const today = selectedDate.toDateString();

  const filterByDate = (arr) =>
    arr.filter((item) => new Date(item.date).toDateString() === today);

  const dailySales = filterByDate(salesHistory);
  const dailyExpenses = filterByDate(expenses);
  const dailyCash = filterByDate(cashHistory);

  // ===== EXPORTAR EXCEL =====
  const exportExcel = async () => {
    try {
      const wsData = [["Historial del Día - " + today]];
      wsData.push([]);
      wsData.push(["Ventas"]);
      wsData.push(["Fecha", "Producto", "Cantidad", "Precio Unitario", "Total"]);

      dailySales.forEach((sale) => {
        sale.products.forEach((p) => {
          wsData.push([
            new Date(sale.date).toLocaleString(),
            p.name,
            p.qty,
            p.price,
            p.qty * p.price,
          ]);
        });
      });

      wsData.push([]);
      wsData.push(["Gastos"]);
      wsData.push(["Fecha", "Descripción", "Monto"]);

      dailyExpenses.forEach((exp) => {
        wsData.push([new Date(exp.date).toLocaleString(), exp.description, exp.amount]);
      });

      wsData.push([]);
      wsData.push(["Cierres de Caja"]);
      wsData.push(["Fecha", "Caja Inicial", "Ventas", "Gastos", "Saldo Final"]);

      dailyCash.forEach((cash) => {
        wsData.push([
          new Date(cash.date).toLocaleString(),
          cash.initialCash,
          cash.salesTotal,
          cash.expensesTotal,
          cash.finalCash,
        ]);
      });

      // Crear libro y hoja
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Historial");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const fileUri = FileSystem.documentDirectory + `Historial_${today}.xlsx`;

      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri, { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    } catch (error) {
      Alert.alert("Error", "No se pudo exportar Excel: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Historial</Text>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text>Seleccionar Fecha: {selectedDate.toDateString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* VENTAS */}
      <Text style={styles.sectionTitle}>Ventas</Text>
      {dailySales.length === 0 ? (
        <Text>No hay ventas en este día</Text>
      ) : (
        <FlatList
          data={dailySales}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>📅 {new Date(item.date).toLocaleString()}</Text>
              <Text>Total: ${item.total}</Text>
              <Text style={{ fontWeight: "bold", marginTop: 5 }}>Productos:</Text>
              {item.products.map((p, idx) => (
                <Text key={idx}>• {p.name} x{p.qty} (${p.price})</Text>
              ))}
            </View>
          )}
        />
      )}

      {/* GASTOS */}
      <Text style={styles.sectionTitle}>Gastos</Text>
      {dailyExpenses.length === 0 ? (
        <Text>No hay gastos en este día</Text>
      ) : (
        <FlatList
          data={dailyExpenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>📅 {new Date(item.date).toLocaleString()}</Text>
              <Text>Gasto: ${item.amount} - {item.description}</Text>
            </View>
          )}
        />
      )}

      {/* CIERRES DE CAJA */}
      <Text style={styles.sectionTitle}>Cierres de Caja</Text>
      {dailyCash.length === 0 ? (
        <Text>No hay cierres de caja en este día</Text>
      ) : (
        <FlatList
          data={dailyCash}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: "#fff3cd" }]}>
              <Text>📅 {item.date}</Text>
              <Text>💵 Caja Inicial: ${item.initialCash}</Text>
              <Text>🛒 Ventas: ${item.salesTotal}</Text>
              <Text>💸 Gastos: ${item.expensesTotal}</Text>
              <Text>📦 Saldo Final: ${item.finalCash}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.exportButton} onPress={exportExcel}>
        <Text style={{ color: "white" }}>Exportar a Excel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff", paddingTop: 70 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  card: {
    padding: 12,
    backgroundColor: "#f1f1f1",
    marginVertical: 6,
    borderRadius: 8,
  },
  dateButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  exportButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
});
