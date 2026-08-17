import React, { useEffect, useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import { Alert, ActivityIndicator, Platform, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
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
import { closeCurrentPeriod } from '../services/historyService';
import { applyRecurringSpendings } from '../services/recurringService';
import { authenticateUnlock, shouldLockApp } from '../services/lockService';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const [dbReady, setDbReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(async () => {
        const needsLock = await shouldLockApp();
        if (!needsLock) {
          setUnlocked(true);
        } else {
          const ok = await authenticateUnlock();
          setUnlocked(ok);
        }
        setDbReady(true);
      })
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
              await closeCurrentPeriod();
              await deleteBudget();
              await deleteAllCategories();
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
      'This will save this period to History, then reset spendings. Budget and categories stay. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              await closeCurrentPeriod();
              const applied = await applyRecurringSpendings();
              router.replace({
                pathname: '/',
                params: { period: Date.now().toString() },
              });
              Alert.alert(
                'Success',
                applied > 0
                  ? `Period saved. ${applied} recurring bill${applied === 1 ? '' : 's'} added.`
                  : 'Period saved to History. Spendings were reset.'
              );
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
      <DrawerItem
        label="History"
        focused={pathname === '/history'}
        onPress={() => {
          props.navigation.closeDrawer();
          router.push('/history');
        }}
        activeTintColor={Colors.primaryGreen}
        inactiveTintColor={Colors.textSecondary}
        labelStyle={styles.drawerLabel}
      />
      <DrawerItem
        label="Recurring"
        focused={pathname === '/recurring'}
        onPress={() => {
          props.navigation.closeDrawer();
          router.push('/recurring');
        }}
        activeTintColor={Colors.primaryGreen}
        inactiveTintColor={Colors.textSecondary}
        labelStyle={styles.drawerLabel}
      />
      <DrawerItem
        label="Goals"
        focused={pathname === '/goals'}
        onPress={() => {
          props.navigation.closeDrawer();
          router.push('/goals');
        }}
        activeTintColor={Colors.primaryGreen}
        inactiveTintColor={Colors.textSecondary}
        labelStyle={styles.drawerLabel}
      />
      <DrawerItem
        label="Settings"
        focused={pathname === '/settings'}
        onPress={() => {
          props.navigation.closeDrawer();
          router.push('/settings');
        }}
        activeTintColor={Colors.primaryGreen}
        inactiveTintColor={Colors.textSecondary}
        labelStyle={styles.drawerLabel}
      />
    </DrawerContentScrollView>
  );

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  if (!unlocked) {
    return (
      <View style={styles.loading}>
        <Text style={styles.lockText}>Budgetr is locked</Text>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={async () => {
            const ok = await authenticateUnlock();
            setUnlocked(ok);
          }}
        >
          <Text style={styles.unlockText}>Unlock</Text>
        </TouchableOpacity>
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
        name="history"
        options={{
          drawerLabel: () => null,
          title: 'History',
          drawerItemStyle: { display: 'none' },
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="recurring"
        options={{
          drawerLabel: () => null,
          title: 'Recurring',
          drawerItemStyle: { display: 'none' },
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="goals"
        options={{
          drawerLabel: () => null,
          title: 'Goals',
          drawerItemStyle: { display: 'none' },
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: () => null,
          title: 'Settings',
          drawerItemStyle: { display: 'none' },
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
    gap: 16,
  },
  lockText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
  },
  unlockButton: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  unlockText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
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
