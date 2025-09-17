import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import CookDashboard from "../screens/CookApp/CookDashboard";
import CookOrders from "../screens/CookApp/CookOrders";
import CookHistory from "../screens/CookApp/CookHistory";

const Tab = createBottomTabNavigator();

export default function CookNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Inicio") {
            iconName = "restaurant";
          } else if (route.name === "Órdenes") {
            iconName = "list";
          } else if (route.name === "Historial") {
            iconName = "time";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={CookDashboard} />
      <Tab.Screen name="Órdenes" component={CookOrders} />
      <Tab.Screen name="Historial" component={CookHistory} />
    </Tab.Navigator>
  );
}
