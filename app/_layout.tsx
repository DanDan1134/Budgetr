import React, { useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { Alert, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors, FontSizes, Spacing } from '../constants/theme';
import { initDatabase } from '../services/database';
import { deleteBudget } from '../services/budgetService';
import { deleteAllCategories } from '../services/categoryService';
import { deleteAllSpendings } from '../services/spendingService';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initDatabase().catch((error) => {
      console.error('Failed to initialize database:', error);
      Alert.alert('Error', 'Failed to initialize the app. Please restart.');
    });
  }, []);

  const handleSetup = () => {
    Alert.alert(
      'Reset Budget',
      'This will delete your current budget and start over. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget();
              await deleteAllCategories();
              await deleteAllSpendings();
              router.replace('/setup/budget');
            } catch (error) {
              console.error('Error resetting budget:', error);
              Alert.alert('Error', 'Failed to reset budget');
            }
          },
        },
      ]
    );
  };

  const handleNewPeriod = () => {
    Alert.alert(
      'Start New Period',
      'This will reset all spending records but keep your budget and categories. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              await deleteAllSpendings();
              router.replace('/');
              Alert.alert('Success', 'New budgeting period started!');
            } catch (error) {
              console.error('Error starting new period:', error);
              Alert.alert('Error', 'Failed to start new period');
            }
          },
        },
      ]
    );
  };

  const isSetupRoute = pathname.startsWith('/setup');

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.cardBackground,
        },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: FontSizes.lg,
        },
        drawerStyle: {
          backgroundColor: Colors.background,
        },
        drawerActiveTintColor: Colors.primaryGreen,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerLabelStyle: {
          fontSize: FontSizes.md,
        },
        swipeEnabled: !isSetupRoute,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Home',
          title: 'Budgetr',
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="setup/budget"
        options={{
          drawerLabel: () => null,
          title: 'Setup Budget',
          drawerItemStyle: { display: 'none' },
          headerShown: true,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="setup/categories"
        options={{
          drawerLabel: () => null,
          title: 'Setup Categories',
          drawerItemStyle: { display: 'none' },
          headerShown: true,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="action-setup"
        options={{
          drawerLabel: 'Setup',
          title: 'Setup',
          drawerItemStyle: { display: isSetupRoute ? 'none' : 'flex' },
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleSetup();
          },
        }}
      />
      <Drawer.Screen
        name="action-new-period"
        options={{
          drawerLabel: 'New Period',
          title: 'New Period',
          drawerItemStyle: { display: isSetupRoute ? 'none' : 'flex' },
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleNewPeriod();
          },
        }}
      />
    </Drawer>
  );
}
