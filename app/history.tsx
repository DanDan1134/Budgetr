import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { ScreenScroll } from '../components/ScreenScroll';
import {
  deleteHistoryPeriod,
  getHistoryPeriodDetail,
  getHistoryPeriods,
  type HistoryPeriod,
  type HistoryPeriodDetail,
} from '../services/historyService';

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

const formatMoney = (value: number) => `$${value.toFixed(2)}`;

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const formatRange = (start: string, end: string) =>
  `${formatDate(start)} - ${formatDate(end)}`;

export default function HistoryScreen() {
  const [periods, setPeriods] = useState<HistoryPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<HistoryPeriodDetail | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadPeriods = async () => {
    const nextPeriods = await getHistoryPeriods();
    setPeriods(nextPeriods);
  };

  useFocusEffect(
    useCallback(() => {
      loadPeriods().catch((error) => {
        console.error('Failed to load history:', error);
      });
    }, [])
  );

  const openPeriod = async (periodId: number) => {
    const detail = await getHistoryPeriodDetail(periodId);
    setSelectedPeriod(detail);
    setCategoryFilter('All');
    setDateFilter('All');
  };

  const handleDeletePeriod = async (periodId: number) => {
    try {
      await deleteHistoryPeriod(periodId);
      if (selectedPeriod?.id === periodId) {
        setSelectedPeriod(null);
      }
      await loadPeriods();
    } catch (error) {
      console.error('Error deleting history period:', error);
      Alert.alert('Error', 'Failed to delete history period');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedPeriod) {
        await openPeriod(selectedPeriod.id);
      } else {
        await loadPeriods();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const categoryOptions = useMemo(() => {
    if (!selectedPeriod) {
      return ['All'];
    }
    const names = selectedPeriod.categories.map((category) => category.name);
    return ['All', ...Array.from(new Set(names))];
  }, [selectedPeriod]);

  const dateOptions = useMemo(() => {
    if (!selectedPeriod) {
      return ['All'];
    }
    const dates = selectedPeriod.spendings.map((spending) => formatDate(spending.spent_at));
    return ['All', ...Array.from(new Set(dates))];
  }, [selectedPeriod]);

  const filteredSpendings = useMemo(() => {
    if (!selectedPeriod) {
      return [];
    }

    return selectedPeriod.spendings.filter((spending) => {
      const matchesCategory =
        categoryFilter === 'All' || spending.category_name === categoryFilter;
      const matchesDate = dateFilter === 'All' || formatDate(spending.spent_at) === dateFilter;
      return matchesCategory && matchesDate;
    });
  }, [selectedPeriod, categoryFilter, dateFilter]);

  const filteredTotal = filteredSpendings.reduce((sum, spending) => sum + spending.amount, 0);
  const topCategory = selectedPeriod?.categories[0];
  const overspent = selectedPeriod
    ? Math.max(0, selectedPeriod.total_spent - selectedPeriod.total_budget)
    : 0;
  const averageSpending =
    selectedPeriod && selectedPeriod.spending_count > 0
      ? selectedPeriod.total_spent / selectedPeriod.spending_count
      : 0;

  if (selectedPeriod) {
    return (
      <ScreenScroll
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryGreen} />
        }
      >
        <TouchableOpacity onPress={() => setSelectedPeriod(null)} hitSlop={8}>
          <Text style={styles.backText}>Back to history</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{formatRange(selectedPeriod.started_at, selectedPeriod.closed_at)}</Text>
        <Text style={styles.subtitle}>Closed period</Text>

        <View style={styles.card}>
          <StatRow label="Budget" value={formatMoney(selectedPeriod.total_budget)} />
          <StatRow label="Used" value={formatMoney(selectedPeriod.total_spent)} valueColor={Colors.warning} />
          <StatRow label="Saved" value={formatMoney(selectedPeriod.total_saved)} valueColor={Colors.primaryGreen} />
          {overspent > 0 && (
            <StatRow label="Overspent" value={formatMoney(overspent)} valueColor={Colors.error} />
          )}
          <StatRow label="Allocated" value={formatMoney(selectedPeriod.total_allocated)} />
          <StatRow label="Spendings" value={`${selectedPeriod.spending_count}`} />
          <StatRow label="Average spending" value={formatMoney(averageSpending)} />
          {topCategory && (
            <StatRow
              label="Top category"
              value={`${topCategory.name} (${formatMoney(topCategory.spent_amount)})`}
            />
          )}
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        {selectedPeriod.categories.map((category) => (
          <View key={category.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{category.name}</Text>
              <Text style={styles.itemValue}>
                {formatMoney(category.spent_amount)} / {formatMoney(category.allocated_amount)}
              </Text>
            </View>
            <Text style={styles.itemMeta}>
              Saved {formatMoney(Math.max(0, category.allocated_amount - category.spent_amount))}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Spendings</Text>
        <FilterRow
          label="Category"
          options={categoryOptions}
          selected={categoryFilter}
          onSelect={setCategoryFilter}
        />
        <FilterRow label="Date" options={dateOptions} selected={dateFilter} onSelect={setDateFilter} />

        <Text style={styles.filterSummary}>
          Showing {filteredSpendings.length} of {selectedPeriod.spendings.length} spendings
          {filteredSpendings.length > 0 ? ` (${formatMoney(filteredTotal)})` : ''}
        </Text>

        {filteredSpendings.length === 0 ? (
          <Text style={styles.emptyText}>No spendings match these filters</Text>
        ) : (
          filteredSpendings.map((spending) => (
            <View key={spending.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{spending.category_name}</Text>
                <Text style={[styles.itemValue, { color: Colors.primaryGreen }]}>
                  {formatMoney(spending.amount)}
                </Text>
              </View>
              {spending.description ? (
                <Text style={styles.itemMeta}>{spending.description}</Text>
              ) : null}
              <Text style={styles.itemMeta}>{formatDate(spending.spent_at)}</Text>
            </View>
          ))
        )}
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryGreen} />
      }
    >
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Closed budgeting periods</Text>

      {periods.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No closed periods yet</Text>
          <Text style={styles.emptyHint}>Use New Period to save this month to history</Text>
        </View>
      ) : (
        periods.map((period) => (
          <View key={period.id} style={styles.periodWrap}>
            <Swipeable
              overshootRight={false}
              rightThreshold={40}
              activeOffsetX={[-20, 20]}
              failOffsetY={[-12, 12]}
              renderRightActions={() => (
                <TouchableOpacity
                  style={styles.deleteAction}
                  onPress={() => handleDeletePeriod(period.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete history period"
                >
                  <TrashIcon />
                </TouchableOpacity>
              )}
            >
              <TouchableOpacity
                style={styles.periodCard}
                onPress={() => openPeriod(period.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.periodTitle}>{formatRange(period.started_at, period.closed_at)}</Text>
                <View style={styles.periodStats}>
                  <PeriodStat label="Budget" value={formatMoney(period.total_budget)} />
                  <PeriodStat label="Used" value={formatMoney(period.total_spent)} />
                  <PeriodStat label="Saved" value={formatMoney(period.total_saved)} highlight />
                </View>
                <Text style={styles.itemMeta}>
                  {period.spending_count} spendings in {period.category_count} categories
                </Text>
              </TouchableOpacity>
            </Swipeable>
          </View>
        ))
      )}
    </ScreenScroll>
  );
}

const StatRow = ({
  label,
  value,
  valueColor = Colors.textPrimary,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
  </View>
);

const PeriodStat = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.periodStat}>
    <Text style={styles.periodStatLabel}>{label}</Text>
    <Text style={[styles.periodStatValue, highlight && { color: Colors.primaryGreen }]}>{value}</Text>
  </View>
);

const FilterRow = ({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) => (
  <View style={styles.filterBlock}>
    <Text style={styles.filterLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map((option) => {
        const active = option === selected;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  backText: {
    color: Colors.primaryGreen,
    fontSize: FontSizes.md,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: Spacing.md,
  },
  periodWrap: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  periodCard: {
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
  periodTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  periodStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  periodStat: {
    flex: 1,
  },
  periodStatLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  periodStatValue: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemValue: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  itemMeta: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  filterBlock: {
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  chipRow: {
    gap: Spacing.sm,
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
  filterSummary: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  emptyHint: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
