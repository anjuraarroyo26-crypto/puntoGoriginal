import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Dashboard from "../screens/Dashboard";
import AddMaterialScreen from "../screens/AddMaterialScreen";
import InventoryScreen from "../screens/InventoryScreen"; // <-- agregar import

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={Dashboard} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
    </Stack.Navigator>
  );
}
