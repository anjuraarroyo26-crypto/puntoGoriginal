// screens/Products.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { ProductsContext } from "../context/ProductsContext";
import { InventoryContext } from "../context/InventoryContext";

const Products = () => {
  const { products, addProduct, removeProduct } = useContext(ProductsContext);
  const { inventory } = useContext(InventoryContext);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState([]);

  const toggleIngredient = (material) => {
    const exists = selectedRecipe.find((item) => item.materialId === material.id);
    if (exists) {
      setSelectedRecipe((prev) =>
        prev.map((item) =>
          item.materialId === material.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setSelectedRecipe((prev) => [
        ...prev,
        { materialId: material.id, qty: 1 },
      ]);
    }
  };

  const decreaseIngredient = (materialId) => {
    setSelectedRecipe((prev) =>
      prev
        .map((item) =>
          item.materialId === materialId
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const handleAddProduct = () => {
    if (!name || !price) {
   Alert.alert("Error", "El nombre y el precio son obligatorios");
   return;
    }

    addProduct(name, parseFloat(price), selectedRecipe);
    setName("");
    setPrice("");
    setSelectedRecipe([]);
  };

  return (
    <View style={{ flex: 1, padding: 16,  paddingTop: 70 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Lista de Productos
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderColor: "#ccc",
              marginBottom: 10,
              position: "relative",
              minHeight: 70,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
            <Text>Precio: ${item.price}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <Text>
                Receta:{" "}
                {item.recipe
                  .map((r) => {
                    const material = inventory.find((m) => m.id === r.materialId);
                    return `${material?.name || "?"} x${r.qty}`;
                  })
                  .join(", ")}
              </Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Eliminar producto",
                  "¿Deseas eliminar este producto?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Eliminar",
                      style: "destructive",
                      onPress: () => removeProduct(item.id),
                    },
                  ]
                )
              }
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: 8,
                backgroundColor: "#f44336",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={{ fontSize: 18, marginTop: 20, fontWeight: "bold" }}>
        Agregar nuevo producto
      </Text>

      <TextInput
        placeholder="Nombre del producto"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginVertical: 5,
          borderRadius: 5,
        }}
      />

      <TextInput
        placeholder="Precio"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginVertical: 5,
          borderRadius: 5,
        }}
      />

      <Text style={{ fontSize: 16, marginTop: 10 }}>Selecciona ingredientes:</Text>
      {inventory.map((material) => {
        const selected = selectedRecipe.find((i) => i.materialId === material.id);
        return (
          <View
            key={material.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 5,
            }}
          >
            <Text>{material.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => decreaseIngredient(material.id)}
                style={{
                  padding: 5,
                  backgroundColor: "#f44336",
                  borderRadius: 5,
                  marginRight: 5,
                }}
              >
                <Text style={{ color: "white" }}>-</Text>
              </TouchableOpacity>
              <Text>{selected?.qty || 0}</Text>
              <TouchableOpacity
                onPress={() => toggleIngredient(material)}
                style={{
                  padding: 5,
                  backgroundColor: "#4CAF50",
                  borderRadius: 5,
                  marginLeft: 5,
                }}
              >
                <Text style={{ color: "white" }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <Button title="Agregar Producto" onPress={handleAddProduct} />
    </View>
  );
};

export default Products;
