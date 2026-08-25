import {
  addPreviewCategory,
  clearPreviewCategories,
  previewCategories,
  removePreviewCategory,
  setPreviewCategories,
  updatePreviewCategory,
} from './webPreviewStore';

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
  setPreviewCategories(budgetId, budgetTotal, categories);
};

export const createCategory = async (
  budgetId: number,
  budgetTotal: number,
  category: CategoryInput
): Promise<void> => {
  addPreviewCategory(budgetId, budgetTotal, category);
};

export const updateCategory = async (
  id: number,
  budgetTotal: number,
  category: CategoryInput
): Promise<void> => {
  updatePreviewCategory(id, budgetTotal, category);
};

export const getCategories = async (): Promise<Category[]> => {
  return previewCategories;
};

export const deleteCategory = async (id: number): Promise<void> => {
  removePreviewCategory(id);
};

export const deleteAllCategories = async (): Promise<void> => {
  clearPreviewCategories();
};
