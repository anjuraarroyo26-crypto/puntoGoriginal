// screens/Sales.js
import React, { useContext, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { ProductsContext } from "../context/ProductsContext";
import { SalesContext } from "../context/SalesContext";
import { InventoryContext } from "../context/InventoryContext";
import { useOrders } from "../context/OrdersContext";

const sauces = ["Rosada", "tartara", "Salsa de la casa", "Salsa roja", "Piña"];

const extrasConfig = {
  "Sin cebolla": 0,
  "Con cebolla": 0,
  "Extra queso": 3000,
  "Doble carne": 3500,
  "Gaseosa": 2000,
  "Porción de papas": 0,
};

// 🔹 Función universal para mostrar alert
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function Sales() {
  const { products } = useContext(ProductsContext);
  const { cart, addToCart: addToCartOriginal, confirmSale, clearCart } =
    useContext(SalesContext); // ahora trae clearCart
  const { consumeMaterials, checkMaterials, returnMaterials } =
    useContext(InventoryContext);
  const { addOrder } = useOrders();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSauces([]);
    setSelectedExtras([]);
    setModalVisible(true);
  };

  const toggleExtra = (extra) => {
    if (extra === "Con cebolla") {
      setSelectedExtras((prev) =>
        prev.includes("Con cebolla")
          ? prev.filter((e) => e !== "Con cebolla")
          : [...prev.filter((e) => e !== "Sin cebolla"), "Con cebolla"]
      );
    } else if (extra === "Sin cebolla") {
      setSelectedExtras((prev) =>
        prev.includes("Sin cebolla")
          ? prev.filter((e) => e !== "Sin cebolla")
          : [...prev.filter((e) => e !== "Con cebolla"), "Sin cebolla"]
      );
    } else {
      setSelectedExtras((prev) =>
        prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
      );
    }
  };

  const toggleSauce = (sauce) => {
    setSelectedSauces((prev) =>
      prev.includes(sauce) ? prev.filter((s) => s !== sauce) : [...prev, sauce]
    );
  };

  const totalPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    const base = Number(selectedProduct.price) || 0;
    const extrasTotal = selectedExtras.reduce(
      (sum, e) => sum + (extrasConfig[e] || 0),
      0
    );
    return base + extrasTotal;
  }, [selectedProduct, selectedExtras]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    if (
      selectedProduct.recipe?.length > 0 &&
      !checkMaterials(selectedProduct.recipe, 1)
    ) {
      showAlert(
        "Inventario insuficiente",
        `No hay suficiente materia prima para ${String(selectedProduct.name)}.`
      );
      return;
    }

    if (selectedProduct.recipe?.length > 0) {
      consumeMaterials(selectedProduct.recipe, 1);
    }

    addToCartOriginal({
      productId: selectedProduct.id,
      name: String(selectedProduct.name),
      price: totalPrice,
      qty: 1,
      recipe: selectedProduct.recipe ?? [],
      options: { sauces: selectedSauces, extras: selectedExtras },
    });

    setModalVisible(false);
    setSelectedProduct(null);
  };

  const handleConfirmSale = () => {
    if (cart.length === 0) {
      showAlert("Carrito vacío", "No tienes productos en el carrito.");
      return;
    }

    cart.forEach((item) => {
      const orderToSend = {
        product: String(item.name ?? ""),
        qty: Number(item.qty) || 0,
        options: item.options,
        amount: (Number(item.price) || 0) * (Number(item.qty) || 0),
        date: new Date().toISOString().split("T")[0],
        status: "Recibido",
      };
      addOrder(orderToSend);
    });

    confirmSale();
    showAlert(
      "Venta realizada",
      "La venta se ha registrado y enviada al cocinero."
    );
  };

  const handleCancelSale = () => {
    if (cart.length === 0) {
      showAlert("Sin productos", "No hay nada para cancelar.");
      return;
    }

    let restoredCount = 0;

    cart.forEach((item) => {
      if (Array.isArray(item.recipe) && item.recipe.length > 0) {
        // aseguramos que cada receta tenga materialId y qty
        item.recipe.forEach((r) => {
          if (r.materialId && r.qty) {
            // devolver insumos multiplicando por qty del item
            returnMaterials([{ materialId: r.materialId, qty: r.qty }], item.qty || 1);
            restoredCount++;
          }
        });
      }
    });

    // limpio carrito usando la función exportada por el contexto
    clearCart();

    showAlert(
      "Venta cancelada",
      restoredCount > 0
        ? "El carrito ha sido vaciado y los insumos restaurados al inventario."
        : "El carrito ha sido vaciado (no había insumos para devolver)."
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleSelectProduct(item)}
    >
      <Text style={styles.productText}>{String(item.name)}</Text>
      <Text style={styles.priceText}>${String(item.price)}</Text>
    </TouchableOpacity>
  );

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
      0
    );
  }, [cart]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ventas</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={renderProduct}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {String(selectedProduct?.name ?? "")}
              </Text>

              <Text style={styles.sectionTitle}>Salsas</Text>
              <View style={styles.optionsRow}>
                {sauces.map((sauce) => (
                  <TouchableOpacity
                    key={sauce}
                    style={[
                      styles.optionButton,
                      selectedSauces.includes(sauce) && {
                        backgroundColor: "#2196F3",
                      },
                    ]}
                    onPress={() => toggleSauce(sauce)}
                  >
                    <Text>{String(sauce)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Extras</Text>
              <View style={styles.optionsRow}>
                {Object.keys(extrasConfig).map((extra) => (
                  <TouchableOpacity
                    key={extra}
                    style={[
                      styles.optionButton,
                      selectedExtras.includes(extra) && {
                        backgroundColor: "#2196F3",
                      },
                    ]}
                    onPress={() => toggleExtra(extra)}
                  >
                    <Text>
                      {String(extra)}
                      {extrasConfig[extra] > 0
                        ? ` (+$${extrasConfig[extra]})`
                        : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.totalText}>Total: ${totalPrice}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.confirmText}>Agregar al carrito</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: "#ccc", marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.confirmText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Carrito */}
      {cart.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Carrito</Text>
          {cart.map((item, idx) => (
            <Text key={idx}>
              {`${String(item.name ?? "")} x${String(item.qty ?? 0)}`} - $
              {item.price}
              {item.options?.sauces?.length
                ? ` - Salsas: ${item.options.sauces.join(", ")}`
                : ""}
              {item.options?.extras?.length
                ? ` - Extras: ${item.options.extras.join(", ")}`
                : ""}
            </Text>
          ))}

          <Text style={styles.totalText}>TOTAL VENTA: ${cartTotal}</Text>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: "green" }]}
            onPress={handleConfirmSale}
          >
            <Text style={styles.confirmText}>Confirmar Venta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: "red" }]}
            onPress={handleCancelSale}
          >
            <Text style={styles.confirmText}>Cancelar Venta</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  productCard: {
    flex: 1,
    backgroundColor: "#FFD700",
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  productText: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  priceText: { fontSize: 14, color: "gray", marginTop: 5 },
  sectionTitle: { fontWeight: "bold", marginTop: 10 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  optionButton: {
    backgroundColor: "#ddd",
    padding: 8,
    margin: 5,
    borderRadius: 8,
  },
  confirmButton: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#2196F3",
  },
  confirmText: { color: "white", fontWeight: "bold" },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    maxHeight: "80%",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});
