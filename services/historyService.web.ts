import {
  closePreviewPeriod,
  getPreviewHistoryDetail,
  getPreviewHistoryPeriods,
  removePreviewHistoryPeriod,
  startPreviewPeriod,
} from './webPreviewStore';

export interface HistoryPeriod {
  id: number;
  started_at: string;
  closed_at: string;
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  total_saved: number;
  spending_count: number;
  category_count: number;
}

export interface HistoryCategory {
  id: number;
  period_id: number;
  name: string;
  allocated_amount: number;
  spent_amount: number;
}

export interface HistorySpending {
  id: number;
  period_id: number;
  category_name: string;
  description: string | null;
  amount: number;
  spent_at: string;
}

export interface HistoryPeriodDetail extends HistoryPeriod {
  categories: HistoryCategory[];
  spendings: HistorySpending[];
}

export const startCurrentPeriod = async (startedAt = new Date().toISOString()): Promise<void> => {
  startPreviewPeriod(startedAt);
};

export const closeCurrentPeriod = async (): Promise<boolean> => {
  return closePreviewPeriod();
};

export const getHistoryPeriods = async (): Promise<HistoryPeriod[]> => {
  return getPreviewHistoryPeriods();
};

export const deleteHistoryPeriod = async (periodId: number): Promise<void> => {
  removePreviewHistoryPeriod(periodId);
};

export const getHistoryPeriodDetail = async (
  periodId: number
): Promise<HistoryPeriodDetail | null> => {
  return getPreviewHistoryDetail(periodId);
};
