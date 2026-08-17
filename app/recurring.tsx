import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { ScreenScroll } from '../components/ScreenScroll';
import {
  createRecurringItem,
  deleteRecurringItem,
  getRecurringItems,
  RecurringItem,
} from '../services/recurringService';
import { getCategories, Category } from '../services/categoryService';

export default function RecurringScreen() {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    setItems(await getRecurringItems());
    const nextCategories = await getCategories();
    setCategories(nextCategories);
    if (!categoryName && nextCategories[0]) {
      setCategoryName(nextCategories[0].name);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => console.error(error));
    }, [])
  );

  const addItem = async () => {
    const parsed = parseFloat(amount);
    if (!categoryName.trim() || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Error', 'Enter a category and amount');
      return;
    }
    await createRecurringItem(categoryName.trim(), parsed, note || undefined);
    setAmount('');
    setNote('');
    await load();
  };

  return (
    <ScreenScroll style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Recurring bills</Text>
      <Text style={styles.subtitle}>These are added automatically when you start a new period.</Text>

      <TextInput
        style={styles.input}
        value={categoryName}
        onChangeText={setCategoryName}
        placeholder="Category name (must match)"
        placeholderTextColor={Colors.textSecondary}
      />
      {categories.length > 0 && (
        <View style={styles.chipRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.chip, categoryName === category.name && styles.chipActive]}
              onPress={() => setCategoryName(category.name)}
            >
              <Text style={styles.chipText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Note (optional)"
        placeholderTextColor={Colors.textSecondary}
      />
      <TouchableOpacity style={styles.button} onPress={addItem}>
        <Text style={styles.buttonText}>Add recurring</Text>
      </TouchableOpacity>

      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <View>
            <Text style={styles.itemTitle}>{item.category_name}</Text>
            <Text style={styles.itemMeta}>
              ${item.amount.toFixed(2)}
              {item.description ? ` · ${item.description}` : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => deleteRecurringItem(item.id).then(load)}>
            <Text style={styles.delete}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  title: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: 'bold' },
  subtitle: { color: Colors.textSecondary, marginBottom: Spacing.lg, marginTop: Spacing.xs },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  chipActive: { backgroundColor: Colors.primaryGreen, borderColor: Colors.primaryGreen },
  chipText: { color: Colors.textPrimary, fontSize: FontSizes.sm },
  button: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  buttonText: { color: Colors.textPrimary, fontWeight: 'bold' },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: { color: Colors.textPrimary, fontWeight: '600' },
  itemMeta: { color: Colors.textSecondary, marginTop: Spacing.xs },
  delete: { color: Colors.error },
});
