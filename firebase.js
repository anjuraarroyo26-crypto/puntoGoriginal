// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 
import { getAuth } from "firebase/auth"; // 👈 importante si usas auth

const firebaseConfig = {
  apiKey: "AIzaSyBl_KRxj693tuE2qdPAgLQcUXPuhTR2TjM",
  authDomain: "punto-g-f1dcb.firebaseapp.com",
  projectId: "punto-g-f1dcb",
  storageBucket: "punto-g-f1dcb.appspot.com", // 👈 corregido (.appspot.com)
  messagingSenderId: "171926923769",
  appId: "1:171926923769:web:4feec9070c9dff72deb528"
};

// Inicializar Firebase solo si no hay apps
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Instancias de servicios
const database = getDatabase(app);
const auth = getAuth(app);

export { app, database, auth };
