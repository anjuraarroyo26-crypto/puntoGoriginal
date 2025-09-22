// context/ExpensesContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase, ref, set, push, get, remove } from "firebase/database";
import { app } from "../firebase"; // <-- corregido

export const ExpensesContext = createContext();

export const ExpensesProvider = ({ children }) => {
  const [sales, setSales] = useState(0);

  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([
    { id: 1, name: "Hamburguesa", stock: 10, price: 12000 },
    { id: 2, name: "Salchipapas", stock: 8, price: 10000 },
  ]);

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

  useEffect(() => {
    AsyncStorage.setItem("expenses", JSON.stringify(expenses)).catch(()=>{});
    AsyncStorage.setItem("allExpenses", JSON.stringify(allExpenses)).catch(()=>{});
    AsyncStorage.setItem("expensesHistory", JSON.stringify(history)).catch(()=>{});
  }, [expenses, allExpenses, history]);

  const addSale = (productId, quantity, details) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock < quantity) return;

    const total = product.price * quantity;
    setSales((prev) => prev + total);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: p.stock - quantity } : p
      )
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

  const addExpense = async (amount, description) => {
    const record = {
      id: Date.now().toString(),
      type: "gasto",
      description: description || "",
      amount: Number(amount) || 0,
      date: new Date().toISOString(),
    };

    try {
      const db = getDatabase(app);
      const expensesRef = ref(db, "expenses");
      const newExpenseRef = push(expensesRef);
      await set(newExpenseRef, record);
      console.log("✅ Gasto guardado en Firebase:", record);
    } catch (error) {
      console.error("Error guardando gasto en Firebase:", error);
    }

    setExpenses((prev) => [record, ...prev]);
    setAllExpenses((prev) => [record, ...prev]);
    setHistory((prev) => [record, ...prev]);

    return record.id;
  };

  const deleteExpense = async (id) => {
    try {
      const db = getDatabase(app);
      const expensesRef = ref(db, "expenses");

      const snapshot = await get(expensesRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const entry = Object.entries(data).find(([key, val]) => val.id === id);

        if (entry) {
          await remove(ref(db, `expenses/${entry[0]}`));
          console.log("✅ Gasto eliminado en Firebase:", id);
        }
      }

      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setAllExpenses((prev) => prev.filter((e) => e.id !== id));
      setHistory((prev) => prev.filter((h) => !(h.type === "gasto" && h.id === id)));
    } catch (error) {
      console.error("Error eliminando gasto en Firebase:", error);
    }
  };

  const closeDay = () => {
    const today = new Date().toLocaleDateString();
    setExpenses((prev) =>
      prev.filter((e) => new Date(e.date).toLocaleDateString() !== today)
    );
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
