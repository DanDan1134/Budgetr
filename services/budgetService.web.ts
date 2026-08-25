import {
  clearPreviewBudget,
  previewBudget,
  setPreviewBudget,
  updatePreviewBudgetAmount,
} from './webPreviewStore';

export interface Budget {
  id: number;
  total_amount: number;
  created_at: string;
}

export const createBudget = async (totalAmount: number): Promise<number> => {
  return setPreviewBudget(totalAmount);
};

export const getCurrentBudget = async (): Promise<Budget | null> => {
  return previewBudget;
};

export const updateBudget = async (_id: number, totalAmount: number): Promise<void> => {
  updatePreviewBudgetAmount(totalAmount);
};

export const deleteBudget = async (): Promise<void> => {
  clearPreviewBudget();
};
