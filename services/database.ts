import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export const initDatabase = async (): Promise<void> => {
  if (db) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const database = await SQLite.openDatabaseAsync('budgetr.db');

    await database.execAsync('PRAGMA foreign_keys = ON;');

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS budget (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_amount REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        budget_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        allocation_type TEXT NOT NULL CHECK(allocation_type IN ('percentage', 'dollar')),
        allocation_value REAL NOT NULL,
        allocated_amount REAL NOT NULL,
        FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS spendings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);

    db = database;
    console.log('Database initialized successfully');
  })();

  try {
    await initPromise;
  } catch (error) {
    initPromise = null;
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
    initPromise = null;
  }
};
