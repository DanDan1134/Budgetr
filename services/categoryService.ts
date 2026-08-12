import { getDatabase } from './database';
import { calculateAllocatedAmount } from '../utils/calculations';

export interface Category {
  id: number;
  budget_id: number;
  name: string;
  allocation_type: 'percentage' | 'dollar';
  allocation_value: number;
  allocated_amount: number;
}

export interface CategoryInput {
  name: string;
  allocation_type: 'percentage' | 'dollar';
  allocation_value: number;
}

export const createCategories = async (
  budgetId: number,
  budgetTotal: number,
  categories: CategoryInput[]
): Promise<void> => {
  const db = getDatabase();
  
  for (const category of categories) {
    const allocatedAmount = calculateAllocatedAmount(
      budgetTotal,
      category.allocation_type,
      category.allocation_value
    );
    
    await db.runAsync(
      `INSERT INTO categories (budget_id, name, allocation_type, allocation_value, allocated_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [budgetId, category.name, category.allocation_type, category.allocation_value, allocatedAmount]
    );
  }
};

export const getCategories = async (): Promise<Category[]> => {
  const db = getDatabase();
  
  const result = await db.getAllAsync<Category>(
    'SELECT * FROM categories ORDER BY name ASC'
  );
  
  return result;
};

export const deleteAllCategories = async (): Promise<void> => {
  const db = getDatabase();
  await db.execAsync('DELETE FROM categories;');
};
