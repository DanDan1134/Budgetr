import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { ScreenScroll } from '../components/ScreenScroll';
import { PageNumbers } from '../components/PageNumbers';
import { getCurrentBudget } from '../services/budgetService';
import { getMonthlyHistory, type MonthSummary } from '../services/historyService';
import { SPENDINGS_PAGE_SIZE } from '../utils/monthlyHistory';
import { useAccent, useOnAccent } from '../contexts/ThemeContext';

const formatMoney = (value: number) => `$${value.toFixed(2)}`;

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export default function HistoryScreen() {
  const accent = useAccent();
  const onAccent = useOnAccent();
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [openMonthKey, setOpenMonthKey] = useState<string | null>(null);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [spendingPage, setSpendingPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    const [nextMonths, budget] = await Promise.all([getMonthlyHistory(), getCurrentBudget()]);
    setMonths(nextMonths);
    setBudgetTotal(budget?.total_amount ?? 0);
    setOpenMonthKey((current) => {
      if (current && nextMonths.some((month) => month.monthKey === current)) {
        return current;
      }
      return null;
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory().catch((error) => {
        console.error('Failed to load history:', error);
      });
    }, [])
  );

  const openMonth = months.find((month) => month.monthKey === openMonthKey) ?? null;
  const remaining = openMonth ? budgetTotal - openMonth.totalSpent : 0;
  const topCategory = openMonth?.categories[0] ?? null;

  const filteredSpendings = useMemo(() => {
    if (!openMonth) {
      return [];
    }
    if (categoryFilter === 'All') {
      return openMonth.spendings;
    }
    return openMonth.spendings.filter((spending) => spending.categoryName === categoryFilter);
  }, [openMonth, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredSpendings.length / SPENDINGS_PAGE_SIZE));
  const safePage = Math.min(spendingPage, pageCount);
  const pagedSpendings = filteredSpendings.slice(
    (safePage - 1) * SPENDINGS_PAGE_SIZE,
    safePage * SPENDINGS_PAGE_SIZE
  );

  const toggleMonth = (monthKey: string) => {
    setOpenMonthKey((current) => (current === monthKey ? null : monthKey));
    setCategoryFilter('All');
    setSpendingPage(1);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHistory();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenScroll
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
      }
    >
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Monthly summaries</Text>

      {months.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No monthly history yet</Text>
        </View>
      ) : (
        months.map((month) => {
          const isOpen = month.monthKey === openMonthKey;
          return (
            <View key={month.monthKey} style={styles.monthCard}>
              <TouchableOpacity
                onPress={() => toggleMonth(month.monthKey)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                accessibilityLabel={`${month.label}. ${month.spendingCount} spendings`}
              >
                <View style={styles.monthHeader}>
                  <View style={styles.monthHeaderText}>
                    <Text style={styles.monthTitle}>{month.label}</Text>
                    <Text style={styles.monthMeta}>
                      {formatMoney(month.totalSpent)} · {month.spendingCount} spendings
                    </Text>
                  </View>
                  <Text style={styles.chevron}>{isOpen ? '▾' : '▸'}</Text>
                </View>
              </TouchableOpacity>

              {isOpen ? (
                <View style={styles.monthBody}>
                  <StatRow label="Budget" value={formatMoney(budgetTotal)} />
                  <StatRow label="Spent" value={formatMoney(month.totalSpent)} valueColor={Colors.warning} />
                  <StatRow
                    label="Remaining"
                    value={formatMoney(remaining)}
                    valueColor={remaining < 0 ? Colors.error : accent}
                  />
                  <StatRow label="Spendings" value={`${month.spendingCount}`} />
                  <StatRow
                    label="Most spent"
                    value={
                      topCategory
                        ? `${topCategory.name} ${formatMoney(topCategory.spent)}`
                        : 'None'
                    }
                  />

                  <Text style={styles.sectionTitle}>Spendings</Text>
                  {month.spendings.length === 0 ? (
                    <Text style={styles.emptyText}>No spendings this month</Text>
                  ) : (
                    <>
                      <ScrollView
                        horizontal
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipRow}
                        style={styles.chipScroll}
                      >
                        {['All', ...month.categories.map((category) => category.name)].map((name) => {
                          const active = categoryFilter === name;
                          return (
                            <TouchableOpacity
                              key={name}
                              style={[styles.chip, active && [styles.chipActive, { backgroundColor: accent, borderColor: accent }]]}
                              onPress={() => {
                                setCategoryFilter(name);
                                setSpendingPage(1);
                              }}
                              accessibilityRole="button"
                              accessibilityState={{ selected: active }}
                            >
                              <Text style={[styles.chipText, active && [styles.chipTextActive, { color: onAccent }]]}>
                                {name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>

                      {filteredSpendings.length === 0 ? (
                        <Text style={styles.emptyText}>No spendings in this category</Text>
                      ) : (
                        <>
                          {pagedSpendings.map((spending) => (
                            <View key={spending.key} style={styles.itemCard}>
                              <View style={styles.itemHeader}>
                                <Text style={styles.itemTitle}>{spending.categoryName}</Text>
                                <Text style={[styles.itemValue, { color: accent }]}>
                                  {formatMoney(spending.amount)}
                                </Text>
                              </View>
                              {spending.description ? (
                                <Text style={styles.itemMeta}>{spending.description}</Text>
                              ) : null}
                              <Text style={styles.itemMeta}>{formatDate(spending.spentAt)}</Text>
                            </View>
                          ))}
                          <PageNumbers page={safePage} pageCount={pageCount} onChange={setSpendingPage} />
                        </>
                      )}
                    </>
                  )}
                </View>
              ) : null}
            </View>
          );
        })
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  monthCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  monthHeaderText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  monthTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  monthMeta: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  chevron: {
    color: Colors.textSecondary,
    fontSize: FontSizes.lg,
  },
  monthBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
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
  itemCard: {
    backgroundColor: Colors.background,
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
    marginBottom: Spacing.sm,
  },
});
