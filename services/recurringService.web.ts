export interface RecurringItem {
  id: number;
  category_name: string;
  amount: number;
  description: string | null;
}

let items: RecurringItem[] = [];
let nextId = 1;

export const getRecurringItems = async (): Promise<RecurringItem[]> => items;

export const createRecurringItem = async (
  categoryName: string,
  amount: number,
  description?: string
): Promise<number> => {
  const id = nextId;
  nextId += 1;
  items = [...items, { id, category_name: categoryName, amount, description: description || null }];
  return id;
};

export const deleteRecurringItem = async (id: number): Promise<void> => {
  items = items.filter((item) => item.id !== id);
};

export const applyRecurringSpendings = async (): Promise<number> => 0;
