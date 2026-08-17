import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  RefreshControl,
  Alert,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { ScreenScroll } from '../components/ScreenScroll';
import { BudgetSummary } from '../components/BudgetSummary';
import { CategoryList } from '../components/CategoryList';
import { SpendingForm } from '../components/SpendingForm';
import { SpendingList } from '../components/SpendingList';
import { GoalsCard } from '../components/GoalsCard';
import { initDatabase } from '../services/database';
import { getCurrentBudget, Budget } from '../services/budgetService';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
  CategoryInput,
} from '../services/categoryService';
import {
  getSpendings,
  createSpending,
  updateSpending,
  deleteSpending,
  restoreSpending,
  Spending,
} from '../services/spendingService';
import { getGoals, Goal } from '../services/goalService';
import { getIncome, getLastCategoryId, setLastCategoryId } from '../services/settingsService';
import {
  calculateTotalSpent,
  calculateTotalAllocated,
  calculateRemainingBudget,
  calculateUnallocated,
} from '../utils/calculations';
import { hapticSuccess } from '../utils/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ period?: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [income, setIncomeState] = useState(0);
  const [lastCategoryId, setLastCategory] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Spending | null>(null);
  const [undo, setUndo] = useState<Spending | null>(null);

  const loadData = async () => {
    try {
      await initDatabase();
      const currentBudget = await getCurrentBudget();

      if (!currentBudget) {
        router.replace('/setup/budget');
        return;
      }

      setBudget(currentBudget);
      setCategories(await getCategories());
      setSpendings(await getSpendings());
      setGoals(await getGoals());
      setIncomeState(await getIncome());
      setLastCategory(await getLastCategoryId());
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

  useEffect(() => {
    if (!undo) {
      return;
    }
    const timer = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(timer);
  }, [undo]);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmitSpending = async (
    categoryId: number,
    amount: number,
    description?: string
  ) => {
    try {
      if (editing) {
        await updateSpending(editing.id, categoryId, amount, description);
      } else {
        await createSpending(categoryId, amount, description);
      }
      await setLastCategoryId(categoryId);
      await hapticSuccess();
      closeForm();
      await loadData();
    } catch (error) {
      console.error('Error saving spending:', error);
      Alert.alert('Error', 'Failed to save spending');
    }
  };

  const handleDeleteSpending = async (spending: Spending) => {
    try {
      await deleteSpending(spending.id);
      setUndo(spending);
      await loadData();
    } catch (error) {
      console.error('Error deleting spending:', error);
      Alert.alert('Error', 'Failed to delete spending');
    }
  };

  const handleUndo = async () => {
    if (!undo) {
      return;
    }
    try {
      await restoreSpending(undo);
      setUndo(null);
      await loadData();
    } catch (error) {
      console.error('Error restoring spending:', error);
    }
  };

  const handleAddCategory = async (input: CategoryInput) => {
    if (!budget) {
      return;
    }
    await createCategory(budget.id, budget.total_amount, input);
    await loadData();
  };

  const handleUpdateCategory = async (id: number, input: CategoryInput) => {
    if (!budget) {
      return;
    }
    await updateCategory(id, budget.total_amount, input);
    await loadData();
  };

  const handleDeleteCategory = async (id: number) => {
    Alert.alert('Delete category', 'This also deletes spendings in this category.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCategory(id);
          await loadData();
        },
      },
    ]);
  };

  if (loading || !budget) {
    return null;
  }

  const totalSpent = calculateTotalSpent(spendings);
  const totalAllocated = calculateTotalAllocated(categories);
  const remaining = calculateRemainingBudget(budget.total_amount, totalSpent);
  const unallocated = calculateUnallocated(budget.total_amount, totalAllocated);

  return (
    <View style={styles.page}>
      <ScreenScroll
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={Colors.primaryGreen}
          />
        }
      >
        {categories.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No budget yet</Text>
            <Text style={styles.emptyText}>Set a budget and categories to start tracking.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.replace('/setup/budget')}>
              <Text style={styles.emptyButtonText}>Start setup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <BudgetSummary
              totalBudget={budget.total_amount}
              totalAllocated={totalAllocated}
              totalSpent={totalSpent}
              remaining={remaining}
              unallocated={unallocated}
              income={income}
            />
            <GoalsCard goals={goals} remaining={remaining} />
            <CategoryList
              categories={categories}
              spendings={spendings}
              budgetTotal={budget.total_amount}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
            <SpendingList
              spendings={spendings}
              categories={categories}
              onDeleteSpending={handleDeleteSpending}
              onEditSpending={(spending) => {
                setEditing(spending);
                setFormOpen(true);
              }}
            />
          </>
        )}
      </ScreenScroll>

      {categories.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Add spending"
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <Modal visible={formOpen} transparent animationType="fade" onRequestClose={closeForm}>
        <Pressable style={styles.modalOverlay} onPress={closeForm}>
          <Pressable onPress={() => undefined}>
            <SpendingForm
              categories={categories}
              spendings={spendings}
              initialCategoryId={lastCategoryId}
              editing={editing}
              onSubmit={handleSubmitSpending}
              onClose={closeForm}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {undo && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>Spending deleted</Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.undoAction}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: Colors.textPrimary,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  undoBar: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: 88,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  undoText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
  },
  undoAction: {
    color: Colors.primaryGreen,
    fontWeight: 'bold',
    fontSize: FontSizes.md,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  emptyButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
});
