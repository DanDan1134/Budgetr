import { getDatabase } from './database';
import { getCurrentBudget } from './budgetService';
import { getCategories } from './categoryService';
import { deleteAllSpendings, getSpendings } from './spendingService';
import { calculateCategorySpent, calculateTotalAllocated, calculateTotalSpent } from '../utils/calculations';

export interface HistoryPeriod {
  id: number;
  started_at: string;
  closed_at: string;
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  total_saved: number;
  spending_count: number;
  category_count: number;
}

export interface HistoryCategory {
  id: number;
  period_id: number;
  name: string;
  allocated_amount: number;
  spent_amount: number;
}

export interface HistorySpending {
  id: number;
  period_id: number;
  category_name: string;
  description: string | null;
  amount: number;
  spent_at: string;
}

export interface HistoryPeriodDetail extends HistoryPeriod {
  categories: HistoryCategory[];
  spendings: HistorySpending[];
}

export const startCurrentPeriod = async (startedAt = new Date().toISOString()): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO current_period (id, started_at) VALUES (1, ?)',
    [startedAt]
  );
};

const getPeriodStartedAt = async (): Promise<string> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ started_at: string }>(
    'SELECT started_at FROM current_period WHERE id = 1'
  );
  if (row?.started_at) {
    return row.started_at;
  }

  const startedAt = new Date().toISOString();
  await startCurrentPeriod(startedAt);
  return startedAt;
};

export const closeCurrentPeriod = async (): Promise<boolean> => {
  const budget = await getCurrentBudget();
  if (!budget) {
    return false;
  }

  const categories = await getCategories();
  const spendings = await getSpendings();
  const totalSpent = calculateTotalSpent(spendings);
  const totalAllocated = calculateTotalAllocated(categories);
  const totalSaved = Math.max(0, budget.total_amount - totalSpent);
  const startedAt = await getPeriodStartedAt();
  const closedAt = new Date().toISOString();

  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO periods (
      started_at, closed_at, total_budget, total_allocated, total_spent, total_saved, spending_count, category_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      startedAt,
      closedAt,
      budget.total_amount,
      totalAllocated,
      totalSpent,
      totalSaved,
      spendings.length,
      categories.length,
    ]
  );

  const periodId = result.lastInsertRowId;

  for (const category of categories) {
    await db.runAsync(
      `INSERT INTO period_categories (period_id, name, allocated_amount, spent_amount)
       VALUES (?, ?, ?, ?)`,
      [
        periodId,
        category.name,
        category.allocated_amount,
        calculateCategorySpent(category.id, spendings),
      ]
    );
  }

  for (const spending of spendings) {
    const categoryName =
      categories.find((category) => category.id === spending.category_id)?.name ?? 'Unknown';
    await db.runAsync(
      `INSERT INTO period_spendings (period_id, category_name, description, amount, spent_at)
       VALUES (?, ?, ?, ?, ?)`,
      [periodId, categoryName, spending.description, spending.amount, spending.created_at]
    );
  }

  await startCurrentPeriod(closedAt);
  await deleteAllSpendings();
  return true;
};

export const getHistoryPeriods = async (): Promise<HistoryPeriod[]> => {
  const db = getDatabase();
  return db.getAllAsync<HistoryPeriod>('SELECT * FROM periods ORDER BY closed_at DESC');
};

export const deleteHistoryPeriod = async (periodId: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM period_spendings WHERE period_id = ?', [periodId]);
  await db.runAsync('DELETE FROM period_categories WHERE period_id = ?', [periodId]);
  await db.runAsync('DELETE FROM periods WHERE id = ?', [periodId]);
};

export const getHistoryPeriodDetail = async (
  periodId: number
): Promise<HistoryPeriodDetail | null> => {
  const db = getDatabase();
  const period = await db.getFirstAsync<HistoryPeriod>(
    'SELECT * FROM periods WHERE id = ?',
    [periodId]
  );

  if (!period) {
    return null;
  }

  const categories = await db.getAllAsync<HistoryCategory>(
    'SELECT * FROM period_categories WHERE period_id = ? ORDER BY spent_amount DESC',
    [periodId]
  );
  const spendings = await db.getAllAsync<HistorySpending>(
    'SELECT * FROM period_spendings WHERE period_id = ? ORDER BY spent_at DESC',
    [periodId]
  );

  return {
    ...period,
    categories,
    spendings,
  };
};
