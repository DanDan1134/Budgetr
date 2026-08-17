import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface BudgetSummaryProps {
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  unallocated: number;
  income?: number;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalBudget,
  totalAllocated,
  totalSpent,
  remaining,
  unallocated,
  income = 0,
}) => {
  const spentPercent =
    totalBudget > 0 ? Math.min(100, Math.max(0, (totalSpent / totalBudget) * 100)) : 0;
  const overspent = remaining < 0;

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Remaining</Text>
      <Text style={[styles.hero, overspent && styles.heroOver]}>
        ${remaining.toFixed(2)}
      </Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${spentPercent}%`,
              backgroundColor: overspent
                ? Colors.error
                : spentPercent > 90
                  ? Colors.warning
                  : Colors.primaryGreen,
            },
          ]}
        />
      </View>
      <Text style={styles.spentLine}>
        Spent ${totalSpent.toFixed(2)} of ${totalBudget.toFixed(2)}
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Allocated</Text>
        <Text style={styles.value}>${totalAllocated.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Unallocated</Text>
        <Text style={[styles.value, unallocated < 0 && { color: Colors.error }]}>
          ${unallocated.toFixed(2)}
        </Text>
      </View>
      {income > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Income</Text>
          <Text style={styles.value}>${income.toFixed(2)}</Text>
        </View>
      )}
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
  kicker: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  hero: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.primaryGreen,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  heroOver: {
    color: Colors.error,
  },
  track: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  spentLine: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
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
});
