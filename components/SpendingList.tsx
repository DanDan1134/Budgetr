import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { Spending } from '../services/spendingService';
import { Category } from '../services/categoryService';
import { dayLabel } from '../utils/calculations';

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

interface SpendingListProps {
  spendings: Spending[];
  categories: Category[];
  onDeleteSpending: (spending: Spending) => void;
  onEditSpending: (spending: Spending) => void;
}

export const SpendingList: React.FC<SpendingListProps> = ({
  spendings,
  categories,
  onDeleteSpending,
  onEditSpending,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (selectedCategoryId === 'all') {
      return;
    }
    if (!categories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId('all');
    }
  }, [categories, selectedCategoryId]);

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const filteredSpendings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return spendings.filter((spending) => {
      const matchesCategory =
        selectedCategoryId === 'all' || spending.category_id === selectedCategoryId;
      const haystack = `${getCategoryName(spending.category_id)} ${spending.description ?? ''}`.toLowerCase();
      const matchesQuery = needle.length === 0 || haystack.includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [spendings, selectedCategoryId, query, categories]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: Spending[] }[] = [];
    for (const spending of filteredSpendings) {
      const label = dayLabel(spending.created_at);
      const existing = groups.find((group) => group.label === label);
      if (existing) {
        existing.items.push(spending);
      } else {
        groups.push({ label, items: [spending] });
      }
    }
    return groups;
  }, [filteredSpendings]);

  const confirmDelete = (spending: Spending) => {
    Alert.alert('Delete spending', 'Remove this spending?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteSpending(spending) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Spendings</Text>
      {categories.length > 0 && (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          <TouchableOpacity
            style={[styles.chip, selectedCategoryId === 'all' && styles.chipActive]}
            onPress={() => setSelectedCategoryId('all')}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategoryId === 'all' }}
          >
            <Text style={[styles.chipText, selectedCategoryId === 'all' && styles.chipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => {
            const active = selectedCategoryId === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategoryId(category.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search spendings"
        placeholderTextColor={Colors.textSecondary}
      />

      {filteredSpendings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {spendings.length === 0 ? 'No spendings yet' : 'No spendings match this filter'}
          </Text>
        </View>
      ) : (
        grouped.map((group) => (
          <View key={group.label}>
            <Text style={styles.dayLabel}>{group.label}</Text>
            {group.items.map((item) => (
              <View key={item.id} style={styles.itemWrap}>
                <Swipeable
                  overshootRight={false}
                  rightThreshold={40}
                  activeOffsetX={[-20, 20]}
                  failOffsetY={[-12, 12]}
                  renderRightActions={() => (
                    <TouchableOpacity
                      style={styles.deleteAction}
                      onPress={() => confirmDelete(item)}
                      accessibilityRole="button"
                      accessibilityLabel="Delete spending"
                    >
                      <TrashIcon />
                    </TouchableOpacity>
                  )}
                >
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => onEditSpending(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemHeader}>
                      <Text style={styles.categoryName}>{getCategoryName(item.category_id)}</Text>
                      <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                    </View>
                    {item.description ? (
                      <Text style={styles.description}>{item.description}</Text>
                    ) : null}
                    <Text style={styles.date}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </Swipeable>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  chipScroll: {
    marginBottom: Spacing.sm,
  },
  chipRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  chipActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  chipTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  search: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dayLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  itemWrap: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  amount: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.primaryGreen,
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
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
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
