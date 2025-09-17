import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ExpensesContext = createContext();

export const ExpensesProvider = ({ children }) => {
  const [sales, setSales] = useState(0);

  const [expenses, setExpenses] = useState([]);       // gastos del día
  const [allExpenses, setAllExpenses] = useState([]); // historial completo
  const [history, setHistory] = useState([]);         // historial combinado
  const [products, setProducts] = useState([
    { id: 1, name: "Hamburguesa", stock: 10, price: 12000 },
    { id: 2, name: "Salchipapas", stock: 8, price: 10000 },
  ]);

  // 🔹 Cargar desde AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const storedExpenses = await AsyncStorage.getItem("expenses");
        const storedAllExpenses = await AsyncStorage.getItem("allExpenses");
        const storedHistory = await AsyncStorage.getItem("expensesHistory");
        if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
        if (storedAllExpenses) setAllExpenses(JSON.parse(storedAllExpenses));
        if (storedHistory) setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.log("Error cargando gastos:", e);
      }
    })();
  }, []);

  // 🔹 Guardar automáticamente
  useEffect(() => {
    AsyncStorage.setItem("expenses", JSON.stringify(expenses));
    AsyncStorage.setItem("allExpenses", JSON.stringify(allExpenses));
    AsyncStorage.setItem("expensesHistory", JSON.stringify(history));
  }, [expenses, allExpenses, history]);

  // ➕ Agregar venta
  const addSale = (productId, quantity, details) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock < quantity) return;

    const total = product.price * quantity;
    setSales((prev) => prev + total);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock - quantity } : p))
    );

    const record = {
      id: Date.now().toString(),
      type: "venta",
      product: product.name,
      quantity,
      details,
      total,
      date: new Date().toISOString(),
    };

    setHistory((prev) => [record, ...prev]);
  };

  // ➕ Agregar gasto
  const addExpense = (amount, description) => {
    const record = {
      id: Date.now().toString(),
      type: "gasto",
      description: description || "",
      amount: Number(amount) || 0,
      date: new Date().toISOString(),
    };

    setExpenses((prev) => [record, ...prev]);
    setAllExpenses((prev) => [record, ...prev]);
    setHistory((prev) => [record, ...prev]);

    return record.id;
  };

  // ❌ Eliminar gasto
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setAllExpenses((prev) => prev.filter((e) => e.id !== id));
    setHistory((prev) => prev.filter((h) => !(h.type === "gasto" && h.id === id)));
  };

  // 🧹 Cerrar caja: limpiar solo gastos del día
  const closeDay = () => {
    const today = new Date().toLocaleDateString();
    setExpenses((prev) => prev.filter((e) => new Date(e.date).toLocaleDateString() !== today));
  };

  return (
    <ExpensesContext.Provider
      value={{
        sales,
        expenses,
        allExpenses,
        history,
        products,
        addSale,
        addExpense,
        deleteExpense,
        setProducts,
        closeDay,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
};
