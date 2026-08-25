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
import { initDatabase, resetDatabase } from '../services/database';
import { ThemeProvider, useAccent } from '../contexts/ThemeContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

function AppShell() {
  const router = useRouter();
  const pathname = usePathname();
  const accent = useAccent();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((error) => {
        console.error('Failed to initialize database:', error);
        Alert.alert('Error', 'Failed to initialize the app. Please restart.');
      });
  }, []);

  const handleResetAll = () => {
    Alert.alert(
      'Reset Everything',
      'This will permanently delete your budget, categories, spendings, and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              router.replace('/setup/budget');
            } catch (error) {
              console.error('Error resetting database:', error);
              Alert.alert('Error', 'Failed to reset everything');
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
            label="Reset All"
            onPress={() => {
              props.navigation.closeDrawer();
              handleResetAll();
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
        <ActivityIndicator size="large" color={accent} />
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
        drawerActiveTintColor: accent,
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
        name="history"
        options={{
          drawerLabel: 'History',
          title: 'History',
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="theme"
        options={{
          drawerLabel: 'Theme',
          title: 'Theme',
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
