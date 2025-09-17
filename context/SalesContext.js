import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import app from "../firebase";
import { getDatabase, ref, set, push } from "firebase/database";

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [allSalesHistory, setAllSalesHistory] = useState([]);

  // Cargar datos desde AsyncStorage al iniciar
  useEffect(() => {
    (async () => {
      const storedCart = await AsyncStorage.getItem("cart");
      const storedSalesHistory = await AsyncStorage.getItem("salesHistory");
      const storedAllSalesHistory = await AsyncStorage.getItem("allSalesHistory");

      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedSalesHistory) setSalesHistory(JSON.parse(storedSalesHistory));
      if (storedAllSalesHistory) setAllSalesHistory(JSON.parse(storedAllSalesHistory));
    })();
  }, []);

  // Guardar automáticamente cada vez que cambien los estados
  useEffect(() => {
    AsyncStorage.setItem("cart", JSON.stringify(cart));
    AsyncStorage.setItem("salesHistory", JSON.stringify(salesHistory));
    AsyncStorage.setItem("allSalesHistory", JSON.stringify(allSalesHistory));
  }, [cart, salesHistory, allSalesHistory]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.productId === (product.id || product.productId) &&
          JSON.stringify(item.options || {}) === JSON.stringify(product.options || {})
      );

      if (existingIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].qty += 1;
        return updatedCart;
      }

      const cartId = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      return [
        ...prevCart,
        {
          cartId,
          productId: String(product.id || product.productId),
          name: product.name,
          price: Number(product.price) || 0,
          qty: 1,
          options: product.options || {},
        },
      ];
    });
  };

  const decreaseFromCart = (index) => {
    setCart((prev) => {
      const newCart = [...prev];
      if (!newCart[index]) return prev;
      if (newCart[index].qty > 1) newCart[index].qty -= 1;
      else newCart.splice(index, 1);
      return newCart;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const confirmSale = async (productsOverride = null) => {
    const productsToSell =
      productsOverride ||
      cart.map((it) => ({
        productId: it.productId,
        name: it.name,
        price: it.price,
        qty: it.qty,
        options: it.options,
      }));

    if (!productsToSell || productsToSell.length === 0) return null;

    const total = productsToSell.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );

    const saleRecord = {
      id: Date.now().toString(),
      type: "venta",
      products: productsToSell,
      total,
      date: new Date().toISOString(),
    };

    // Guardar en estado local
    setSalesHistory((prev) => [saleRecord, ...prev]);
    setAllSalesHistory((prev) => [saleRecord, ...prev]);
    setCart([]);

    // Guardar en Firebase Realtime Database
    try {
      const db = getDatabase(app);
      const salesRef = ref(db, "sales");
      const newSaleRef = push(salesRef);
      await set(newSaleRef, saleRecord);
    } catch (error) {
      console.error("Error guardando la venta en Firebase:", error);
    }

    return saleRecord;
  };

  const closeDay = () => {
    const today = new Date().toLocaleDateString();
    setSalesHistory((prev) =>
      prev.filter((s) => new Date(s.date).toLocaleDateString() !== today)
    );
  };

  const getSalesByDate = (dateString) =>
    salesHistory.filter(
      (s) => new Date(s.date).toLocaleDateString() === dateString
    );

  return (
    <SalesContext.Provider
      value={{
        cart,
        addToCart,
        decreaseFromCart,
        removeFromCart,
        confirmSale,
        salesHistory,
        allSalesHistory,
        closeDay,
        getSalesByDate,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};
