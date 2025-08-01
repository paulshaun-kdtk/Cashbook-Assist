import * as SQLite from 'expo-sqlite';
import { Cashbook } from '../../types/cashbook';
import { Category } from '../../types/category';
import { Company } from '../../types/company';
import { Transaction } from '../../types/transaction';

export class SQLiteService {
  private static instance: SQLiteService;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): SQLiteService {
    if (!SQLiteService.instance) {
      SQLiteService.instance = new SQLiteService();
    }
    return SQLiteService.instance;
  }

  async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('cashbook.db');
      await this.createTables();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create sync metadata table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_metadata (
        table_name TEXT PRIMARY KEY,
        last_sync DATETIME,
        pending_changes INTEGER DEFAULT 0
      );
    `);

    // Create offline operations queue
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_type TEXT NOT NULL, -- 'create', 'update', 'delete'
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        data TEXT, -- JSON string of the data
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      );
    `);

    // Create companies table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT,
        sequence TEXT,
        created_at DATETIME,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0
      );
    `);

    // Create cashbooks table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS cashbooks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        which_key TEXT NOT NULL,
        currency TEXT NOT NULL,
        currency_symbol TEXT NOT NULL,
        description TEXT,
        sequence TEXT,
        created_at DATETIME,
        updated_at DATETIME,
        which_company TEXT NOT NULL,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (which_company) REFERENCES companies (id)
      );
    `);

    // Create categories table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT,
        sequence TEXT,
        created_at DATETIME,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0
      );
    `);

    // Create transactions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        which_cashbook TEXT NOT NULL,
        date DATETIME NOT NULL,
        description TEXT NOT NULL,
        memo TEXT,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        category TEXT NOT NULL,
        balance REAL NOT NULL,
        sequence TEXT,
        created_at DATETIME,
        updated_at DATETIME,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (which_cashbook) REFERENCES cashbooks (id),
        FOREIGN KEY (category) REFERENCES categories (id)
      );
    `);

    // Initialize sync metadata
    await this.db.runAsync(`
      INSERT OR IGNORE INTO sync_metadata (table_name, last_sync, pending_changes)
      VALUES 
        ('companies', NULL, 0),
        ('cashbooks', NULL, 0),
        ('categories', NULL, 0),
        ('transactions', NULL, 0);
    `);
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(`
      SELECT * FROM companies WHERE is_deleted = 0 ORDER BY created_at DESC
    `);
    
    return result.map(this.mapCompanyFromDb);
  }

  async insertCompany(company: Company): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      INSERT OR REPLACE INTO companies 
      (id, name, color, description, sequence, created_at, is_synced, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      company.$id,
      company.name,
      company.color,
      company.description,
      company.$sequence,
      company.$createdAt,
      0,
      0
    ]);
  }

  async updateCompany(company: Company): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE companies 
      SET name = ?, color = ?, description = ?, is_synced = 0
      WHERE id = ?
    `, [company.name, company.color, company.description, company.$id]);
  }

  async deleteCompany(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE companies SET is_deleted = 1, is_synced = 0 WHERE id = ?
    `, [id]);
  }

  // Cashbook operations
  async getCashbooks(which_key?: string): Promise<Cashbook[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = `SELECT * FROM cashbooks WHERE is_deleted = 0`;
    let params: any[] = [];
    
    if (which_key) {
      query += ` AND which_key = ?`;
      params = [which_key];
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await this.db.getAllAsync(query, params);
    return result.map(this.mapCashbookFromDb);
  }

  async insertCashbook(cashbook: Cashbook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      INSERT OR REPLACE INTO cashbooks 
      (id, name, which_key, currency, currency_symbol, description, sequence, 
       created_at, updated_at, which_company, is_synced, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cashbook.$id,
      cashbook.name,
      cashbook.which_key,
      cashbook.currency,
      cashbook.currency_symbol,
      cashbook.description,
      cashbook.$sequence,
      cashbook.$createdAt,
      cashbook.$updatedAt,
      cashbook.which_company,
      0,
      0
    ]);
  }

  async updateCashbook(cashbook: Cashbook): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE cashbooks 
      SET name = ?, currency = ?, currency_symbol = ?, description = ?, 
          updated_at = ?, is_synced = 0
      WHERE id = ?
    `, [
      cashbook.name,
      cashbook.currency,
      cashbook.currency_symbol,
      cashbook.description,
      new Date().toISOString(),
      cashbook.$id
    ]);
  }

  async deleteCashbook(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE cashbooks SET is_deleted = 1, is_synced = 0 WHERE id = ?
    `, [id]);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(`
      SELECT * FROM categories WHERE is_deleted = 0 ORDER BY created_at DESC
    `);
    
    return result.map(this.mapCategoryFromDb);
  }

  async insertCategory(category: Category): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      INSERT OR REPLACE INTO categories 
      (id, name, color, description, sequence, created_at, is_synced, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category.$id,
      category.name,
      category.color,
      category.description,
      category.$sequence,
      category.$createdAt,
      0,
      0
    ]);
  }

  async updateCategory(category: Category): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE categories 
      SET name = ?, color = ?, description = ?, is_synced = 0
      WHERE id = ?
    `, [category.name, category.color, category.description, category.$id]);
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE categories SET is_deleted = 1, is_synced = 0 WHERE id = ?
    `, [id]);
  }

  // Transaction operations
  async getTransactions(cashbookId?: string): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = `SELECT * FROM transactions WHERE is_deleted = 0`;
    let params: any[] = [];
    
    if (cashbookId) {
      query += ` AND which_cashbook = ?`;
      params = [cashbookId];
    }
    
    query += ` ORDER BY date DESC, created_at DESC`;
    
    const result = await this.db.getAllAsync(query, params);
    return result.map(this.mapTransactionFromDb);
  }

  async insertTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      INSERT OR REPLACE INTO transactions 
      (id, which_cashbook, date, description, memo, amount, type, category, 
       balance, sequence, created_at, updated_at, is_synced, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      transaction.$id,
      transaction.which_cashbook,
      transaction.date,
      transaction.description,
      transaction.memo,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.balance,
      transaction.$sequence,
      transaction.$createdAt,
      transaction.$updatedAt,
      0,
      0
    ]);
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE transactions 
      SET date = ?, description = ?, memo = ?, amount = ?, type = ?, 
          category = ?, balance = ?, updated_at = ?, is_synced = 0
      WHERE id = ?
    `, [
      transaction.date,
      transaction.description,
      transaction.memo,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.balance,
      new Date().toISOString(),
      transaction.$id
    ]);
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE transactions SET is_deleted = 1, is_synced = 0 WHERE id = ?
    `, [id]);
  }

  // Offline operations queue
  async addOfflineOperation(
    operationType: 'create' | 'update' | 'delete',
    tableName: string,
    recordId: string,
    data?: any
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      INSERT INTO offline_operations 
      (operation_type, table_name, record_id, data, timestamp, synced)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      operationType,
      tableName,
      recordId,
      data ? JSON.stringify(data) : null,
      new Date().toISOString(),
      0
    ]);
  }

  async getPendingOperations(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.getAllAsync(`
      SELECT * FROM offline_operations 
      WHERE synced = 0 
      ORDER BY timestamp ASC
    `);
  }

  async markOperationSynced(operationId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE offline_operations SET synced = 1 WHERE id = ?
    `, [operationId]);
  }

  async clearSyncedOperations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      DELETE FROM offline_operations WHERE synced = 1
    `);
  }

  // Sync metadata operations
  async updateLastSync(tableName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(`
      UPDATE sync_metadata 
      SET last_sync = CURRENT_TIMESTAMP 
      WHERE table_name = ?
    `, [tableName]);
  }

  async getLastSync(tableName: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(`
      SELECT last_sync FROM sync_metadata WHERE table_name = ?
    `, [tableName]) as any;
    
    return result?.last_sync || null;
  }

  // Helper mapping functions
  private mapCompanyFromDb(row: any): Company {
    return {
      $id: row.id,
      name: row.name,
      color: row.color,
      description: row.description,
      $sequence: row.sequence,
      $createdAt: row.created_at,
    };
  }

  private mapCashbookFromDb(row: any): Cashbook {
    return {
      $id: row.id,
      name: row.name,
      which_key: row.which_key,
      currency: row.currency,
      currency_symbol: row.currency_symbol,
      description: row.description,
      $sequence: row.sequence,
      $createdAt: row.created_at,
      $updatedAt: row.updated_at,
      which_company: row.which_company,
    };
  }

  private mapCategoryFromDb(row: any): Category {
    return {
      $id: row.id,
      name: row.name,
      color: row.color,
      description: row.description,
      $sequence: row.sequence,
      $createdAt: row.created_at,
    };
  }

  private mapTransactionFromDb(row: any): Transaction {
    return {
      $id: row.id,
      $sequence: row.sequence,
      $createdAt: row.created_at,
      $updatedAt: row.updated_at,
      which_cashbook: row.which_cashbook,
      date: row.date,
      description: row.description,
      memo: row.memo,
      amount: row.amount,
      type: row.type as 'income' | 'expense',
      createdAt: row.created_at,
      category: row.category,
      balance: row.balance,
    };
  }
}

export const sqliteService = SQLiteService.getInstance();
