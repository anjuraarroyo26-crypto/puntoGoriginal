// screens/CookApp/CookDashboard.js
import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Image,
} from "react-native";
import { useOrders } from "../../context/OrdersContext";
import { AuthContext } from "../../context/AuthContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HighlightOrder = ({ item, onPress, highlight, disabled }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(highlight ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    if (highlight) {
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 0, useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ]).start();
    }
  }, [highlight]);

  const statusColors = {
    Recibido: "#f44336", // rojo
    Preparando: "#ff9800", // naranja
    Cerrado: "#4caf50", // verde
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fff", "#fff59d"],
  });

  return (
    <Animated.View style={[styles.orderCard, { opacity: fadeAnim, backgroundColor }]}>
      <Text style={styles.product}>
        {item.product} x{item.qty}
      </Text>
      <Text>
        <Text style={{ fontWeight: "bold" }}>Estado: </Text>
        <Text style={{ color: statusColors[item.status] }}>{item.status}</Text>
      </Text>

      {item.options?.sauces?.length > 0 && (
        <Text>
          <Text style={{ fontWeight: "bold" }}>Salsas: </Text>
          {item.options.sauces.join(", ")}
        </Text>
      )}

      {item.options?.extras?.length > 0 && (
        <Text>
          <Text style={{ fontWeight: "bold" }}>Extras: </Text>
          {item.options.extras.join(", ")}
        </Text>
      )}

      {!disabled && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: statusColors[item.status] }]}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>
            {item.status === "Recibido"
              ? "Preparar"
              : item.status === "Preparando"
              ? "Cerrar"
              : "Cerrada"}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default function CookDashboard({ navigation }) {
  const { orders, updateOrderStatus } = useOrders();
  const { logout } = useContext(AuthContext); 
  const [highlightIds, setHighlightIds] = useState([]);

  const statusFlow = ["Recibido", "Preparando", "Cerrado"];

  // 🔹 Ahora muestra TODAS las órdenes activas (no filtramos por userEmail)
  const displayedOrders = orders.filter(
    (o) => o?.id && o.product && o.qty && o.status !== "Cerrado"
  );

  useEffect(() => {
    const currentIds = displayedOrders.map((o) => o.id);
    const newIds = currentIds.filter((id) => !highlightIds.includes(id));

    if (newIds.length > 0) {
      setHighlightIds((prev) => [...prev, ...newIds]);
      const timer = setTimeout(
        () => setHighlightIds((prev) => prev.filter((id) => !newIds.includes(id))),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [orders]);

  const handleNextStatus = (order) => {
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const renderItem = ({ item }) => {
    const highlight = highlightIds.includes(item.id);
    const disabled = item.status === "Cerrado";

    return (
      <HighlightOrder
        item={item}
        onPress={() => handleNextStatus(item)}
        highlight={highlight}
        disabled={disabled}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con logo y logout */}
      <View style={styles.header}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            navigation.replace("Auth");
          }}
        >
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Órdenes Activas</Text>

      {displayedOrders.length === 0 ? (
        <Text style={{ color: "#fff" }}>No hay órdenes activas</Text>
      ) : (
        <FlatList
          data={displayedOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E53935", paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { width: 150, height: 60 },
  logoutButton: { backgroundColor: "#333", padding: 10, borderRadius: 8 },
  logoutText: { color: "#fff", fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 15 },
  orderCard: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  product: { fontSize: 18, fontWeight: "600" },
  button: { padding: 10, borderRadius: 8, marginTop: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
