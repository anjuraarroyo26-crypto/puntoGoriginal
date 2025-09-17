// screens/CookApp/CookHistory.js
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useOrders } from "../../context/OrdersContext";

// 🔹 Función para formatear fecha yyyy-mm-dd -> dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

export default function CookHistory() {
  const { orders } = useOrders();
  const [selectedDate, setSelectedDate] = useState(null);

  // Filtrar solo órdenes cerradas
  const closedOrders = orders.filter((o) => o.status === "Cerrado");

  // Si selecciona una fecha, filtrar por esa fecha
  const filteredOrders = selectedDate
    ? closedOrders.filter((o) => o.date === selectedDate)
    : closedOrders;

  // 🔹 Obtener lista de fechas únicas
  const uniqueDates = [...new Set(closedOrders.map((o) => o.date))];

  const exportToExcel = async () => {
    if (filteredOrders.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // Crear CSV (Excel lo abre)
    let csv = "Producto,Cantidad,Monto,Fecha\n";
    let total = 0;
    filteredOrders.forEach((o) => {
      csv += `${o.product},${o.qty},${o.amount},${formatDate(o.date)}\n`;
      total += o.amount;
    });
    csv += `,,Total,${total}\n`;

    const fileUri = FileSystem.documentDirectory + "historial.csv";
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Exportar historial",
      UTI: "public.comma-separated-values-text",
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.product}>
        {item.product} x{item.qty}
      </Text>
      <Text>Monto: ${item.amount}</Text>
      <Text>Fecha: {formatDate(item.date)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Órdenes</Text>

      {/* 🔹 Botones de fechas */}
      <View style={styles.datesContainer}>
        {uniqueDates.map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dateButton,
              selectedDate === date && styles.dateButtonActive,
            ]}
            onPress={() =>
              setSelectedDate(selectedDate === date ? null : date)
            }
          >
            <Text
              style={[
                styles.dateButtonText,
                selectedDate === date && styles.dateButtonTextActive,
              ]}
            >
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón para exportar */}
      <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
        <Text style={styles.exportText}>📤 Exportar a Excel</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No hay órdenes cerradas</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  datesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 6,
    margin: 4,
  },
  dateButtonActive: {
    backgroundColor: "#4CAF50",
  },
  dateButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  dateButtonTextActive: {
    color: "#fff",
  },
  orderCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
  },
  product: { fontSize: 18, fontWeight: "600" },
  exportButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  exportText: { color: "white", fontWeight: "bold" },
});
