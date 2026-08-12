import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { Category } from '../services/categoryService';
import { Spending } from '../services/spendingService';
import { calculateCategorySpent, calculateCategoryRemaining } from '../utils/calculations';

interface CategoryListProps {
  categories: Category[];
  spendings: Spending[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, spendings }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      {categories.map((category) => {
        const spent = calculateCategorySpent(category.id, spendings);
        const remaining = calculateCategoryRemaining(category.allocated_amount, spent);
        const percentage = (spent / category.allocated_amount) * 100;
        
        return (
          <View key={category.id} style={styles.categoryCard}>
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
                        ? Colors.primaryGreen
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
          </View>
        );
      })}
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
    marginBottom: Spacing.md,
  },
  categoryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
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
});
