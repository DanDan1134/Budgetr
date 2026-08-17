import { getDatabase } from './database';

export const getSetting = async (key: string): Promise<string | null> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
};

export const getLastCategoryId = async (): Promise<number | null> => {
  const value = await getSetting('last_category_id');
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const setLastCategoryId = async (id: number): Promise<void> => {
  await setSetting('last_category_id', String(id));
};

export const isLockEnabled = async (): Promise<boolean> => {
  return (await getSetting('lock_enabled')) === '1';
};

export const setLockEnabled = async (enabled: boolean): Promise<void> => {
  await setSetting('lock_enabled', enabled ? '1' : '0');
};

export const isReminderEnabled = async (): Promise<boolean> => {
  return (await getSetting('reminder_enabled')) === '1';
};

export const setReminderEnabled = async (enabled: boolean): Promise<void> => {
  await setSetting('reminder_enabled', enabled ? '1' : '0');
};

export const getIncome = async (): Promise<number> => {
  const value = await getSetting('income');
  const parsed = value ? Number(value) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const setIncome = async (amount: number): Promise<void> => {
  await setSetting('income', String(amount));
};
