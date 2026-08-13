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

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS current_period (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        started_at TEXT NOT NULL
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS periods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at TEXT NOT NULL,
        closed_at TEXT NOT NULL,
        total_budget REAL NOT NULL,
        total_allocated REAL NOT NULL,
        total_spent REAL NOT NULL,
        total_saved REAL NOT NULL,
        spending_count INTEGER NOT NULL,
        category_count INTEGER NOT NULL
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS period_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        allocated_amount REAL NOT NULL,
        spent_amount REAL NOT NULL,
        FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS period_spendings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period_id INTEGER NOT NULL,
        category_name TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        spent_at TEXT NOT NULL,
        FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE
      );
    `);

    const currentPeriod = await database.getFirstAsync<{ started_at: string }>(
      'SELECT started_at FROM current_period WHERE id = 1'
    );
    if (!currentPeriod) {
      await database.runAsync(
        'INSERT INTO current_period (id, started_at) VALUES (1, ?)',
        [new Date().toISOString()]
      );
    }

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
