let settings: Record<string, string> = {};

export const getSetting = async (key: string): Promise<string | null> => settings[key] ?? null;

export const setSetting = async (key: string, value: string): Promise<void> => {
  settings[key] = value;
};

export const getLastCategoryId = async (): Promise<number | null> => {
  const value = settings.last_category_id;
  return value ? Number(value) : null;
};

export const setLastCategoryId = async (id: number): Promise<void> => {
  settings.last_category_id = String(id);
};

export const isLockEnabled = async (): Promise<boolean> => false;
export const setLockEnabled = async (): Promise<void> => {};
export const isReminderEnabled = async (): Promise<boolean> => false;
export const setReminderEnabled = async (): Promise<void> => {};

export const getIncome = async (): Promise<number> => {
  const value = settings.income;
  return value ? Number(value) : 0;
};

export const setIncome = async (amount: number): Promise<void> => {
  settings.income = String(amount);
};
