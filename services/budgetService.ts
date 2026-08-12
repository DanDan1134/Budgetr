import { getDatabase } from './database';

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

export const deleteBudget = async (): Promise<void> => {
  const db = getDatabase();
  await db.execAsync('DELETE FROM budget;');
};
