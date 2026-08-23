import { getDatabase } from './database';
import { calculateAllocatedAmount } from '../utils/calculations';

export interface Budget {
  id: number;
  total_amount: number;
  created_at: string;
}

export const createBudget = async (totalAmount: number): Promise<number> => {
  const db = getDatabase();
  
  await db.execAsync('DELETE FROM budget;');
  
  const result = await db.runAsync(
    'INSERT INTO budget (total_amount) VALUES (?)',
    [totalAmount]
  );
  
  return result.lastInsertRowId;
};

export const getCurrentBudget = async (): Promise<Budget | null> => {
  const db = getDatabase();
  
  const result = await db.getFirstAsync<Budget>(
    'SELECT * FROM budget ORDER BY created_at DESC LIMIT 1'
  );
  
  return result || null;
};

export const updateBudget = async (id: number, totalAmount: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('UPDATE budget SET total_amount = ? WHERE id = ?', [totalAmount, id]);

  const categories = await db.getAllAsync<{
    id: number;
    allocation_type: 'percentage' | 'dollar';
    allocation_value: number;
  }>('SELECT id, allocation_type, allocation_value FROM categories');

  for (const category of categories) {
    const allocatedAmount = calculateAllocatedAmount(
      totalAmount,
      category.allocation_type,
      category.allocation_value
    );
    await db.runAsync('UPDATE categories SET allocated_amount = ? WHERE id = ?', [
      allocatedAmount,
      category.id,
    ]);
  }
};

export const deleteBudget = async (): Promise<void> => {
  const db = getDatabase();
  await db.execAsync('DELETE FROM budget;');
};
