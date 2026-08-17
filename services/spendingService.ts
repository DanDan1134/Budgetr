import { getDatabase } from './database';

export interface Spending {
  id: number;
  category_id: number;
  description: string | null;
  amount: number;
  created_at: string;
}

export const createSpending = async (
  categoryId: number,
  amount: number,
  description?: string
): Promise<number> => {
  const db = getDatabase();
  
  const result = await db.runAsync(
    'INSERT INTO spendings (category_id, description, amount) VALUES (?, ?, ?)',
    [categoryId, description || null, amount]
  );
  
  return result.lastInsertRowId;
};

export const getSpendings = async (): Promise<Spending[]> => {
  const db = getDatabase();
  
  const result = await db.getAllAsync<Spending>(
    'SELECT * FROM spendings ORDER BY created_at DESC'
  );
  
  return result;
};

export const deleteSpending = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM spendings WHERE id = ?', [id]);
};

export const updateSpending = async (
  id: number,
  categoryId: number,
  amount: number,
  description?: string
): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE spendings SET category_id = ?, amount = ?, description = ? WHERE id = ?',
    [categoryId, amount, description || null, id]
  );
};

export const restoreSpending = async (spending: Spending): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO spendings (id, category_id, description, amount, created_at) VALUES (?, ?, ?, ?, ?)',
    [spending.id, spending.category_id, spending.description, spending.amount, spending.created_at]
  );
};

export const deleteAllSpendings = async (): Promise<void> => {
  const db = getDatabase();
  await db.execAsync('DELETE FROM spendings;');
};
