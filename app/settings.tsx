import React, { useCallback, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { ScreenScroll } from '../components/ScreenScroll';
import {
  isLockEnabled,
  isReminderEnabled,
  setLockEnabled,
  setReminderEnabled,
} from '../services/settingsService';
import { syncPeriodReminder } from '../services/reminderService';

export default function SettingsScreen() {
  const [lock, setLock] = useState(false);
  const [reminder, setReminder] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([isLockEnabled(), isReminderEnabled()]).then(([lockValue, reminderValue]) => {
        setLock(lockValue);
        setReminder(reminderValue);
      });
    }, [])
  );

  const toggleLock = async (value: boolean) => {
    setLock(value);
    await setLockEnabled(value);
  };

  const toggleReminder = async (value: boolean) => {
    setReminder(value);
    await setReminderEnabled(value);
    await syncPeriodReminder(value);
    if (value) {
      Alert.alert('Reminder on', 'You will get a reminder on the 1st of each month.');
    }
  };

  return (
    <ScreenScroll style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>Device lock</Text>
          <Text style={styles.hint}>Use Face ID or the device PIN. No account needed.</Text>
        </View>
        <Switch
          value={lock}
          onValueChange={toggleLock}
          trackColor={{ false: Colors.border, true: Colors.primaryGreen }}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>New period reminder</Text>
          <Text style={styles.hint}>Notify on the 1st of the month.</Text>
        </View>
        <Switch
          value={reminder}
          onValueChange={toggleReminder}
          trackColor={{ false: Colors.border, true: Colors.primaryGreen }}
        />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  row: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  copy: { flex: 1 },
  label: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '600' },
  hint: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: Spacing.xs },
});
