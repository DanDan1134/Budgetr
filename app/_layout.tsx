import React, { useEffect, useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import { Alert, ActivityIndicator, Platform, View, StyleSheet } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useRouter, usePathname } from 'expo-router';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Colors, FontSizes } from '../constants/theme';
import { WebPreviewNav } from '../components/WebPreviewNav';
import { initDatabase } from '../services/database';
import { deleteBudget } from '../services/budgetService';
import { deleteAllCategories } from '../services/categoryService';
import { deleteAllSpendings } from '../services/spendingService';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((error) => {
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

  const renderDrawerContent = (props: DrawerContentComponentProps) => (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {!isSetupRoute && (
        <>
          <DrawerItem
            label="Setup"
            onPress={() => {
              props.navigation.closeDrawer();
              handleSetup();
            }}
            inactiveTintColor={Colors.textSecondary}
            labelStyle={styles.drawerLabel}
          />
          <DrawerItem
            label="New Period"
            onPress={() => {
              props.navigation.closeDrawer();
              handleNewPeriod();
            }}
            inactiveTintColor={Colors.textSecondary}
            labelStyle={styles.drawerLabel}
          />
        </>
      )}
    </DrawerContentScrollView>
  );

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  const app = (
    <Drawer
      drawerContent={renderDrawerContent}
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
        drawerLabelStyle: styles.drawerLabel,
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
        name="+not-found"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webShell}>
        <WebPreviewNav />
        <View style={styles.webApp}>{app}</View>
      </View>
    );
  }

  return <KeyboardProvider>{app}</KeyboardProvider>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLabel: {
    fontSize: FontSizes.md,
  },
  webShell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webApp: {
    flex: 1,
  },
});
