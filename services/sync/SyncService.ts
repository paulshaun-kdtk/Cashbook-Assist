import { database, query } from '../../redux/appwrite/config';
import { appwriteCreds } from '../../redux/appwrite/credentials';
import { Cashbook } from '../../types/cashbook';
import { Category } from '../../types/category';
import { Company } from '../../types/company';
import { Transaction } from '../../types/transaction';
import { sqliteService } from '../database/sqlite';
import { NetworkService } from '../network/NetworkService';

export class SyncService {
  private static instance: SyncService;
  private isSyncing: boolean = false;
  private syncCallbacks: ((status: 'started' | 'completed' | 'error') => void)[] = [];

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  addSyncStatusListener(callback: (status: 'started' | 'completed' | 'error') => void): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  private notifySyncStatus(status: 'started' | 'completed' | 'error'): void {
    this.syncCallbacks.forEach(callback => callback(status));
  }

  async syncAll(which_key: string): Promise<void> {
    if (!NetworkService.isConnected()) {
      console.log('No network connection, skipping sync');
      return;
    }

    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    this.notifySyncStatus('started');

    try {
      // First, push local changes to remote
      await this.pushLocalChanges();
      
      // Then, pull remote changes to local
      await this.pullRemoteChanges(which_key);
      
      // Clean up synced operations
      await sqliteService.clearSyncedOperations();
      
      this.notifySyncStatus('completed');
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifySyncStatus('error');
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushLocalChanges(): Promise<void> {
    const pendingOperations = await sqliteService.getPendingOperations();
    
    for (const operation of pendingOperations) {
      try {
        await this.processPendingOperation(operation);
        await sqliteService.markOperationSynced(operation.id);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        // Continue with other operations even if one fails
      }
    }
  }

  private async processPendingOperation(operation: any): Promise<void> {
    const { operation_type, table_name, record_id, data } = operation;
    const parsedData = data ? JSON.parse(data) : null;

    switch (table_name) {
      case 'companies':
        await this.syncCompanyOperation(operation_type, record_id, parsedData);
        break;
      case 'cashbooks':
        await this.syncCashbookOperation(operation_type, record_id, parsedData);
        break;
      case 'categories':
        await this.syncCategoryOperation(operation_type, record_id, parsedData);
        break;
      case 'transactions':
        await this.syncTransactionOperation(operation_type, record_id, parsedData);
        break;
    }
  }

  private async syncCompanyOperation(operationType: string, recordId: string, data: any): Promise<void> {
    switch (operationType) {
      case 'create':
        await database.createDocument(
          appwriteCreds.databaseId,
          appwriteCreds.company_collection_id,
          recordId,
          data
        );
        break;
      case 'update':
        await database.updateDocument(
          appwriteCreds.databaseId,
          appwriteCreds.company_collection_id,
          recordId,
          data
        );
        break;
      case 'delete':
        await database.deleteDocument(
          appwriteCreds.databaseId,
          appwriteCreds.company_collection_id,
          recordId
        );
        break;
    }
  }

  private async syncCashbookOperation(operationType: string, recordId: string, data: any): Promise<void> {
    switch (operationType) {
      case 'create':
        await database.createDocument(
          appwriteCreds.databaseId,
          appwriteCreds.cashbook_collection_id,
          recordId,
          data
        );
        break;
      case 'update':
        await database.updateDocument(
          appwriteCreds.databaseId,
          appwriteCreds.cashbook_collection_id,
          recordId,
          data
        );
        break;
      case 'delete':
        await database.deleteDocument(
          appwriteCreds.databaseId,
          appwriteCreds.cashbook_collection_id,
          recordId
        );
        break;
    }
  }

  private async syncCategoryOperation(operationType: string, recordId: string, data: any): Promise<void> {
    switch (operationType) {
      case 'create':
        await database.createDocument(
          appwriteCreds.databaseId,
          appwriteCreds.category_collection_id,
          recordId,
          data
        );
        break;
      case 'update':
        await database.updateDocument(
          appwriteCreds.databaseId,
          appwriteCreds.category_collection_id,
          recordId,
          data
        );
        break;
      case 'delete':
        await database.deleteDocument(
          appwriteCreds.databaseId,
          appwriteCreds.category_collection_id,
          recordId
        );
        break;
    }
  }

  private async syncTransactionOperation(operationType: string, recordId: string, data: any): Promise<void> {
    const collectionId = data?.type === 'income' 
      ? appwriteCreds.income_collection_id 
      : appwriteCreds.expense_collection_id;

    switch (operationType) {
      case 'create':
        await database.createDocument(
          appwriteCreds.databaseId,
          collectionId,
          recordId,
          data
        );
        break;
      case 'update':
        await database.updateDocument(
          appwriteCreds.databaseId,
          collectionId,
          recordId,
          data
        );
        break;
      case 'delete':
        await database.deleteDocument(
          appwriteCreds.databaseId,
          collectionId,
          recordId
        );
        break;
    }
  }

  private async pullRemoteChanges(which_key: string): Promise<void> {
    await Promise.all([
      this.syncCompaniesFromRemote(),
      this.syncCashbooksFromRemote(which_key),
      this.syncCategoriesFromRemote(),
      this.syncTransactionsFromRemote(which_key),
    ]);
  }

  private async syncCompaniesFromRemote(): Promise<void> {
    try {
      const lastSync = await sqliteService.getLastSync('companies');
      const queries = [query.orderDesc('$createdAt')];
      
      if (lastSync) {
        queries.push(query.greaterThan('$updatedAt', lastSync));
      }

      const response = await database.listDocuments(
        appwriteCreds.databaseId,
        appwriteCreds.company_collection_id,
        queries
      );

      for (const doc of response.documents) {
        await sqliteService.insertCompany(doc as unknown as Company);
      }

      await sqliteService.updateLastSync('companies');
    } catch (error) {
      console.error('Failed to sync companies from remote:', error);
    }
  }

  private async syncCashbooksFromRemote(which_key: string): Promise<void> {
    try {
      const lastSync = await sqliteService.getLastSync('cashbooks');
      const queries = [
        query.equal('which_key', which_key),
        query.orderDesc('$createdAt')
      ];
      
      if (lastSync) {
        queries.push(query.greaterThan('$updatedAt', lastSync));
      }

      const response = await database.listDocuments(
        appwriteCreds.databaseId,
        appwriteCreds.cashbook_collection_id,
        queries
      );

      for (const doc of response.documents) {
        await sqliteService.insertCashbook(doc as unknown as Cashbook);
      }

      await sqliteService.updateLastSync('cashbooks');
    } catch (error) {
      console.error('Failed to sync cashbooks from remote:', error);
    }
  }

  private async syncCategoriesFromRemote(): Promise<void> {
    try {
      const lastSync = await sqliteService.getLastSync('categories');
      const queries = [query.orderDesc('$createdAt')];
      
      if (lastSync) {
        queries.push(query.greaterThan('$updatedAt', lastSync));
      }

      const response = await database.listDocuments(
        appwriteCreds.databaseId,
        appwriteCreds.category_collection_id,
        queries
      );

      for (const doc of response.documents) {
        await sqliteService.insertCategory(doc as unknown as Category);
      }

      await sqliteService.updateLastSync('categories');
    } catch (error) {
      console.error('Failed to sync categories from remote:', error);
    }
  }

  private async syncTransactionsFromRemote(which_key: string): Promise<void> {
    try {
      const lastSync = await sqliteService.getLastSync('transactions');
      
      // Get all cashbooks for this user to sync their transactions
      const cashbooks = await sqliteService.getCashbooks(which_key);
      
      for (const cashbook of cashbooks) {
        // Sync income transactions
        const incomeQueries = [
          query.equal('which_cashbook', cashbook.$id),
          query.orderDesc('$createdAt')
        ];
        
        if (lastSync) {
          incomeQueries.push(query.greaterThan('$updatedAt', lastSync));
        }

        const incomeResponse = await database.listDocuments(
          appwriteCreds.databaseId,
          appwriteCreds.income_collection_id,
          incomeQueries
        );

        for (const doc of incomeResponse.documents) {
          await sqliteService.insertTransaction({ ...doc, type: 'income' } as unknown as Transaction);
        }

        // Sync expense transactions
        const expenseQueries = [
          query.equal('which_cashbook', cashbook.$id),
          query.orderDesc('$createdAt')
        ];
        
        if (lastSync) {
          expenseQueries.push(query.greaterThan('$updatedAt', lastSync));
        }

        const expenseResponse = await database.listDocuments(
          appwriteCreds.databaseId,
          appwriteCreds.expense_collection_id,
          expenseQueries
        );

        for (const doc of expenseResponse.documents) {
          await sqliteService.insertTransaction({ ...doc, type: 'expense' } as unknown as Transaction);
        }
      }

      await sqliteService.updateLastSync('transactions');
    } catch (error) {
      console.error('Failed to sync transactions from remote:', error);
    }
  }

  // Manual sync for specific data types
  async syncCompanies(): Promise<void> {
    if (!NetworkService.isConnected()) return;
    await this.syncCompaniesFromRemote();
  }

  async syncCashbooks(which_key: string): Promise<void> {
    if (!NetworkService.isConnected()) return;
    await this.syncCashbooksFromRemote(which_key);
  }

  async syncCategories(): Promise<void> {
    if (!NetworkService.isConnected()) return;
    await this.syncCategoriesFromRemote();
  }

  async syncTransactions(which_key: string): Promise<void> {
    if (!NetworkService.isConnected()) return;
    await this.syncTransactionsFromRemote(which_key);
  }
}

export const syncService = SyncService.getInstance();
