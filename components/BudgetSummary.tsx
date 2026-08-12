import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface BudgetSummaryProps {
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalBudget,
  totalAllocated,
  totalSpent,
  remaining,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Overview</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Total Budget:</Text>
        <Text style={styles.value}>${totalBudget.toFixed(2)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Total Allocated:</Text>
        <Text style={styles.value}>${totalAllocated.toFixed(2)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Total Spent:</Text>
        <Text style={[styles.value, { color: Colors.warning }]}>
          ${totalSpent.toFixed(2)}
        </Text>
      </View>
      
      <View style={[styles.row, styles.remainingRow]}>
        <Text style={styles.remainingLabel}>Remaining:</Text>
        <Text style={[styles.remainingValue, remaining < 0 && { color: Colors.error }]}>
          ${remaining.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  remainingRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  remainingLabel: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  remainingValue: {
    fontSize: FontSizes.lg,
    color: Colors.primaryGreen,
    fontWeight: 'bold',
  },
});
