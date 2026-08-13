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

export const deleteAllSpendings = async (): Promise<void> => {
  clearPreviewSpendings();
};
