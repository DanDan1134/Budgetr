import { getDatabase } from './database';

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
}

export const getGoals = async (): Promise<Goal[]> => {
  const db = getDatabase();
  return db.getAllAsync<Goal>('SELECT * FROM goals ORDER BY name ASC');
};

export const createGoal = async (name: string, targetAmount: number): Promise<number> => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO goals (name, target_amount) VALUES (?, ?)',
    [name, targetAmount]
  );
  return result.lastInsertRowId;
};

export const deleteGoal = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
};
