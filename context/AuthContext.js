// context/AuthContext.js
import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔹 Login
  const login = async (email, password) => {
    if (!email || !password) throw new Error("Completa todos los campos");

    const storedUsers = JSON.parse(await AsyncStorage.getItem("users")) || [];

    // Buscar usuario
    const foundUser = storedUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!foundUser) throw new Error("El usuario no está registrado");

    // Validar contraseña
    if (foundUser.password !== password) {
      throw new Error("Contraseña incorrecta");
    }

    // Guardar sesión
    setUser(foundUser);
    await AsyncStorage.setItem("currentUser", JSON.stringify(foundUser));

    return foundUser; // 👈 devolvemos el usuario
  };

  // 🔹 Registro
  const register = async (email, password, role) => {
    if (!email || !password || !role) throw new Error("Completa todos los campos");

    const storedUsers = JSON.parse(await AsyncStorage.getItem("users")) || [];
    const exists = storedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("Este email ya está registrado");

    const newUser = { email, password, role };
    storedUsers.push(newUser);

    await AsyncStorage.setItem("users", JSON.stringify(storedUsers));
    setUser(newUser);
    await AsyncStorage.setItem("currentUser", JSON.stringify(newUser));

    return newUser; // 👈 devolvemos el usuario
  };

  // 🔹 Reset
  const resetPassword = async (email, newPassword) => {
    const storedUsers = JSON.parse(await AsyncStorage.getItem("users")) || [];
    const index = storedUsers.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) throw new Error("Usuario no encontrado");

    storedUsers[index].password = newPassword;
    await AsyncStorage.setItem("users", JSON.stringify(storedUsers));
  };

  // 🔹 Logout
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("currentUser");
  };

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem("currentUser");
    if (storedUser) setUser(JSON.parse(storedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, resetPassword, logout, loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
