import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useAccent } from '../contexts/ThemeContext';

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
  const accent = useAccent();
  const inputRef = useRef<TextInput>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [budgetText, setBudgetText] = useState(totalBudget.toFixed(2));

  useEffect(() => {
    setBudgetText(totalBudget.toFixed(2));
  }, [totalBudget]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const saveBudget = async () => {
    if (!onUpdateBudget) {
      setIsEditing(false);
      return;
    }

    const amount = parseFloat(budgetText);
    if (isNaN(amount) || amount <= 0) {
      setBudgetText(totalBudget.toFixed(2));
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    if (amount !== totalBudget) {
      await onUpdateBudget(amount);
    } else {
      setBudgetText(totalBudget.toFixed(2));
    }

    setIsEditing(false);
  };

  const handleEditPress = () => {
    if (isEditing) {
      return;
    }
    setBudgetText(totalBudget.toFixed(2));
    setIsEditing(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
        {onUpdateBudget ? (
          <TouchableOpacity
            onPress={handleEditPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit total budget"
          >
            <FontAwesome6
              name="pen-to-square"
              size={18}
              solid
              color={isEditing ? accent : Colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Total Budget:</Text>
        {isEditing ? (
          <View style={styles.budgetInputRow}>
            <Text style={styles.value}>$</Text>
            <TextInput
              ref={inputRef}
              style={[styles.budgetInput, { borderBottomColor: accent }]}
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
        <Text style={[styles.remainingValue, { color: remaining < 0 ? Colors.error : accent }]}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
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
