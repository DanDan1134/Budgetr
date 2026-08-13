import { calculateAllocatedAmount, calculateCategorySpent, calculateTotalAllocated, calculateTotalSpent } from '../utils/calculations';

type PreviewBudget = {
  id: number;
  total_amount: number;
  created_at: string;
};

type PreviewCategory = {
  id: number;
  budget_id: number;
  name: string;
  allocation_type: 'percentage' | 'dollar';
  allocation_value: number;
  allocated_amount: number;
};

type PreviewCategoryInput = {
  name: string;
  allocation_type: 'percentage' | 'dollar';
  allocation_value: number;
};

type PreviewSpending = {
  id: number;
  category_id: number;
  description: string | null;
  amount: number;
  created_at: string;
};

type PreviewHistoryCategory = {
  id: number;
  period_id: number;
  name: string;
  allocated_amount: number;
  spent_amount: number;
};

type PreviewHistorySpending = {
  id: number;
  period_id: number;
  category_name: string;
  description: string | null;
  amount: number;
  spent_at: string;
};

type PreviewHistoryPeriod = {
  id: number;
  started_at: string;
  closed_at: string;
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  total_saved: number;
  spending_count: number;
  category_count: number;
  categories: PreviewHistoryCategory[];
  spendings: PreviewHistorySpending[];
};

let nextId = 10;
let previewPeriodStartedAt = new Date().toISOString();

export let previewBudget: PreviewBudget | null = null;
export let previewCategories: PreviewCategory[] = [];
export let previewSpendings: PreviewSpending[] = [];
export let previewHistory: PreviewHistoryPeriod[] = [];

export const loadSamplePreviewData = (): void => {
  previewBudget = {
    id: 1,
    total_amount: 2000,
    created_at: new Date().toISOString(),
  };
  previewCategories = [
    {
      id: 1,
      budget_id: 1,
      name: 'Food',
      allocation_type: 'percentage',
      allocation_value: 30,
      allocated_amount: 600,
    },
    {
      id: 2,
      budget_id: 1,
      name: 'Gas',
      allocation_type: 'dollar',
      allocation_value: 200,
      allocated_amount: 200,
    },
    {
      id: 3,
      budget_id: 1,
      name: 'Fun',
      allocation_type: 'percentage',
      allocation_value: 15,
      allocated_amount: 300,
    },
  ];
  previewSpendings = [
    {
      id: 1,
      category_id: 1,
      description: 'Groceries',
      amount: 85.5,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      category_id: 2,
      description: 'Shell',
      amount: 42,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      category_id: 3,
      description: 'Movies',
      amount: 18,
      created_at: new Date().toISOString(),
    },
  ];
  nextId = 10;
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const loadSampleHistoryData = (): void => {
  previewHistory = [
    {
      id: 101,
      started_at: daysAgo(40),
      closed_at: daysAgo(10),
      total_budget: 2000,
      total_allocated: 1100,
      total_spent: 412.75,
      total_saved: 1587.25,
      spending_count: 4,
      category_count: 3,
      categories: [
        { id: 1, period_id: 101, name: 'Food', allocated_amount: 600, spent_amount: 210.25 },
        { id: 2, period_id: 101, name: 'Gas', allocated_amount: 200, spent_amount: 84.5 },
        { id: 3, period_id: 101, name: 'Fun', allocated_amount: 300, spent_amount: 118 },
      ],
      spendings: [
        {
          id: 1,
          period_id: 101,
          category_name: 'Food',
          description: 'Groceries',
          amount: 124.75,
          spent_at: daysAgo(35),
        },
        {
          id: 2,
          period_id: 101,
          category_name: 'Food',
          description: 'Lunch',
          amount: 85.5,
          spent_at: daysAgo(22),
        },
        {
          id: 3,
          period_id: 101,
          category_name: 'Gas',
          description: 'Shell',
          amount: 84.5,
          spent_at: daysAgo(18),
        },
        {
          id: 4,
          period_id: 101,
          category_name: 'Fun',
          description: 'Movies',
          amount: 118,
          spent_at: daysAgo(12),
        },
      ],
    },
    {
      id: 100,
      started_at: daysAgo(70),
      closed_at: daysAgo(41),
      total_budget: 1800,
      total_allocated: 1500,
      total_spent: 1620,
      total_saved: 180,
      spending_count: 3,
      category_count: 2,
      categories: [
        { id: 5, period_id: 100, name: 'Food', allocated_amount: 900, spent_amount: 980 },
        { id: 6, period_id: 100, name: 'Bills', allocated_amount: 600, spent_amount: 640 },
      ],
      spendings: [
        {
          id: 5,
          period_id: 100,
          category_name: 'Food',
          description: 'Costco',
          amount: 980,
          spent_at: daysAgo(60),
        },
        {
          id: 6,
          period_id: 100,
          category_name: 'Bills',
          description: 'Electric',
          amount: 140,
          spent_at: daysAgo(55),
        },
        {
          id: 7,
          period_id: 100,
          category_name: 'Bills',
          description: 'Internet',
          amount: 500,
          spent_at: daysAgo(48),
        },
      ],
    },
  ];
};

export const startPreviewPeriod = (startedAt = new Date().toISOString()): void => {
  previewPeriodStartedAt = startedAt;
};

export const closePreviewPeriod = (): boolean => {
  if (!previewBudget) {
    return false;
  }

  const totalSpent = calculateTotalSpent(previewSpendings);
  const totalAllocated = calculateTotalAllocated(previewCategories);
  const closedAt = new Date().toISOString();
  const periodId = nextId++;

  previewHistory = [
    {
      id: periodId,
      started_at: previewPeriodStartedAt,
      closed_at: closedAt,
      total_budget: previewBudget.total_amount,
      total_allocated: totalAllocated,
      total_spent: totalSpent,
      total_saved: Math.max(0, previewBudget.total_amount - totalSpent),
      spending_count: previewSpendings.length,
      category_count: previewCategories.length,
      categories: previewCategories.map((category) => ({
        id: nextId++,
        period_id: periodId,
        name: category.name,
        allocated_amount: category.allocated_amount,
        spent_amount: calculateCategorySpent(category.id, previewSpendings),
      })),
      spendings: previewSpendings.map((spending) => ({
        id: nextId++,
        period_id: periodId,
        category_name:
          previewCategories.find((category) => category.id === spending.category_id)?.name ??
          'Unknown',
        description: spending.description,
        amount: spending.amount,
        spent_at: spending.created_at,
      })),
    },
    ...previewHistory,
  ];

  startPreviewPeriod(closedAt);
  previewSpendings = [];
  return true;
};

export const getPreviewHistoryPeriods = () =>
  previewHistory.map(({ categories: _categories, spendings: _spendings, ...period }) => period);

export const getPreviewHistoryDetail = (periodId: number) =>
  previewHistory.find((period) => period.id === periodId) ?? null;

export const setPreviewBudget = (totalAmount: number): number => {
  const id = nextId++;
  previewBudget = {
    id,
    total_amount: totalAmount,
    created_at: new Date().toISOString(),
  };
  previewCategories = [];
  previewSpendings = [];
  startPreviewPeriod(previewBudget.created_at);
  return id;
};

export const clearPreviewBudget = (): void => {
  previewBudget = null;
  previewCategories = [];
  previewSpendings = [];
};

export const setPreviewCategories = (
  budgetId: number,
  budgetTotal: number,
  categories: PreviewCategoryInput[]
): void => {
  previewCategories = categories.map((category) => ({
    id: nextId++,
    budget_id: budgetId,
    name: category.name,
    allocation_type: category.allocation_type,
    allocation_value: category.allocation_value,
    allocated_amount: calculateAllocatedAmount(
      budgetTotal,
      category.allocation_type,
      category.allocation_value
    ),
  }));
};

export const addPreviewCategory = (
  budgetId: number,
  budgetTotal: number,
  category: PreviewCategoryInput
): void => {
  previewCategories = [
    ...previewCategories,
    {
      id: nextId++,
      budget_id: budgetId,
      name: category.name,
      allocation_type: category.allocation_type,
      allocation_value: category.allocation_value,
      allocated_amount: calculateAllocatedAmount(
        budgetTotal,
        category.allocation_type,
        category.allocation_value
      ),
    },
  ];
};

export const removePreviewCategory = (id: number): void => {
  previewCategories = previewCategories.filter((category) => category.id !== id);
  previewSpendings = previewSpendings.filter((spending) => spending.category_id !== id);
};

export const clearPreviewCategories = (): void => {
  previewCategories = [];
};

export const addPreviewSpending = (
  categoryId: number,
  amount: number,
  description?: string
): number => {
  const id = nextId++;
  previewSpendings = [
    {
      id,
      category_id: categoryId,
      description: description || null,
      amount,
      created_at: new Date().toISOString(),
    },
    ...previewSpendings,
  ];
  return id;
};

export const removePreviewSpending = (id: number): void => {
  previewSpendings = previewSpendings.filter((spending) => spending.id !== id);
};

export const clearPreviewSpendings = (): void => {
  previewSpendings = [];
};
