import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing } from '../constants/theme';
import { useAccent, useOnAccent } from '../contexts/ThemeContext';
import {
  clearPreviewBudget,
  loadSampleHistoryData,
  loadSamplePreviewData,
} from '../services/webPreviewStore';

const pages = [
  { key: 'setup-budget', label: 'Setup Budget', path: '/setup/budget' },
  { key: 'setup-categories', label: 'Setup Categories', path: '/setup/categories' },
  { key: 'home', label: 'Home', path: '/' },
  { key: 'history', label: 'History', path: '/history' },
  { key: 'not-found', label: '404', path: '/missing-page' },
] as const;

export const WebPreviewNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const accent = useAccent();
  const onAccent = useOnAccent();

  const goTo = (key: (typeof pages)[number]['key']) => {
    if (key === 'home') {
      loadSamplePreviewData();
      router.replace('/');
      return;
    }

    if (key === 'setup-budget') {
      clearPreviewBudget();
      router.replace('/setup/budget');
      return;
    }

    if (key === 'setup-categories') {
      clearPreviewBudget();
      router.replace({
        pathname: '/setup/categories',
        params: { budgetAmount: '2000' },
      });
      return;
    }

    if (key === 'history') {
      loadSamplePreviewData();
      loadSampleHistoryData();
      router.replace('/history');
      return;
    }

    router.replace('/missing-page');
  };

  return (
    <View style={styles.bar}>
      <Text style={styles.title}>Design preview</Text>
      {pages.map((page) => {
        const active =
          (page.key === 'home' && pathname === '/') ||
          (page.key === 'setup-budget' && pathname === '/setup/budget') ||
          (page.key === 'setup-categories' && pathname === '/setup/categories') ||
          (page.key === 'history' && pathname === '/history') ||
          (page.key === 'not-found' && pathname === '/missing-page');

        return (
          <Pressable
            key={page.key}
            style={[styles.button, active && [styles.buttonActive, { backgroundColor: accent, borderColor: accent }]]}
            onPress={() => goTo(page.key)}
          >
            <Text style={[styles.buttonText, active && [styles.buttonTextActive, { color: onAccent }]]}>
              {page.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginRight: Spacing.sm,
  },
  button: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  buttonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  buttonTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
