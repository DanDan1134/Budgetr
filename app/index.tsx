import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Spacing } from '../constants/theme';
import { BudgetSummary } from '../components/BudgetSummary';
import { CategoryList } from '../components/CategoryList';
import { SpendingForm } from '../components/SpendingForm';
import { SpendingList } from '../components/SpendingList';
import { getCurrentBudget, Budget } from '../services/budgetService';
import { getCategories, Category } from '../services/categoryService';
import { getSpendings, createSpending, deleteSpending, Spending } from '../services/spendingService';
import {
  calculateTotalSpent,
  calculateTotalAllocated,
  calculateRemainingBudget,
} from '../utils/calculations';

export default function HomeScreen() {
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
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
    }, [])
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
      Alert.alert('Success', 'Spending added successfully');
    } catch (error) {
      console.error('Error adding spending:', error);
      Alert.alert('Error', 'Failed to add spending');
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
    <ScrollView
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

      <CategoryList categories={categories} spendings={spendings} />

      <SpendingForm categories={categories} onAddSpending={handleAddSpending} />

      <SpendingList
        spendings={spendings}
        categories={categories}
        onDeleteSpending={handleDeleteSpending}
      />
    </ScrollView>
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
