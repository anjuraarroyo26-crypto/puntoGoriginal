import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login";
import TabNavigator from "./TabNavigator";
import AddMaterialScreen from "../screens/AddMaterialScreen";
import InventoryScreen from "../screens/InventoryScreen"; // <-- import agregado
import CookTabNavigator from "./CookTabNavigator";

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="CookApp" component={CookTabNavigator} />
    </Stack.Navigator>
  );
}
