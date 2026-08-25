export const SPENDINGS_PAGE_SIZE = 15;

export type MonthSpending = {
  key: string;
  categoryName: string;
  description: string | null;
  amount: number;
  spentAt: string;
};

export type MonthCategoryTotal = {
  name: string;
  spent: number;
};

export type MonthSummary = {
  monthKey: string;
  label: string;
  totalSpent: number;
  spendingCount: number;
  spendings: MonthSpending[];
  categories: MonthCategoryTotal[];
};

export const monthKeyFromDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'unknown';
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const currentMonthKey = (): string => monthKeyFromDate(new Date().toISOString());

export const isInMonth = (iso: string, monthKey: string): boolean =>
  monthKeyFromDate(iso) === monthKey;

export const monthLabelFromKey = (monthKey: string): string => {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) {
    return monthKey;
  }
  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
};

export const buildMonthSummaries = (spendings: MonthSpending[]): MonthSummary[] => {
  const grouped = new Map<string, MonthSpending[]>();

  spendings.forEach((spending) => {
    const monthKey = monthKeyFromDate(spending.spentAt);
    const list = grouped.get(monthKey) ?? [];
    list.push(spending);
    grouped.set(monthKey, list);
  });

  const currentKey = currentMonthKey();
  if (!grouped.has(currentKey)) {
    grouped.set(currentKey, []);
  }

  return [...grouped.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([monthKey, monthSpendings]) => {
      const sorted = [...monthSpendings].sort((a, b) => b.spentAt.localeCompare(a.spentAt));
      const categoryTotals = new Map<string, number>();
      sorted.forEach((spending) => {
        categoryTotals.set(
          spending.categoryName,
          (categoryTotals.get(spending.categoryName) ?? 0) + spending.amount
        );
      });

      return {
        monthKey,
        label: monthLabelFromKey(monthKey),
        totalSpent: sorted.reduce((sum, spending) => sum + spending.amount, 0),
        spendingCount: sorted.length,
        spendings: sorted,
        categories: [...categoryTotals.entries()]
          .map(([name, spent]) => ({ name, spent }))
          .sort((a, b) => b.spent - a.spent),
      };
    });
};
