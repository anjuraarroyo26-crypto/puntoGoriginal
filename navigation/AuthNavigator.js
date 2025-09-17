// navigation/AuthNavigator.js
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import StackNavigator from "./StackNavigator";
import TabNavigator from "./TabNavigator";

export default function AuthNavigator() {
  const { user } = useContext(AuthContext);
  return user ? <TabNavigator /> : <StackNavigator />;
}
