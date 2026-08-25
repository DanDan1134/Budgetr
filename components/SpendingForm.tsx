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
import { useAccent, useOnAccent } from '../contexts/ThemeContext';

interface SpendingFormProps {
  categories: Category[];
  initialSpending?: Spending | null;
  onSaveSpending: (categoryId: number, amount: number, description?: string) => void | Promise<void>;
  onClose?: () => void;
}

export const SpendingForm: React.FC<SpendingFormProps> = ({
  categories,
  initialSpending,
  onSaveSpending,
  onClose,
}) => {
  const accent = useAccent();
  const onAccent = useOnAccent();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialSpending?.category_id ?? (categories.length > 0 ? categories[0].id : null)
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [description, setDescription] = useState(initialSpending?.description ?? '');
  const [amount, setAmount] = useState(
    initialSpending ? String(initialSpending.amount) : ''
  );
  const isEditing = Boolean(initialSpending);

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategory(null);
      return;
    }
    if (!categories.some((category) => category.id === selectedCategory)) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const selectedName =
    categories.find((category) => category.id === selectedCategory)?.name ?? 'Select a category';

  const handleAdd = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    await onSaveSpending(selectedCategory, parsedAmount, description || undefined);
    if (isEditing) {
      onClose?.();
      return;
    }
    setDescription('');
    setAmount('');
  };

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noCategories}>
          No categories available. Please set up your budget first.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spendings</Text>
        {onClose ? (
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Text style={[styles.closeText, { color: accent }]}>Done</Text>
          </TouchableOpacity>
        ) : null}
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
                      isSelected && [styles.modalOptionTextSelected, { color: accent }],
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
        <Text style={styles.label}>Amount ($)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="decimal-pad"
          autoFocus={!isEditing}
        />
      </View>

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

      <TouchableOpacity style={[styles.button, { backgroundColor: accent }]} onPress={handleAdd}>
        <Text style={[styles.buttonText, { color: onAccent }]}>{isEditing ? 'Save spending' : 'Add spending'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeText: {
    color: Colors.primaryGreen,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  pickerButton: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 40,
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
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
  },
  button: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
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
