import React, { useState, useCallback } from 'react';
import { StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing } from '../constants/theme';
import { ScreenScroll } from '../components/ScreenScroll';
import { BudgetSummary } from '../components/BudgetSummary';
import { CategoryList } from '../components/CategoryList';
import { SpendingForm } from '../components/SpendingForm';
import { SpendingList } from '../components/SpendingList';
import { initDatabase } from '../services/database';
import { getCurrentBudget, Budget } from '../services/budgetService';
import {
  getCategories,
  createCategory,
  deleteCategory,
  Category,
  CategoryInput,
} from '../services/categoryService';
import { getSpendings, createSpending, deleteSpending, Spending } from '../services/spendingService';
import {
  calculateTotalSpent,
  calculateTotalAllocated,
  calculateRemainingBudget,
} from '../utils/calculations';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ period?: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      await initDatabase();
      const currentBudget = await getCurrentBudget();
      
      if (!currentBudget) {
        router.replace('/setup/budget');
        return;
      }

      setBudget(currentBudget);
      const cats = await getCategories();
      setCategories(cats);
      const spends = await getSpendings();
      setSpendings(spends);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [params.period])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddSpending = async (
    categoryId: number,
    amount: number,
    description?: string
  ) => {
    try {
      await createSpending(categoryId, amount, description);
      await loadData();
      
    } catch (error) {
      console.error('Error adding spending:', error);
      Alert.alert('Error', 'Failed to add spending');
    }
  };

  const handleAddCategory = async (input: CategoryInput) => {
    if (!budget) {
      return;
    }

    try {
      await createCategory(budget.id, budget.total_amount, input);
      await loadData();
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
    }
  };

  const handleDeleteSpending = async (id: number) => {
    try {
      await deleteSpending(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting spending:', error);
      Alert.alert('Error', 'Failed to delete spending');
    }
  };

  if (loading || !budget) {
    return null;
  }

  const totalSpent = calculateTotalSpent(spendings);
  const totalAllocated = calculateTotalAllocated(categories);
  const remaining = calculateRemainingBudget(budget.total_amount, totalSpent);

  return (
    <ScreenScroll
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primaryGreen}
        />
      }
    >
      <BudgetSummary
        totalBudget={budget.total_amount}
        totalAllocated={totalAllocated}
        totalSpent={totalSpent}
        remaining={remaining}
      />

      <CategoryList
        categories={categories}
        spendings={spendings}
        budgetTotal={budget.total_amount}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <SpendingForm categories={categories} onAddSpending={handleAddSpending} />

      <SpendingList
        spendings={spendings}
        categories={categories}
        onDeleteSpending={handleDeleteSpending}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
});
