import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { withHistory, initialRouteName } from "history";

import HomePage from "../screens/HomePage";
import TicketPage from "../screens/TicketPage";
import ProfilPage from "../screens/ProfilPage";
import DemandesPage from "../screens/DemandesPage"

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator headerMode="none" initialRouteName={initialRouteName}>
      <Stack.Screen name="home" component={withHistory(HomePage)} />
      <Stack.Screen name="ticketPage" component={withHistory(TicketPage)} />
      <Stack.Screen name="profilPage" component={withHistory(ProfilPage)} />
      <Stack.Screen name="demandesPage" component={withHistory(DemandesPage)} />
    </Stack.Navigator>
  );
}
