import {
  addPreviewSpending,
  clearPreviewSpendings,
  previewSpendings,
  removePreviewSpending,
} from './webPreviewStore';

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
  return addPreviewSpending(categoryId, amount, description);
};

export const getSpendings = async (): Promise<Spending[]> => {
  return previewSpendings;
};

export const deleteSpending = async (id: number): Promise<void> => {
  removePreviewSpending(id);
};

export const updateSpending = async (
  id: number,
  categoryId: number,
  amount: number,
  description?: string
): Promise<void> => {
  const current = previewSpendings.find((item) => item.id === id);
  if (!current) {
    return;
  }
  removePreviewSpending(id);
  addPreviewSpending(categoryId, amount, description);
};

export const restoreSpending = async (spending: Spending): Promise<void> => {
  addPreviewSpending(spending.category_id, spending.amount, spending.description || undefined);
};

export const deleteAllSpendings = async (): Promise<void> => {
  clearPreviewSpendings();
};
