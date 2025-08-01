export class NetworkService {
  private static isOnline: boolean = true;
  private static listeners: ((isOnline: boolean) => void)[] = [];

  static async initialize(): Promise<void> {
    try {
      // Simple connectivity check using fetch
      await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      this.isOnline = true;
    } catch {
      this.isOnline = false;
    }
  }

  static async checkConnectivity(): Promise<boolean> {
    try {
      await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      });
      this.isOnline = true;
    } catch {
      this.isOnline = false;
    }
    
    this.notifyListeners();
    return this.isOnline;
  }

  static isConnected(): boolean {
    return this.isOnline;
  }

  static addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  // Start periodic connectivity checks
  static startConnectivityMonitoring(): void {
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }
}
