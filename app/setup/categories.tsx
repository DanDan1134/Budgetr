import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { ScreenScroll } from '../../components/ScreenScroll';
import { AllocationToggle } from '../../components/AllocationToggle';
import { initDatabase } from '../../services/database';
import { createBudget } from '../../services/budgetService';
import { startCurrentPeriod } from '../../services/historyService';
import { createCategories, CategoryInput } from '../../services/categoryService';
import { calculateAllocatedAmount } from '../../utils/calculations';
import { useAccent, useOnAccent } from '../../contexts/ThemeContext';

interface CategoryRow {
  id: string;
  name: string;
  allocationType: 'percentage' | 'dollar';
  allocationValue: string;
}

export default function CategoriesScreen() {
  const accent = useAccent();
  const onAccent = useOnAccent();
  const router = useRouter();
  const params = useLocalSearchParams();
  const parsedBudget = parseFloat(params.budgetAmount as string);
  const budgetAmount = Number.isFinite(parsedBudget) ? parsedBudget : 2000;

  const [categories, setCategories] = useState<CategoryRow[]>([
    { id: '1', name: '', allocationType: 'percentage', allocationValue: '' },
  ]);

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        id: Date.now().toString(),
        name: '',
        allocationType: 'percentage',
        allocationValue: '',
      },
    ]);
  };

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const updateCategory = (id: string, field: keyof CategoryRow, value: any) => {
    setCategories(
      categories.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat))
    );
  };

  const setAllocationType = (id: string, allocationType: CategoryRow['allocationType']) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              allocationType,
              allocationValue: cat.allocationType === allocationType ? cat.allocationValue : '',
            }
          : cat
      )
    );
  };

  const calculateTotalAllocated = (): number => {
    return categories.reduce((total, cat) => {
      const value = parseFloat(cat.allocationValue);
      if (!isNaN(value) && value > 0) {
        return total + calculateAllocatedAmount(budgetAmount, cat.allocationType, value);
      }
      return total;
    }, 0);
  };

  const handleFinish = async () => {
    const validCategories = categories.filter(
      (cat) => cat.name.trim() && cat.allocationValue && parseFloat(cat.allocationValue) > 0
    );

    if (validCategories.length === 0) {
      Alert.alert('Error', 'Please add at least one category with a name and allocation');
      return;
    }

    const totalAllocated = calculateTotalAllocated();
    if (totalAllocated > budgetAmount) {
      Alert.alert(
        'Warning',
        `Total allocated ($${totalAllocated.toFixed(2)}) exceeds budget ($${budgetAmount.toFixed(2)}). Continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => saveBudget(validCategories) },
        ]
      );
      return;
    }

    await saveBudget(validCategories);
  };

  const saveBudget = async (validCategories: CategoryRow[]) => {
    try {
      await initDatabase();
      const budgetId = await createBudget(budgetAmount);

      const categoryInputs: CategoryInput[] = validCategories.map((cat) => ({
        name: cat.name.trim(),
        allocation_type: cat.allocationType,
        allocation_value: parseFloat(cat.allocationValue),
      }));

      await createCategories(budgetId, budgetAmount, categoryInputs);
      await startCurrentPeriod();

      router.replace('/');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    }
  };

  const totalAllocated = calculateTotalAllocated();
  const remaining = budgetAmount - totalAllocated;

  return (
    <ScreenScroll style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Assign Categories</Text>
        <Text style={styles.subtitle}>
          Budget: ${budgetAmount.toFixed(2)}
        </Text>

        {categories.map((category, index) => (
          <View key={category.id} style={styles.categoryRow}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryLabel}>Category {index + 1}</Text>
              {categories.length > 1 && (
                <TouchableOpacity onPress={() => removeCategory(category.id)}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.input}
              value={category.name}
              onChangeText={(text) => updateCategory(category.id, 'name', text)}
              placeholder="Category name (e.g., Food, Gas)"
              placeholderTextColor={Colors.textSecondary}
            />

            <View style={styles.allocationRow}>
              <AllocationToggle
                value={category.allocationType}
                onChange={(type) => setAllocationType(category.id, type)}
              />

              <TextInput
                style={[styles.input, styles.allocationInput]}
                value={category.allocationValue}
                onChangeText={(text) => updateCategory(category.id, 'allocationValue', text)}
                placeholder="Amount"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {category.allocationValue && parseFloat(category.allocationValue) > 0 && (
              <Text style={[styles.allocatedText, { color: accent }]}>
                Allocated: $
                {calculateAllocatedAmount(
                  budgetAmount,
                  category.allocationType,
                  parseFloat(category.allocationValue)
                ).toFixed(2)}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity style={[styles.addButton, { borderColor: accent }]} onPress={addCategory}>
          <Text style={[styles.addButtonText, { color: accent }]}>+ Add Category</Text>
        </TouchableOpacity>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Budget:</Text>
            <Text style={styles.summaryValue}>${budgetAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Allocated:</Text>
            <Text style={styles.summaryValue}>${totalAllocated.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.remainingRow]}>
            <Text style={styles.remainingLabel}>Remaining:</Text>
            <Text
              style={[
                styles.remainingValue,
                { color: remaining < 0 ? Colors.error : accent },
              ]}
            >
              ${remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.finishButton, { backgroundColor: accent }]} onPress={handleFinish}>
          <Text style={[styles.finishButtonText, { color: onAccent }]}>Finish Setup</Text>
        </TouchableOpacity>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  categoryRow: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  removeButton: {
    color: Colors.error,
    fontSize: FontSizes.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 50,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  allocationInput: {
    flex: 1,
  },
  allocatedText: {
    fontSize: FontSizes.sm,
    color: Colors.primaryGreen,
    marginTop: Spacing.xs,
  },
  addButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    borderStyle: 'dashed',
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addButtonText: {
    color: Colors.primaryGreen,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
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
  finishButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  finishButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
});
