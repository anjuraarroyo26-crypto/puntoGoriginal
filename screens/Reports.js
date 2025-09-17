// screens/Reports.js
import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SalesContext } from "../context/SalesContext";
import { ExpensesContext } from "../context/ExpensesContext";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Reports() {
  const { allSalesHistory } = useContext(SalesContext);
  const { allExpenses } = useContext(ExpensesContext);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const today = selectedDate.toDateString();
  const weekAgo = new Date(selectedDate);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // ===== FILTROS =====
  const filterByDate = (arr) =>
    arr.filter((item) => new Date(item.date).toDateString() === today);

  const filterByWeek = (arr) =>
    arr.filter((item) => new Date(item.date) >= weekAgo && new Date(item.date) <= selectedDate);

  const dailySales = filterByDate(allSalesHistory);
  const dailyExpenses = filterByDate(allExpenses);

  const weeklySales = filterByWeek(allSalesHistory);
  const weeklyExpenses = filterByWeek(allExpenses);

  const sumTotal = (arr, key) => arr.reduce((sum, item) => sum + item[key], 0);
  const dailySalesTotal = sumTotal(dailySales, "total");
  const dailyExpensesTotal = sumTotal(dailyExpenses, "amount");
  const weeklySalesTotal = sumTotal(weeklySales, "total");
  const weeklyExpensesTotal = sumTotal(weeklyExpenses, "amount");

  const netDaily = dailySalesTotal - dailyExpensesTotal;
  const netWeekly = weeklySalesTotal - weeklyExpensesTotal;

  // ===== EXPORTAR EXCEL DETALLADO =====
  const exportExcel = async (type = "daily") => {
    try {
      let salesData, expensesData, fileName;

      if (type === "daily") {
        salesData = dailySales;
        expensesData = dailyExpenses;
        fileName = `Reporte_Dia_${today}.xlsx`;
      } else {
        salesData = weeklySales;
        expensesData = weeklyExpenses;
        fileName = `Reporte_Semana_${today}.xlsx`;
      }

      // Cabecera
      const wsData = [["Reporte " + (type === "daily" ? "Diario" : "Semanal") + " - " + today]];
      wsData.push([]);
      wsData.push(["Ventas Detalladas"]);
      wsData.push(["Fecha", "Producto", "Cantidad", "Precio Unitario", "Total"]);

      // Agregar ventas
      salesData.forEach((sale) => {
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
      wsData.push(["Gastos Detallados"]);
      wsData.push(["Fecha", "Descripción", "Monto"]);

      // Agregar gastos
      expensesData.forEach((exp) => {
        wsData.push([new Date(exp.date).toLocaleString(), exp.description, exp.amount]);
      });

      wsData.push([]);
      wsData.push(["Resumen"]);
      wsData.push(["Ventas Totales", "Gastos Totales", "Ganancia Neta"]);
      wsData.push([
        sumTotal(salesData, "total"),
        sumTotal(expensesData, "amount"),
        sumTotal(salesData, "total") - sumTotal(expensesData, "amount"),
      ]);

      // Crear libro y hoja
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri, { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    } catch (error) {
      Alert.alert("Error", "No se pudo exportar Excel: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Reportes</Text>

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

      {/* ===== DIARIO ===== */}
      <View style={styles.card}>
        <Text style={styles.label}>Ventas del Día:</Text>
        <Text style={styles.value}>${dailySalesTotal}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Gastos del Día:</Text>
        <Text style={styles.valueRed}>-${dailyExpensesTotal}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Ganancia Neta Día:</Text>
        <Text style={styles.valueNet}>${netDaily}</Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={() => exportExcel("daily")}>
        <Text style={{ color: "white" }}>Exportar Día a Excel</Text>
      </TouchableOpacity>

      {/* ===== SEMANA ===== */}
      <View style={styles.card}>
        <Text style={styles.label}>Ventas Semana:</Text>
        <Text style={styles.value}>${weeklySalesTotal}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Gastos Semana:</Text>
        <Text style={styles.valueRed}>-${weeklyExpensesTotal}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Ganancia Neta Semana:</Text>
        <Text style={styles.valueNet}>${netWeekly}</Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={() => exportExcel("weekly")}>
        <Text style={{ color: "white" }}>Exportar Semana a Excel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: { fontSize: 16 },
  value: { fontSize: 18, fontWeight: "bold", color: "green" },
  valueRed: { fontSize: 18, fontWeight: "bold", color: "red" },
  valueNet: { fontSize: 18, fontWeight: "bold", color: "#ff9900" },
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
    marginBottom: 10,
  },
});
