import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import PriorityAlertBanner from '../components/PriorityAlertBanner';
import HomeScreen from '../screens/HomeScreen';
import BillsScreen from '../screens/BillsScreen';
import AddBillScreen from '../screens/AddBillScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

// Tab + Add/Paywall screens are typed loosely here: nested navigators in
// React Navigation let a screen `navigate()` into an ancestor navigator's
// routes at runtime even though each navigator's own TS prop types only
// cover its own screens. Babel (Expo's bundler) doesn't type-check, so this
// doesn't block running the app — tightening it to CompositeScreenProps is
// a follow-up, not a blocker for the MVP.
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICON: Record<string, string> = {
  Home: '🏠',
  Bills: '💷',
  Medications: '💊',
  Expenses: '📊',
  Settings: '⚙️',
};

function Tabs() {
  return (
    <View style={{ flex: 1 }}>
      <PriorityAlertBanner />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICON[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Bills" component={BillsScreen as any} />
        <Tab.Screen name="Medications" component={MedicationsScreen as any} />
        <Tab.Screen name="Expenses" component={ExpensesScreen as any} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </View>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="AddBill" component={AddBillScreen} options={{ title: 'Add bill' }} />
        <Stack.Screen
          name="AddMedication"
          component={AddMedicationScreen}
          options={{ title: 'Add medication' }}
        />
        <Stack.Screen
          name="Appointments"
          component={AppointmentsScreen as any}
          options={{ title: 'Appointments' }}
        />
        <Stack.Screen
          name="AddAppointment"
          component={AddAppointmentScreen}
          options={{ title: 'Add appointment' }}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{ title: 'Log expense' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ title: 'DayStead Plus', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
