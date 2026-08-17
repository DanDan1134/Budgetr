import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { Goal } from '../services/goalService';

interface GoalsCardProps {
  goals: Goal[];
  remaining: number;
}

export const GoalsCard: React.FC<GoalsCardProps> = ({ goals, remaining }) => {
  if (goals.length === 0) {
    return null;
  }

  const savedTowardGoals = Math.max(0, remaining);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goals</Text>
      {goals.map((goal) => {
        const progress =
          goal.target_amount > 0
            ? Math.min(100, (savedTowardGoals / goal.target_amount) * 100)
            : 0;
        return (
          <View key={goal.id} style={styles.row}>
            <View style={styles.meta}>
              <Text style={styles.name}>{goal.name}</Text>
              <Text style={styles.target}>
                ${Math.min(savedTowardGoals, goal.target_amount).toFixed(2)} / $
                {goal.target_amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  row: {
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
  },
  target: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  track: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primaryGreen,
  },
});
