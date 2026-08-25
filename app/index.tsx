import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  RefreshControl,
  Alert,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import {
  KeyboardProvider,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { ScreenScroll } from "../components/ScreenScroll";
import { BudgetSummary } from "../components/BudgetSummary";
import { CategoryList } from "../components/CategoryList";
import { SpendingForm } from "../components/SpendingForm";
import { SpendingList } from "../components/SpendingList";
import { initDatabase } from "../services/database";
import {
  getCurrentBudget,
  updateBudget,
  Budget,
} from "../services/budgetService";
import {
  getCategories,
  createCategory,
  deleteCategory,
  Category,
  CategoryInput,
} from "../services/categoryService";
import {
  getSpendings,
  createSpending,
  updateSpending,
  deleteSpending,
  Spending,
} from "../services/spendingService";
import {
  calculateTotalSpent,
  calculateTotalAllocated,
  calculateRemainingBudget,
} from "../utils/calculations";
import { currentMonthKey, isInMonth } from "../utils/monthlyHistory";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ period?: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSpending, setEditingSpending] = useState<Spending | null>(null);

  const loadData = async () => {
    try {
      await initDatabase();
      const currentBudget = await getCurrentBudget();

      if (!currentBudget) {
        router.replace("/setup/budget");
        return;
      }

      setBudget(currentBudget);
      const cats = await getCategories();
      setCategories(cats);
      const spends = await getSpendings();
      setSpendings(spends);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [params.period]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingSpending(null);
  };

  const handleSaveSpending = async (
    categoryId: number,
    amount: number,
    description?: string,
  ) => {
    try {
      if (editingSpending) {
        await updateSpending(
          editingSpending.id,
          categoryId,
          amount,
          description,
        );
      } else {
        await createSpending(categoryId, amount, description);
      }
      await loadData();
    } catch (error) {
      console.error("Error saving spending:", error);
      Alert.alert("Error", "Failed to save spending");
    }
  };

  const handleEditSpending = (spending: Spending) => {
    setEditingSpending(spending);
    setFormOpen(true);
  };

  const handleAddCategory = async (input: CategoryInput) => {
    if (!budget) {
      return;
    }

    try {
      await createCategory(budget.id, budget.total_amount, input);
      await loadData();
    } catch (error) {
      console.error("Error adding category:", error);
      Alert.alert("Error", "Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      Alert.alert("Error", "Failed to delete category");
    }
  };

  const handleDeleteSpending = async (id: number) => {
    try {
      await deleteSpending(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting spending:", error);
      Alert.alert("Error", "Failed to delete spending");
    }
  };

  const handleUpdateBudget = async (amount: number) => {
    if (!budget) {
      return;
    }

    try {
      await updateBudget(budget.id, amount);
      await loadData();
    } catch (error) {
      console.error("Error updating budget:", error);
      Alert.alert("Error", "Failed to update budget");
    }
  };

  if (loading || !budget) {
    return null;
  }

  const monthSpendings = spendings.filter((spending) =>
    isInMonth(spending.created_at, currentMonthKey()),
  );
  const totalSpent = calculateTotalSpent(monthSpendings);
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
          onUpdateBudget={handleUpdateBudget}
        />

        <CategoryList
          categories={categories}
          spendings={monthSpendings}
          budgetTotal={budget.total_amount}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />

        <SpendingList
          spendings={monthSpendings}
          categories={categories}
          onDeleteSpending={handleDeleteSpending}
          onEditSpending={handleEditSpending}
        />
      </ScreenScroll>

      {categories.length > 0 && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => {
            setEditingSpending(null);
            setFormOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Open spendings"
          activeOpacity={0.85}
        >
          <View style={styles.plusIcon}>
            <View style={styles.plusBarHorizontal} />
            <View style={styles.plusBarVertical} />
          </View>
        </TouchableOpacity>
      )}

      <Modal
        visible={formOpen}
        transparent
        animationType="fade"
        onRequestClose={closeForm}
      >
        <KeyboardProvider>
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={closeForm} />
            {Platform.OS === "web" ? (
              <View style={styles.sheet}>
                <SpendingForm
                  key={editingSpending?.id ?? "new"}
                  categories={categories}
                  initialSpending={editingSpending}
                  onSaveSpending={handleSaveSpending}
                  onClose={closeForm}
                />
              </View>
            ) : (
              <KeyboardStickyView
                offset={{ closed: 8, opened: 8 }}
                style={styles.stickySheet}
              >
                <View style={styles.sheet}>
                  <SpendingForm
                    key={editingSpending?.id ?? "new"}
                    categories={categories}
                    initialSpending={editingSpending}
                    onSaveSpending={handleSaveSpending}
                    onClose={closeForm}
                  />
                </View>
              </KeyboardStickyView>
            )}
          </View>
        </KeyboardProvider>
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
    position: "absolute",
    alignSelf: "center",
    bottom: Spacing.lg,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  plusBarHorizontal: {
    position: "absolute",
    width: 22,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textPrimary,
  },
  plusBarVertical: {
    position: "absolute",
    width: 3,
    height: 22,
    borderRadius: 1.5,
    backgroundColor: Colors.textPrimary,
  },
  modalRoot: {
    flex: 1,
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.OS === "web" ? Spacing.lg : 0,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  stickySheet: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: BorderRadius.lg,
  },
});
