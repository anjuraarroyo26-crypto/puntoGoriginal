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
      product: order.product ?? { id: "unknown", name: "Producto" },
      qty: Number(order.qty) || 1,
      status: "Recibido",
      date: new Date().toISOString().split("T")[0],
      amount: order.amount ?? (Number(order.qty) || 1) * (order.product?.price || 0),
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
            if (!order || !order.product || !order.qty) return null;
            return {
              id: key,
              product: order.product ?? { id: "unknown", name: "Producto" },
              qty: Number(order.qty) || 1,
              status: order.status ?? "Recibido",
              date: order.date ?? new Date().toISOString().split("T")[0],
              amount: order.amount ?? (Number(order.qty) || 1) * (order.product?.price || 0),
            };
          })
          .filter(Boolean);

        setOrders(parsedOrders);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const activeOrders = orders.filter(
    (o) => o.status === "Recibido" || o.status === "Preparando"
  );
  const closedOrders = orders.filter((o) => o.status === "Cerrado");

  return (
    <OrdersContext.Provider
      value={{
        orders,
        activeOrders,
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
