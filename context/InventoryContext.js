import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";
import { getDatabase, ref, onValue, set, update } from "firebase/database"; 
import { app } from "../firebase";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [inventory, setInventory] = useState([]);
  const db = getDatabase(app);

  // 🚀 Cargar inventario desde Firebase
  useEffect(() => {
    if (!user) return;

    const invRef = ref(db, `inventories/${user.email.replace(/\./g, "_")}`);
    const unsubscribe = onValue(invRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.values(data);
        setInventory(items);
        await AsyncStorage.setItem("inventory", JSON.stringify(items));
      } else {
        setInventory([]);
        await AsyncStorage.removeItem("inventory");
      }
    });

    return () => unsubscribe();
  }, [user]);

  // ➕ Agregar nueva materia prima
  const addRawMaterial = async (name, initialQty = 0) => {
    if (!user) return null;
    const newItem = {
      id: Date.now().toString(),
      name,
      qty: Number(initialQty) || 0,
      userEmail: user.email,
    };

    const invRef = ref(db, `inventories/${user.email.replace(/\./g, "_")}/${newItem.id}`);
    await set(invRef, newItem);
    return newItem.id;
  };

  // 📦 Reabastecer
  const restockMaterial = async (id, amount) => {
    const updated = inventory.map((it) =>
      it.id === id ? { ...it, qty: it.qty + Number(amount || 0) } : it
    );
    setInventory(updated);

    const item = updated.find((it) => it.id === id);
    const itemRef = ref(db, `inventories/${user.email.replace(/\./g, "_")}/${id}`);
    await update(itemRef, { qty: item.qty });
  };

  // ❌ Consumir
  const consumeMaterial = async (id, amount) => {
    const updated = inventory.map((it) =>
      it.id === id ? { ...it, qty: Math.max(0, it.qty - Number(amount || 0)) } : it
    );
    setInventory(updated);

    const item = updated.find((it) => it.id === id);
    const itemRef = ref(db, `inventories/${user.email.replace(/\./g, "_")}/${id}`);
    await update(itemRef, { qty: item.qty });
  };

  // 📑 Consumir receta
  const consumeMaterials = async (recipe, multiplier = 1) => {
    const updated = inventory.map((it) => {
      const r = recipe.find((x) => String(x.materialId) === String(it.id));
      if (!r) return it;
      return {
        ...it,
        qty: Math.max(0, it.qty - Number(r.qty || 0) * multiplier),
      };
    });

    setInventory(updated);

    updated.forEach(async (item) => {
      const itemRef = ref(db, `inventories/${user.email.replace(/\./g, "_")}/${item.id}`);
      await update(itemRef, { qty: item.qty });
    });
  };

  // ♻️ Restaurar materiales al cancelar venta
  const returnMaterials = async (recipe, multiplier = 1) => {
    const updated = inventory.map((it) => {
      const r = recipe.find((x) => String(x.materialId) === String(it.id));
      if (!r) return it;
      return {
        ...it,
        qty: it.qty + Number(r.qty || 0) * multiplier,
      };
    });

    setInventory(updated);

    updated.forEach(async (item) => {
      const itemRef = ref(db, `inventories/${user.email.replace(/\./g, "_")}/${item.id}`);
      await update(itemRef, { qty: item.qty });
    });
  };

  // ✅ Validar receta
  const checkMaterials = (recipe, multiplier = 1) => {
    return recipe.every((item) => {
      const material = inventory.find((m) => String(m.id) === String(item.materialId));
      return material && material.qty >= item.qty * multiplier;
    });
  };

  const findMaterial = (id) =>
    inventory.find((it) => String(it.id) === String(id));

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        addRawMaterial,
        restockMaterial,
        consumeMaterial,
        consumeMaterials,
        returnMaterials, // 👈 ahora sí exportada
        findMaterial,
        checkMaterials,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
