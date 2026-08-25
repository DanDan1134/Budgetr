import {
  closePreviewPeriod,
  getPreviewHistoryDetail,
  getPreviewHistoryPeriods,
  previewCategories,
  previewHistory,
  previewSpendings,
  removePreviewHistoryPeriod,
  startPreviewPeriod,
} from './webPreviewStore';
import { buildMonthSummaries, type MonthSpending, type MonthSummary } from '../utils/monthlyHistory';

export type { MonthSummary, MonthSpending } from '../utils/monthlyHistory';

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

export const getMonthlyHistory = async (): Promise<MonthSummary[]> => {
  const liveItems: MonthSpending[] = previewSpendings.map((spending) => ({
    key: `live-${spending.id}`,
    categoryName:
      previewCategories.find((category) => category.id === spending.category_id)?.name ?? 'Unknown',
    description: spending.description,
    amount: spending.amount,
    spentAt: spending.created_at,
  }));

  const archivedItems: MonthSpending[] = previewHistory.flatMap((period) =>
    period.spendings.map((spending) => ({
      key: `archive-${spending.id}`,
      categoryName: spending.category_name,
      description: spending.description,
      amount: spending.amount,
      spentAt: spending.spent_at,
    }))
  );

  return buildMonthSummaries([...liveItems, ...archivedItems]);
};

export const deleteHistoryPeriod = async (periodId: number): Promise<void> => {
  removePreviewHistoryPeriod(periodId);
};

export const getHistoryPeriodDetail = async (
  periodId: number
): Promise<HistoryPeriodDetail | null> => {
  return getPreviewHistoryDetail(periodId);
};
