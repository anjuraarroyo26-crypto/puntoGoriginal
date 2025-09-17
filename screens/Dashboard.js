// screens/Dashboard.js
import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SalesContext } from "../context/SalesContext";
import { ExpensesContext } from "../context/ExpensesContext";
import { InventoryContext } from "../context/InventoryContext";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard({ navigation }) {
  const { user, logout } = useContext(AuthContext); // Usuario actual + logout
  const { salesHistory } = useContext(SalesContext);
  const { expenses } = useContext(ExpensesContext);
  const { inventory } = useContext(InventoryContext);

  const today = new Date().toLocaleDateString();

  // 🔹 Total ventas de hoy filtradas por usuario
  const todaySalesTotal = salesHistory
    .filter(
      (s) =>
        new Date(s.date).toLocaleDateString() === today &&
        (!user || s.userEmail === user.email)
    )
    .reduce((sum, s) => sum + s.total, 0);

  // 🔹 Total gastos de hoy filtrados por usuario
  const todayExpensesTotal = expenses
    .filter(
      (e) =>
        new Date(e.date).toLocaleDateString() === today &&
        (!user || e.userEmail === user.email)
    )
    .reduce((sum, e) => sum + e.amount, 0);

  // 🔹 Total materias primas filtradas por usuario
  const totalInventory = inventory
    .filter((item) => !user || item.userEmail === user.email)
    .reduce((sum, item) => sum + item.qty, 0);

  return (
    <View style={styles.container}>
      {/* Botón Cerrar Sesión */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await logout(); // 👈 Limpia la sesión
          navigation.replace("Auth"); // 👈 Te devuelve a elegir rol
        }}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Header con logo */}
      <View style={styles.header}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Dashboard */}
      <View style={styles.dashboardBox}>
        <Text style={styles.dashboardTitle}>Dashboard</Text>

        {/* Tarjetas de Ventas, Gastos e Inventario */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ventas</Text>
            <Text style={styles.cardValue}>${todaySalesTotal}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gastos</Text>
            <Text style={styles.cardValue}>${todayExpensesTotal}</Text>
          </View>

          {/* Tarjeta de Inventario tocable */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.getParent().navigate("Inventory")}
          >
            <Text style={styles.cardTitle}>Inventario</Text>
            <Text style={styles.cardValue}>{totalInventory}</Text>
          </TouchableOpacity>
        </View>

        {/* Botones grandes */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: "green" }]}
            onPress={() => navigation.navigate("Ventas")}
          >
            <Text style={styles.buttonText}>+ Agregar Venta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: "red" }]}
            onPress={() => navigation.navigate("Gastos")}
          >
            <Text style={styles.buttonText}>- Agregar Gasto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: "#FFD700" }]}
            onPress={() => navigation.navigate("Productos")}
          >
            <Text style={styles.buttonText}>🍔 Productos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: "#FFD700" }]}
            onPress={() => navigation.navigate("Historial")}
          >
            <Text style={styles.buttonText}>📄 Historia</Text>
          </TouchableOpacity>
        </View>

        {/* Botón Agregar Materia Prima pequeño */}
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.getParent().navigate("AddMaterial")}
        >
          <Text style={styles.buttonText}>➕ Agregar Materia Prima</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD700" },
  logoutButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
  header: { alignItems: "center", marginTop: 30, marginBottom: 10 },
  logo: { width: 180, height: 80 },
  dashboardBox: {
    flex: 1,
    backgroundColor: "#e53935ff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: "center",
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardValue: { fontSize: 20, marginTop: 5 },
  bigButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  smallButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "60%",
    marginTop: 10,
    backgroundColor: "#2196F3",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
