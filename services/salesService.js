// services/salesService.js
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const addSale = async (data) => {
  await addDoc(collection(db, "ventas"), data);
};

export const getSales = async () => {
  const snapshot = await getDocs(collection(db, "ventas"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
