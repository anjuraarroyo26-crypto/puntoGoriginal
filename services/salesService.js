// services/salesservice.js
import { getDatabase, ref, push, set, get } from "firebase/database";
import { app } from "../firebase";

export const addSale = async (data) => {
  const db = getDatabase(app);
  const salesRef = ref(db, "ventas");
  const newRef = push(salesRef);
  await set(newRef, data);
  return newRef.key;
};

export const getSales = async () => {
  const db = getDatabase(app);
  const snapshot = await get(ref(db, "ventas"));
  const data = snapshot.val();
  if (!data) return [];
  return Object.keys(data).map((k) => ({ id: k, ...data[k] }));
};
