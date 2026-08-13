import { calculateAllocatedAmount } from '../utils/calculations';

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

let nextId = 10;

export let previewBudget: PreviewBudget | null = null;
export let previewCategories: PreviewCategory[] = [];
export let previewSpendings: PreviewSpending[] = [];

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

export const setPreviewBudget = (totalAmount: number): number => {
  const id = nextId++;
  previewBudget = {
    id,
    total_amount: totalAmount,
    created_at: new Date().toISOString(),
  };
  previewCategories = [];
  previewSpendings = [];
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
