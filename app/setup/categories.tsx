import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { createBudget } from '../../services/budgetService';
import { createCategories, CategoryInput } from '../../services/categoryService';
import { calculateAllocatedAmount } from '../../utils/calculations';

interface CategoryRow {
  id: string;
  name: string;
  allocationType: 'percentage' | 'dollar';
  allocationValue: string;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const budgetAmount = parseFloat(params.budgetAmount as string);

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

  const toggleAllocationType = (id: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              allocationType: cat.allocationType === 'percentage' ? 'dollar' : 'percentage',
              allocationValue: '',
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
      const budgetId = await createBudget(budgetAmount);

      const categoryInputs: CategoryInput[] = validCategories.map((cat) => ({
        name: cat.name.trim(),
        allocation_type: cat.allocationType,
        allocation_value: parseFloat(cat.allocationValue),
      }));

      await createCategories(budgetId, budgetAmount, categoryInputs);

      router.replace('/');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    }
  };

  const totalAllocated = calculateTotalAllocated();
  const remaining = budgetAmount - totalAllocated;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
              <TouchableOpacity
                style={styles.typeToggle}
                onPress={() => toggleAllocationType(category.id)}
              >
                <Text style={styles.typeToggleText}>
                  {category.allocationType === 'percentage' ? '%' : '$'}
                </Text>
              </TouchableOpacity>

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
              <Text style={styles.allocatedText}>
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

        <TouchableOpacity style={styles.addButton} onPress={addCategory}>
          <Text style={styles.addButtonText}>+ Add Category</Text>
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
                remaining < 0 && { color: Colors.error },
              ]}
            >
              ${remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish Setup</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
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
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    marginBottom: Spacing.sm,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeToggle: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.md,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  typeToggleText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
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
