import { appwriteCreds } from '@/redux/appwrite/credentials';
import { Client, RealtimeResponseEvent } from 'react-native-appwrite';
import { subscriptionService } from './subscriptionService';
import { subscriptionValidationService } from './subscriptionValidationService';

export interface AppwriteSubscriptionChange {
  type: 'manual_upgrade' | 'manual_downgrade' | 'admin_action' | 'status_change';
  oldStatus?: string;
  newStatus: string;
  subscription: any;
}

export class AppwriteSubscriptionListener {
  private static instance: AppwriteSubscriptionListener;
  private client: Client;
  private unsubscribe?: () => void;
  private isListening = false;
  private changeCallbacks: ((change: AppwriteSubscriptionChange) => void)[] = [];

  private constructor() {
    this.client = new Client()
      .setProject(appwriteCreds.projectId!)
      .setEndpoint(appwriteCreds.apiUrl);
  }

  static getInstance(): AppwriteSubscriptionListener {
    if (!AppwriteSubscriptionListener.instance) {
      AppwriteSubscriptionListener.instance = new AppwriteSubscriptionListener();
    }
    return AppwriteSubscriptionListener.instance;
  }

  /**
   * Start listening to Appwrite subscription changes for specific user
   */
  startListening(userEmail: string): void {
    if (this.isListening) {
      console.log('Already listening to Appwrite subscription changes');
      return;
    }

    try {
      console.log('Starting Appwrite subscription listener for user:', userEmail);

      // Subscribe to subscription collection document changes
      this.unsubscribe = this.client.subscribe(
        [
          `databases.${appwriteCreds.databaseId}.collections.${appwriteCreds.subscription_collection_id}.documents`
        ],
        (response: RealtimeResponseEvent<any>) => {
          this.handleSubscriptionChange(userEmail, response);
        }
      );

      this.isListening = true;
      console.log('Appwrite subscription listener started successfully');

    } catch (error) {
      console.error('Failed to start Appwrite subscription listener:', error);
    }
  }

  /**
   * Stop listening to Appwrite subscription changes
   */
  stopListening(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    this.isListening = false;
    console.log('Appwrite subscription listener stopped');
  }

  /**
   * Add callback for subscription change events
   */
  addChangeListener(callback: (change: AppwriteSubscriptionChange) => void): () => void {
    this.changeCallbacks.push(callback);
    return () => {
      const index = this.changeCallbacks.indexOf(callback);
      if (index > -1) {
        this.changeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Handle incoming subscription document changes
   */
  private async handleSubscriptionChange(
    userEmail: string, 
    response: RealtimeResponseEvent<any>
  ): Promise<void> {
    try {
      const { events, payload } = response;
      
      // Check if this is the current user's subscription
      if (payload.user !== userEmail.toLowerCase().trim()) {
        return; // Not our user's subscription
      }

      console.log('Appwrite subscription change detected:', {
        events,
        user: payload.user,
        status: payload.subscription_status,
        type: payload.subscription_type
      });

      // Determine change type
      const changeType = this.determineChangeType(events, payload);
      
      if (changeType) {
        // Notify listeners
        this.notifyChangeListeners(changeType);

        // Handle the change
        await this.processSubscriptionChange(userEmail, changeType);
      }

    } catch (error) {
      console.error('Error handling Appwrite subscription change:', error);
    }
  }

  /**
   * Determine the type of subscription change
   */
  private determineChangeType(
    events: string[], 
    subscription: any
  ): AppwriteSubscriptionChange | null {
    const isUpdate = events.some(event => event.includes('update'));
    const isCreate = events.some(event => event.includes('create'));

    if (isUpdate) {
      // This is an update - could be manual admin action
      return {
        type: this.classifyUpdateType(subscription),
        newStatus: subscription.subscription_status,
        subscription
      };
    } else if (isCreate) {
      // New subscription created
      return {
        type: 'status_change',
        newStatus: subscription.subscription_status,
        subscription
      };
    }

    return null;
  }

  /**
   * Classify the type of update based on subscription data
   */
  private classifyUpdateType(subscription: any): AppwriteSubscriptionChange['type'] {
    // Check if this was updated recently and status changed
    const updatedAt = new Date(subscription.updated_at || subscription.$updatedAt);
    const now = new Date();
    const timeDiff = now.getTime() - updatedAt.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    // If updated very recently, likely a manual change
    if (timeDiff < fiveMinutes) {
      switch (subscription.subscription_status) {
        case 'active':
          return 'manual_upgrade';
        case 'cancelled':
        case 'expired':
          return 'manual_downgrade';
        default:
          return 'admin_action';
      }
    }

    return 'status_change';
  }

  /**
   * Process the subscription change and update app state
   */
  private async processSubscriptionChange(
    userEmail: string,
    change: AppwriteSubscriptionChange
  ): Promise<void> {
    try {
      console.log('Processing Appwrite subscription change:', change.type);

      // Clear cached subscription data to force refresh
      subscriptionService.clearCache();

      // Trigger validation to sync with RevenueCat and update app state
      await subscriptionValidationService.validateUserSubscription(userEmail);

      // Handle specific change types
      switch (change.type) {
        case 'manual_upgrade':
          console.log('User was manually upgraded to premium');
          // Could trigger welcome notification, feature tour, etc.
          break;
        
        case 'manual_downgrade':
          console.log('User was manually downgraded');
          // Could trigger data export prompt, feature limitation notice, etc.
          break;
        
        case 'admin_action':
          console.log('Admin action detected on subscription');
          // Could trigger support notification, status update, etc.
          break;
        
        case 'status_change':
          console.log('Subscription status changed');
          break;
      }

      console.log('Appwrite subscription change processed successfully');

    } catch (error) {
      console.error('Error processing subscription change:', error);
    }
  }

  /**
   * Notify all change listeners
   */
  private notifyChangeListeners(change: AppwriteSubscriptionChange): void {
    this.changeCallbacks.forEach(callback => {
      try {
        callback(change);
      } catch (error) {
        console.error('Error in subscription change callback:', error);
      }
    });
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Clean up all listeners and connections
   */
  destroy(): void {
    this.stopListening();
    this.changeCallbacks = [];
  }
}

// Export singleton instance
export const appwriteSubscriptionListener = AppwriteSubscriptionListener.getInstance();
