import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardStack from "./DashboardStack";
import Sales from "../screens/Sales";
import Products from "../screens/Products";
import History from "../screens/History";
import Reports from "../screens/Reports";
import Expenses from "../screens/Expenses";
import Caja from "../screens/Caja";          
import CashHistory from "../screens/CashHistory"; 
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#FFC107", height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Inicio") iconName = "home";
          else if (route.name === "Ventas") iconName = "cart";
          else if (route.name === "Productos") iconName = "fast-food";
          else if (route.name === "Gastos") iconName = "wallet";
          else if (route.name === "Historial") iconName = "time";
          else if (route.name === "Reportes") iconName = "bar-chart";
          else if (route.name === "Caja") iconName = "cash";
          else if (route.name === "Cierres") iconName = "archive"; 

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "black",
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardStack} />
      <Tab.Screen name="Ventas" component={Sales} />
      <Tab.Screen name="Caja" component={Caja} />
      <Tab.Screen name="Productos" component={Products} />
      <Tab.Screen name="Gastos" component={Expenses} />
      <Tab.Screen name="Historial" component={History} />
      <Tab.Screen name="Reportes" component={Reports} />
      <Tab.Screen name="Cierres" component={CashHistory} />
    </Tab.Navigator>
  );
}
