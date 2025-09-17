import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SalesContext } from "./SalesContext";
import { ExpensesContext } from "./ExpensesContext";
import { Alert } from "react-native";

export const CashContext = createContext();

export const CashProvider = ({ children }) => {
  const [initialCash, setInitialCash] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [cashHistory, setCashHistory] = useState([]);

  const { salesHistory, closeDay: closeSalesDay } = useContext(SalesContext);
  const { expenses, closeDay: closeExpensesDay } = useContext(ExpensesContext);

  // Cargar desde AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const storedCashHistory = await AsyncStorage.getItem("cashHistory");
        const storedInitialCash = await AsyncStorage.getItem("initialCash");
        const storedIsOpen = await AsyncStorage.getItem("isCashOpen");

        if (storedCashHistory) setCashHistory(JSON.parse(storedCashHistory));
        if (storedInitialCash) setInitialCash(Number(storedInitialCash));
        if (storedIsOpen) setIsOpen(storedIsOpen === "true");
      } catch (e) {
        console.log("Error cargando caja:", e);
      }
    })();
  }, []);

  // Guardar automáticamente
  useEffect(() => {
    AsyncStorage.setItem("cashHistory", JSON.stringify(cashHistory));
    AsyncStorage.setItem("initialCash", String(initialCash));
    AsyncStorage.setItem("isCashOpen", String(isOpen));
  }, [cashHistory, initialCash, isOpen]);

  const openCash = (amount) => {
    setInitialCash(amount);
    setIsOpen(true);
  };

  const closeCash = () => {
    Alert.alert(
      "Cerrar Caja",
      "¿Estás seguro de cerrar la caja? Esta acción guardará el cierre del día y limpiará las ventas y gastos del día.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar",
          style: "destructive",
          onPress: () => {
            const today = new Date().toLocaleDateString();

            const todaySales = salesHistory.filter(
              (s) => new Date(s.date).toLocaleDateString() === today
            );
            const salesTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

            const todayExpenses = expenses.filter(
              (e) => new Date(e.date).toLocaleDateString() === today
            );
            const expensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

            const finalCash = initialCash + salesTotal - expensesTotal;

            setCashHistory((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                date: today,
                initialCash,
                salesTotal,
                expensesTotal,
                finalCash,
              },
            ]);

            // Borrar solo ventas y gastos del día
            closeSalesDay();
            closeExpensesDay();

            setIsOpen(false);
            setInitialCash(0);
          },
        },
      ]
    );
  };

  return (
    <CashContext.Provider
      value={{
        initialCash,
        isOpen,
        openCash,
        closeCash,
        cashHistory,
      }}
    >
      {children}
    </CashContext.Provider>
  );
};
