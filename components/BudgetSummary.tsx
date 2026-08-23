import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface BudgetSummaryProps {
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  onUpdateBudget?: (amount: number) => Promise<void> | void;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalBudget,
  totalAllocated,
  totalSpent,
  remaining,
  onUpdateBudget,
}) => {
  const [budgetText, setBudgetText] = useState(totalBudget.toFixed(2));

  useEffect(() => {
    setBudgetText(totalBudget.toFixed(2));
  }, [totalBudget]);

  const saveBudget = async () => {
    if (!onUpdateBudget) {
      return;
    }

    const amount = parseFloat(budgetText);
    if (isNaN(amount) || amount <= 0) {
      setBudgetText(totalBudget.toFixed(2));
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    if (amount === totalBudget) {
      setBudgetText(totalBudget.toFixed(2));
      return;
    }

    await onUpdateBudget(amount);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Overview</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Total Budget:</Text>
        {onUpdateBudget ? (
          <View style={styles.budgetInputRow}>
            <Text style={styles.value}>$</Text>
            <TextInput
              style={styles.budgetInput}
              value={budgetText}
              onChangeText={setBudgetText}
              onBlur={saveBudget}
              onSubmitEditing={saveBudget}
              keyboardType="decimal-pad"
              returnKeyType="done"
              selectTextOnFocus
              accessibilityLabel="Edit total budget"
            />
          </View>
        ) : (
          <Text style={styles.value}>${totalBudget.toFixed(2)}</Text>
        )}
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
    alignItems: 'center',
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
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetInput: {
    minWidth: 88,
    padding: 0,
    margin: 0,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryGreen,
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
