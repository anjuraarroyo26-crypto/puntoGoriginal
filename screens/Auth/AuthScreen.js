// screens/Auth/AuthScreen.js
import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { getAuth, sendPasswordResetEmail } from "firebase/auth"; 
import { app } from "../../firebase";

export default function AuthScreen({ navigation }) {
  const { user, login, register, loadUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [step, setStep] = useState("role");
  const [loading, setLoading] = useState(false);

  // 🔹 función multiplataforma para alertas
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      import("react-native").then(({ Alert }) => {
        Alert.alert(title, message);
      });
    }
  };

  // 🔹 Cargar usuario si ya está logueado
  useEffect(() => {
    loadUser().then(() => {
      if (user) redirectByRole(user.role);
    });
  }, []);

  const redirectByRole = (role) => {
    if (role === "Cocinero") navigation.replace("Cooker");
    else navigation.replace("Main");
  };

  const handleNextStep = () => {
    if (!role) {
      showAlert("Selecciona un rol", "Debes elegir un rol para continuar");
      return;
    }
    setStep("credentials");
  };

  const handleBack = () => {
    if (isReset) {
      setIsReset(false);
      setStep("role");
    } else if (step === "credentials") {
      setStep("role");
      setEmail("");
      setPassword("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!email) throw new Error("Ingresa tu email");

      if (isReset) {
        const auth = getAuth(app);
        await sendPasswordResetEmail(auth, email.trim());
        showAlert(
          "Correo enviado",
          "Revisa tu bandeja de entrada para restablecer la contraseña."
        );
        setIsReset(false);
        setStep("role");
        return;
      }

      let loggedUser;
      if (isRegister) {
        if (!password) throw new Error("Ingresa tu contraseña");
        if (!role) throw new Error("Selecciona un rol");
        loggedUser = await register(email, password, role);
      } else {
        if (!password) throw new Error("Ingresa tu contraseña");
        loggedUser = await login(email, password);
      }

      if (loggedUser.role !== role) {
        showAlert(
          "Error de rol",
          `El usuario ingresado pertenece al rol "${loggedUser.role}", no a "${role}"`
        );
        return;
      }

      redirectByRole(loggedUser.role);
    } catch (e) {
      console.log("Error en login:", e.message);
      showAlert("Error", e.message || "Correo o contraseña inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isReset
          ? "Recuperar Contraseña"
          : isRegister
          ? "Registrar Usuario"
          : "Iniciar Sesión"}
      </Text>

      {/* Paso 1: elegir rol */}
      {step === "role" && !isReset && (
        <View style={styles.rolesRow}>
          <TouchableOpacity
            onPress={() => setRole("Administrador")}
            style={[
              styles.roleButton,
              role === "Administrador" && styles.roleSelected,
            ]}
          >
            <Text>Administrador</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setRole("Cocinero")}
            style={[
              styles.roleButton,
              role === "Cocinero" && styles.roleSelected,
            ]}
          >
            <Text>Cocinero</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "role" && role && !isReset && (
        <TouchableOpacity style={styles.button} onPress={handleNextStep}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      )}

      {/* Paso 2: credenciales o reset */}
      {(step === "credentials" || isReset) && (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text.trim().toLowerCase())}
            style={styles.input}
          />

          {!isReset && (
            <TextInput
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          )}

          {isRegister && (
            <View style={styles.rolesRow}>
              <TouchableOpacity
                onPress={() => setRole("Administrador")}
                style={[
                  styles.roleButton,
                  role === "Administrador" && styles.roleSelected,
                ]}
              >
                <Text>Administrador</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole("Cocinero")}
                style={[
                  styles.roleButton,
                  role === "Cocinero" && styles.roleSelected,
                ]}
              >
                <Text>Cocinero</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: "#aaa" }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isReset ? "Enviar correo" : isRegister ? "Registrar" : "Entrar"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#888" }]}
            onPress={handleBack}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={{ marginTop: 10, color: "#000" }}>
          {isRegister ? "Ya tengo cuenta" : "Crear nueva cuenta"}
        </Text>
      </TouchableOpacity>

      {!isRegister && !isReset && (
        <TouchableOpacity onPress={() => setIsReset(true)}>
          <Text style={{ marginTop: 10, color: "#000" }}>
            Olvidé mi contraseña
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#ffbb00ff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", borderWidth: 1, borderColor: "#fdfdfdff", borderRadius: 8, padding: 10, marginBottom: 10 },
  button: { backgroundColor: "#e53935ff", padding: 15, borderRadius: 8, width: "60%", alignItems: "center", marginBottom: 10 },
  buttonText: { color: "white", fontWeight: "bold" }, // 👈 fix color
  roleButton: { padding: 10, borderWidth: 1, borderColor: "#fcfcfcff", borderRadius: 8 },
  roleSelected: { backgroundColor: "#f8f7f5ff" },
  rolesRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 20 },
});
