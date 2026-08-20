import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  RefreshControl,
  Alert,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
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
  const [formOpen, setFormOpen] = useState(false);

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
    <View style={styles.page}>
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

        <SpendingList
          spendings={spendings}
          categories={categories}
          onDeleteSpending={handleDeleteSpending}
        />
      </ScreenScroll>

      {categories.length > 0 && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => setFormOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open quick spending"
          activeOpacity={0.85}
        >
          <View style={styles.playIcon} />
        </TouchableOpacity>
      )}

      <Modal
        visible={formOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFormOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFormOpen(false)} />
          <View style={styles.sheet}>
            <SpendingForm
              categories={categories}
              onAddSpending={handleAddSpending}
              onClose={() => setFormOpen(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
  },
  playButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: Spacing.lg,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 20,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.textPrimary,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    width: '100%',
  },
});
