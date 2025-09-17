// context/OrdersContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, push, set, onValue, update } from "firebase/database";

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);

  // 🔹 Agregar orden
  const addOrder = (order) => {
    if (!order || !order.product || !order.qty) {
      console.log("Orden inválida, no se puede agregar:", order);
      return;
    }

    const ordersRef = ref(database, "orders");
    const newOrderRef = push(ordersRef);

    const orderWithDefaults = {
      ...order,
      status: "Recibido", // 👈 siempre recibida al inicio
      date: new Date().toISOString().split("T")[0],
      amount: order.amount ?? order.qty * 10000,
    };

    set(newOrderRef, orderWithDefaults)
      .then(() => {
        setOrders((prev) => [
          ...prev,
          { id: newOrderRef.key, ...orderWithDefaults },
        ]);
      })
      .catch((error) => console.log("Error agregando orden:", error));
  };

  // 🔹 Actualizar estado
  const updateOrderStatus = (id, newStatus) => {
    if (!id || !newStatus) return;

    const orderRef = ref(database, `orders/${id}`);
    let updates = { status: newStatus };

    if (newStatus === "Cerrado") {
      updates.date = new Date().toISOString().split("T")[0];
    }

    update(orderRef, updates).catch((err) =>
      console.log("Error actualizando orden:", err)
    );

    setOrders((prev) =>
      prev.map((order) =>
        order?.id === id ? { ...order, ...updates } : order
      )
    );
  };

  // 🔹 Leer órdenes en tiempo real
  useEffect(() => {
    const ordersRef = ref(database, "orders");
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === "object") {
        const parsedOrders = Object.keys(data)
          .map((key) => {
            const order = data[key];
            if (order && order.product && order.qty) {
              return { id: key, ...order };
            }
            return null;
          })
          .filter(Boolean);

        setOrders(parsedOrders);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Filtros útiles
  const activeOrders = orders.filter(
    (o) => o.status === "Recibido" || o.status === "Activo"
  );
  const closedOrders = orders.filter((o) => o.status === "Cerrado");

  return (
    <OrdersContext.Provider
      value={{
        orders,
        activeOrders, // 👈 aquí tienes las activas listas
        closedOrders,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => useContext(OrdersContext);
