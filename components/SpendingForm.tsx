import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { Category } from '../services/categoryService';
import { Spending } from '../services/spendingService';
import { calculateCategorySpent } from '../utils/calculations';
import { hapticTap, hapticWarning } from '../utils/haptics';

const QUICK_AMOUNTS = [5, 10, 20, 50];

interface SpendingFormProps {
  categories: Category[];
  spendings: Spending[];
  initialCategoryId?: number | null;
  editing?: Spending | null;
  onSubmit: (categoryId: number, amount: number, description?: string) => void | Promise<void>;
  onClose?: () => void;
}

export const SpendingForm: React.FC<SpendingFormProps> = ({
  categories,
  spendings,
  initialCategoryId,
  editing,
  onSubmit,
  onClose,
}) => {
  const defaultCategory =
    initialCategoryId && categories.some((category) => category.id === initialCategoryId)
      ? initialCategoryId
      : categories[0]?.id ?? null;

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    editing?.category_id ?? defaultCategory
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [description, setDescription] = useState(editing?.description ?? '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');

  useEffect(() => {
    if (editing) {
      setSelectedCategory(editing.category_id);
      setDescription(editing.description ?? '');
      setAmount(String(editing.amount));
      return;
    }
    setSelectedCategory(defaultCategory);
    setDescription('');
    setAmount('');
  }, [editing, defaultCategory]);

  const selectedName =
    categories.find((category) => category.id === selectedCategory)?.name ?? 'Select a category';

  const submitAmount = async (parsedAmount: number) => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const category = categories.find((entry) => entry.id === selectedCategory);
    const alreadySpent = calculateCategorySpent(selectedCategory, spendings);
    const otherAmount = editing && editing.category_id === selectedCategory ? editing.amount : 0;
    const nextSpent = alreadySpent - otherAmount + parsedAmount;

    if (category && nextSpent > category.allocated_amount) {
      await hapticWarning();
      Alert.alert(
        'Over budget',
        `${category.name} would go over by $${(nextSpent - category.allocated_amount).toFixed(2)}. Add anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: () => onSubmit(selectedCategory, parsedAmount, description || undefined),
          },
        ]
      );
      return;
    }

    await hapticTap();
    await onSubmit(selectedCategory, parsedAmount, description || undefined);
  };

  const handleAdd = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    await submitAmount(parsedAmount);
  };

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCategories}>No categories yet. Add one first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{editing ? 'Edit spending' : 'Add spending'}</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setPickerOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.pickerValue}>{selectedName}</Text>
          <Text style={styles.pickerChevron}>▾</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Category</Text>
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setPickerOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What did you buy?"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount ($)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="decimal-pad"
        />
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((value) => (
            <TouchableOpacity
              key={value}
              style={styles.quickChip}
              onPress={() => setAmount(String(value))}
            >
              <Text style={styles.quickText}>${value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>{editing ? 'Save' : 'Add spending'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
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
  closeText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  pickerContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  pickerButton: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    flex: 1,
  },
  pickerChevron: {
    color: Colors.textSecondary,
    fontSize: FontSizes.lg,
    marginLeft: Spacing.sm,
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
  },
  modalTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  modalOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalOptionSelected: {
    backgroundColor: Colors.background,
  },
  modalOptionText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
  },
  modalOptionTextSelected: {
    color: Colors.primaryGreen,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  quickText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  button: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  noCategories: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
});
