import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("DashboardStack")}
      >
        <Text style={styles.text}>Entrar como Administrador</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("CookApp")}
      >
        <Text style={styles.text}>Entrar como Cocinero</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, marginBottom: 30, fontWeight: "bold" },
  button: { backgroundColor: "#333", padding: 15, borderRadius: 10, marginVertical: 10, width: "70%" },
  text: { color: "#fff", textAlign: "center", fontSize: 16 }
});
