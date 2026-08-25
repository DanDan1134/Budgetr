import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useAccent } from '../contexts/ThemeContext';
import { AllocationToggle } from './AllocationToggle';
import { Category, CategoryInput } from '../services/categoryService';
import { Spending } from '../services/spendingService';
import {
  calculateAllocatedAmount,
  calculateCategorySpent,
  calculateCategoryRemaining,
} from '../utils/calculations';

const TrashIcon = () => (
  <View style={styles.trash}>
    <View style={styles.trashLid} />
    <View style={styles.trashBody}>
      <View style={styles.trashLine} />
      <View style={styles.trashLine} />
      <View style={styles.trashLine} />
    </View>
  </View>
);

interface CategoryListProps {
  categories: Category[];
  spendings: Spending[];
  budgetTotal: number;
  onAddCategory: (input: CategoryInput) => Promise<void> | void;
  onUpdateCategory: (id: number, input: CategoryInput) => Promise<void> | void;
  onDeleteCategory: (id: number) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  spendings,
  budgetTotal,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const accent = useAccent();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [allocationType, setAllocationType] = useState<'percentage' | 'dollar'>('percentage');
  const [allocationValue, setAllocationValue] = useState('');

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setAllocationType('percentage');
    setAllocationValue('');
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setAllocationType(category.allocation_type);
    setAllocationValue(String(category.allocation_value));
    setModalOpen(true);
  };

  const handleSave = async () => {
    const parsedValue = parseFloat(allocationValue);
    if (!name.trim()) {
      Alert.alert('Error', 'Enter a category name');
      return;
    }
    if (isNaN(parsedValue) || parsedValue <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }

    const input = {
      name: name.trim(),
      allocation_type: allocationType,
      allocation_value: parsedValue,
    };

    if (editingCategory) {
      await onUpdateCategory(editingCategory.id, input);
    } else {
      await onAddCategory(input);
    }
    closeModal();
  };

  const previewAllocated =
    allocationValue && parseFloat(allocationValue) > 0
      ? calculateAllocatedAmount(budgetTotal, allocationType, parseFloat(allocationValue))
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity
          onPress={openAddModal}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add category"
        >
          <Text style={[styles.addButton, { color: accent }]}>+</Text>
        </TouchableOpacity>
      </View>

      {categories.map((category) => {
        const spent = calculateCategorySpent(category.id, spendings);
        const remaining = calculateCategoryRemaining(category.allocated_amount, spent);
        const percentage =
          category.allocated_amount > 0
            ? (spent / category.allocated_amount) * 100
            : spent > 0
              ? 100
              : 0;

        return (
          <View key={category.id} style={styles.itemWrap}>
            <Swipeable
              overshootRight={false}
              rightThreshold={40}
              activeOffsetX={[-20, 20]}
              failOffsetY={[-12, 12]}
              renderRightActions={() => (
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => onDeleteCategory(category.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete category"
                >
                  <TrashIcon />
                </TouchableOpacity>
              )}
            >
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => openEditModal(category)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${category.name}`}
              >
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryAmount}>
                    ${spent.toFixed(2)} / ${category.allocated_amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor:
                          percentage < 75
                            ? accent
                            : percentage < 90
                            ? Colors.warning
                            : Colors.error,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.remainingText}>
                  Remaining: ${remaining.toFixed(2)}
                </Text>
              </TouchableOpacity>
            </Swipeable>
          </View>
        );
      })}

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{editingCategory ? 'Edit category' : 'Add category'}</Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Category name"
              placeholderTextColor={Colors.textSecondary}
            />

            <View style={styles.allocationRow}>
              <AllocationToggle
                value={allocationType}
                onChange={(type) => {
                  setAllocationType(type);
                  if (type !== allocationType) {
                    setAllocationValue('');
                  }
                }}
              />
              <TextInput
                style={[styles.input, styles.allocationInput]}
                value={allocationValue}
                onChangeText={setAllocationValue}
                placeholder="Amount"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {previewAllocated !== null && (
              <Text style={[styles.allocatedText, { color: accent }]}>
                Allocated: ${previewAllocated.toFixed(2)}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={[styles.saveText, { color: accent }]}>
                  {editingCategory ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addButton: {
    color: Colors.primaryGreen,
    fontSize: FontSizes.xl,
    fontWeight: '300',
    lineHeight: FontSizes.xl,
  },
  itemWrap: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  categoryCard: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
  },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
  },
  trash: {
    alignItems: 'center',
  },
  trashLid: {
    width: 20,
    height: 3,
    borderRadius: 1,
    backgroundColor: Colors.textPrimary,
    marginBottom: 2,
  },
  trashBody: {
    width: 16,
    height: 18,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 3,
  },
  trashLine: {
    width: 2,
    height: 10,
    backgroundColor: Colors.textPrimary,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  categoryAmount: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
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
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  saveText: {
    color: Colors.primaryGreen,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
