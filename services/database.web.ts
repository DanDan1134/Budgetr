export const initDatabase = async (): Promise<void> => {
  // Web preview skips SQLite. Nothing is saved.
};

export const getDatabase = (): never => {
  throw new Error('SQLite is not used on web.');
};

export const closeDatabase = async (): Promise<void> => {};
