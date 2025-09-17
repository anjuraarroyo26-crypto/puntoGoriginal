// context/ProductsContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InventoryContext } from "./InventoryContext";
import { SalesContext } from "./SalesContext";

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const { consumeMaterial } = useContext(InventoryContext);
  const { confirmSale } = useContext(SalesContext);

  // Lista inicial de productos (exactamente como los tenías)
  const [products, setProducts] = useState([
    {
      id: "p1",
      name: "Hamburguesa",
      price: 14000,
      recipe: [
        { materialId: "1", qty: 1 },
        { materialId: "6", qty: 1 },
      ],
    },
    {
      id: "p2",
      name: "Perro Caliente",
      price: 13000,
      recipe: [
        { materialId: "2", qty: 1 },
        { materialId: "3", qty: 1 },
      ],
    },
    {
      id: "p3",
      name: "Gaseosa",
      price: 2000,
      recipe: [],
    },
  ]);

  // 📌 Cargar productos de AsyncStorage al iniciar
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("@products");
        if (stored) setProducts(JSON.parse(stored));
      } catch (e) {
        console.log("Error cargando productos:", e);
      }
    })();
  }, []);

  // 📌 Guardar productos cada vez que cambien
  useEffect(() => {
    AsyncStorage.setItem("@products", JSON.stringify(products)).catch(console.log);
  }, [products]);

  // ➕ Agregar producto
  const addProduct = (name, price, recipe = []) => {
    const newProduct = {
      id: Date.now().toString(),
      name,
      price: Number(price) || 0,
      recipe: Array.isArray(recipe) ? recipe : [],
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  // 🗑️ Eliminar producto
  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // 🛒 Vender producto → descuenta inventario solo si tiene receta
  const sellProduct = (productId, quantity = 1) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (product.recipe && product.recipe.length > 0) {
      product.recipe.forEach((ingredient) => {
        consumeMaterial(ingredient.materialId, ingredient.qty * quantity);
      });
    }

    confirmSale([
      {
        id: product.id,
        name: product.name,
        price: product.price,
        qty: quantity,
      },
    ]);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        sellProduct,
        removeProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
