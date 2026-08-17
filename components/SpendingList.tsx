import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { Spending } from '../services/spendingService';
import { Category } from '../services/categoryService';

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
  onDeleteSpending: (id: number) => void;
}

export const SpendingList: React.FC<SpendingListProps> = ({
  spendings,
  categories,
  onDeleteSpending,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');

  useEffect(() => {
    if (selectedCategoryId === 'all') {
      return;
    }
    if (!categories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId('all');
    }
  }, [categories, selectedCategoryId]);

  const filteredSpendings = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return spendings;
    }
    return spendings.filter((spending) => spending.category_id === selectedCategoryId);
  }, [spendings, selectedCategoryId]);

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const renderRightActions = (id: number) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => onDeleteSpending(id)}
      accessibilityRole="button"
      accessibilityLabel="Delete spending"
    >
      <TrashIcon />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Spending }) => (
    <View style={styles.itemWrap}>
      <Swipeable
        overshootRight={false}
        rightThreshold={40}
        activeOffsetX={[-20, 20]}
        failOffsetY={[-12, 12]}
        renderRightActions={() => renderRightActions(item.id)}
      >
        <View style={styles.item}>
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={styles.categoryName}>{getCategoryName(item.category_id)}</Text>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            </View>
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Swipeable>
    </View>
  );

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
            accessibilityLabel="All categories"
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
                accessibilityLabel={category.name}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      {filteredSpendings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {spendings.length === 0 ? 'No spendings yet' : 'No spendings in this category'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSpendings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
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
    marginBottom: Spacing.md,
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
  itemWrap: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  item: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
  },
  itemContent: {
    flex: 1,
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
