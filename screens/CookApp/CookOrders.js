import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useOrders } from "../../context/OrdersContext";

export default function CookOrders() {
  const { orders } = useOrders();

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.product}>{item.product} x{item.qty}</Text>
      <Text style={styles.status}>Estado: {item.status}</Text>
      {item.options?.sauces?.length > 0 && (
        <Text style={styles.detail}>Salsas: {item.options.sauces.join(", ")}</Text>
      )}
      {item.options?.extras?.length > 0 && (
        <Text style={styles.detail}>Extras: {item.options.extras.join(", ")}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todas las Órdenes</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No hay órdenes registradas</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  orderCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  product: { fontSize: 18, fontWeight: "600" },
  status: { fontSize: 14, marginTop: 5 },
  detail: { fontSize: 12, color: "gray", marginTop: 3 },
});
