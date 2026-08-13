import {
  clearPreviewBudget,
  previewBudget,
  setPreviewBudget,
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

export const deleteBudget = async (): Promise<void> => {
  clearPreviewBudget();
};
