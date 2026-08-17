export interface Category {
  id: number;
  name: string;
  allocation_type: 'percentage' | 'dollar';
  allocation_value: number;
  allocated_amount: number;
}

export interface Spending {
  id: number;
  category_id: number;
  description: string | null;
  amount: number;
  created_at: string;
}

export const calculateAllocatedAmount = (
  budgetTotal: number,
  allocationType: 'percentage' | 'dollar',
  allocationValue: number
): number => {
  if (allocationType === 'percentage') {
    return (budgetTotal * allocationValue) / 100;
  }
  return allocationValue;
};

export const calculateCategorySpent = (
  categoryId: number,
  spendings: Spending[]
): number => {
  return spendings
    .filter((s) => s.category_id === categoryId)
    .reduce((sum, s) => sum + s.amount, 0);
};

export const calculateCategoryRemaining = (
  allocated: number,
  spent: number
): number => {
  return allocated - spent;
};

export const calculateTotalSpent = (spendings: Spending[]): number => {
  return spendings.reduce((sum, s) => sum + s.amount, 0);
};

export const calculateTotalAllocated = (categories: Category[]): number => {
  return categories.reduce((sum, c) => sum + c.allocated_amount, 0);
};

export const calculateRemainingBudget = (
  budgetTotal: number,
  totalSpent: number
): number => {
  return budgetTotal - totalSpent;
};

export const calculateUnallocated = (
  budgetTotal: number,
  totalAllocated: number
): number => {
  return budgetTotal - totalAllocated;
};

export const dayLabel = (value: string): string => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) {
    return 'Today';
  }
  if (sameDay(date, yesterday)) {
    return 'Yesterday';
  }
  return date.toLocaleDateString();
};
