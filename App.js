import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import TabNavigator from "./navigation/TabNavigator";
import CookNavigator from "./navigation/CookTabNavigator";
import AuthScreen from "./screens/Auth/AuthScreen";

import { InventoryProvider } from "./context/InventoryContext";
import { SalesProvider } from "./context/SalesContext";
import { ProductsProvider } from "./context/ProductsContext";
import { ExpensesProvider } from "./context/ExpensesContext";
import { CashProvider } from "./context/CashContext";
import { OrdersProvider } from "./context/OrdersContext"; 
import { AuthProvider } from "./context/AuthContext";

const Stack = createStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="Auth" component={AuthScreen} />

      
      <Stack.Screen name="Main" component={TabNavigator} />

      
      <Stack.Screen name="Cooker" component={CookNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>      
        <SalesProvider>         
          <OrdersProvider>      
            <ProductsProvider>  
              <ExpensesProvider>
                <CashProvider>
                  <NavigationContainer>
                    <RootNavigator />
                  </NavigationContainer>
                </CashProvider>
              </ExpensesProvider>
            </ProductsProvider>
          </OrdersProvider>
        </SalesProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}
