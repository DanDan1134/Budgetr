import { getDatabase } from './database';
import { getCategories } from './categoryService';
import { createSpending } from './spendingService';

export interface RecurringItem {
  id: number;
  category_name: string;
  amount: number;
  description: string | null;
}

export const getRecurringItems = async (): Promise<RecurringItem[]> => {
  const db = getDatabase();
  return db.getAllAsync<RecurringItem>('SELECT * FROM recurring ORDER BY category_name ASC');
};

export const createRecurringItem = async (
  categoryName: string,
  amount: number,
  description?: string
): Promise<number> => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO recurring (category_name, amount, description) VALUES (?, ?, ?)',
    [categoryName, amount, description || null]
  );
  return result.lastInsertRowId;
};

export const deleteRecurringItem = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM recurring WHERE id = ?', [id]);
};

export const applyRecurringSpendings = async (): Promise<number> => {
  const items = await getRecurringItems();
  if (items.length === 0) {
    return 0;
  }

  const categories = await getCategories();
  let applied = 0;

  for (const item of items) {
    const category = categories.find(
      (entry) => entry.name.toLowerCase() === item.category_name.toLowerCase()
    );
    if (!category) {
      continue;
    }
    await createSpending(category.id, item.amount, item.description || 'Recurring');
    applied += 1;
  }

  return applied;
};
