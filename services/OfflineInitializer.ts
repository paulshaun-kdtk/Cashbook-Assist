import { sqliteService } from '../services/database/sqlite';
import { NetworkService } from '../services/network/NetworkService';

export class OfflineInitializer {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing offline support...');
      
      // Initialize SQLite database
      await sqliteService.initializeDatabase();
      console.log('SQLite database initialized');
      
      // Initialize network monitoring
      await NetworkService.initialize();
      console.log('Network service initialized');
      
      this.initialized = true;
      console.log('Offline support initialization complete');
    } catch (error) {
      console.error('Failed to initialize offline support:', error);
      throw error;
    }
  }

  static isInitialized(): boolean {
    return this.initialized;
  }
}
