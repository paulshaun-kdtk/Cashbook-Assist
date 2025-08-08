import { AppState, AppStateStatus } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { sessionAwareSubscriptionService } from './sessionAwareSubscriptionService';
import { subscriptionAPIService } from './subscriptionAPIService';
import { subscriptionService } from './subscriptionService';

export interface ValidationResult {
  isValid: boolean;
  hasActiveSubscription: boolean;
  customerInfo?: CustomerInfo;
  syncedWithAppwrite: boolean;
  error?: string;
}

export class SubscriptionValidationService {
  private static instance: SubscriptionValidationService;
  private validationInterval: NodeJS.Timeout | null = null;
  private lastValidationTime: number = 0;
  private validationIntervalMs = 30 * 60 * 1000; // 30 minutes
  private isValidating = false;
  private validationCallbacks: ((result: ValidationResult) => void)[] = [];
  private appStateSubscription: any = null;
  private isPeriodicValidationActive = false; // Add flag to prevent multiple starts

  private constructor() {
    // Listen for app state changes to trigger validation
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  static getInstance(): SubscriptionValidationService {
    if (!SubscriptionValidationService.instance) {
      SubscriptionValidationService.instance = new SubscriptionValidationService();
    }
    return SubscriptionValidationService.instance;
  }

  /**
   * Start periodic validation
   */
  startPeriodicValidation(): void {
    // Prevent multiple instances
    if (this.isPeriodicValidationActive) {
      console.log('Periodic validation already active, skipping...');
      return;
    }

    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }

    this.validationInterval = setInterval(() => {
      // Only validate if we're not already validating
      if (!this.isValidating) {
        this.validateSubscriptionStatus();
      }
    }, this.validationIntervalMs);

    this.isPeriodicValidationActive = true;
    console.log('Periodic validation started');
  }

  /**
   * Stop periodic validation
   */
  stopPeriodicValidation(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
    this.isPeriodicValidationActive = false;
    console.log('Periodic validation stopped');
  }

  /**
   * Add a callback to be notified of validation results
   */
  addValidationListener(callback: (result: ValidationResult) => void): () => void {
    this.validationCallbacks.push(callback);
    return () => {
      const index = this.validationCallbacks.indexOf(callback);
      if (index > -1) {
        this.validationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of validation results
   */
  private notifyValidationListeners(result: ValidationResult): void {
    this.validationCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('Error in validation callback:', error);
      }
    });
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active') {
      // App became active, check if we need to validate
      const timeSinceLastValidation = Date.now() - this.lastValidationTime;
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeSinceLastValidation > fiveMinutes && !this.isValidating) {
        console.log('App became active, validating subscription...');
        this.validateSubscriptionStatus();
      }
    }
  };

  /**
   * Force validation of subscription status
   */
  async validateSubscriptionStatus(userEmail?: string): Promise<ValidationResult> {
    if (this.isValidating) {
      console.log('Validation already in progress, skipping...');
      return {
        isValid: false,
        hasActiveSubscription: false,
        syncedWithAppwrite: false,
        error: 'Validation already in progress'
      };
    }

    this.isValidating = true;
    this.lastValidationTime = Date.now();

    try {
      console.log('Starting subscription validation...');

      // Check if RevenueCat is configured before using it
      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) {
        console.warn('⚠️ RevenueCat not configured, skipping validation');
        return {
          isValid: false,
          hasActiveSubscription: false,
          syncedWithAppwrite: false,
          error: 'RevenueCat not configured'
        };
      }

      // Get current customer info from RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();
      
      // Check if user has any active entitlements (not just premium)
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      console.log('RevenueCat subscription status:', {
        hasActiveSubscription,
        entitlements: Object.keys(customerInfo.entitlements.active),
        originalAppUserId: customerInfo.originalAppUserId
      });

      // Determine subscription status based on RevenueCat data
      let subscriptionStatus: 'active' | 'pending' | 'cancelled' | 'expired' = 'expired';
      
      if (hasActiveSubscription) {
        subscriptionStatus = 'active';
      } else {
        // Check if there are any expired entitlements that were recently cancelled
        const allEntitlements = customerInfo.entitlements.all;
        const firstEntitlementKey = Object.keys(allEntitlements)[0];
        
        if (firstEntitlementKey && allEntitlements[firstEntitlementKey]) {
          const entitlement = allEntitlements[firstEntitlementKey];
          const expirationDate = new Date(entitlement.expirationDate || '');
          const now = new Date();
          
          // If expired recently (within last 24 hours), mark as cancelled
          const timeDiff = now.getTime() - expirationDate.getTime();
          const oneDayMs = 24 * 60 * 60 * 1000;
          
          if (timeDiff <= oneDayMs) {
            subscriptionStatus = 'cancelled';
          } else {
            subscriptionStatus = 'expired';
          }
        }
      }

      // Sync with Appwrite if we have user email
      let syncedWithAppwrite = false;
      if (userEmail) {
        try {
          // Use session-aware service to avoid API key/session conflict
          console.log('Using session-aware service for subscription sync...');
          
          // Try to use session-based update first
          const sessionResult = await sessionAwareSubscriptionService.updateAppwriteSubscription(
            userEmail,
            {
              subscription_status: subscriptionStatus,
              subscription_type: hasActiveSubscription ? 'premium' : 'trial',
              subscription_plan_id: hasActiveSubscription ? 
                Object.keys(customerInfo.entitlements.active)[0] || 'premium' : 
                'trial',
              subscription_id: customerInfo.originalAppUserId,
              payment_platform: 'revenue_cat'
            }
          );

          syncedWithAppwrite = sessionResult.success;
          
          if (sessionResult.success) {
            console.log('Successfully synced subscription status with Appwrite using session');
            // Clear subscription cache to force refresh
            subscriptionService.clearCache();
          } else {
            console.warn('Session-based sync failed, falling back to API key method:', sessionResult.message);
            
            // Fallback to API key method only if session method fails
            const fallbackResult = await subscriptionAPIService.upsertSubscription(
              userEmail,
              userEmail, // Using email as username fallback
              {
                subscription_status: subscriptionStatus,
                subscription_type: hasActiveSubscription ? 'premium' : 'trial',
                subscription_id: customerInfo.originalAppUserId,
                payment_platform: 'revenue_cat',
                subscription_plan_id: hasActiveSubscription ? 
                  Object.keys(customerInfo.entitlements.active)[0] || 'premium' : 
                  'trial'
              }
            );
            
            syncedWithAppwrite = fallbackResult.success;
            
            if (fallbackResult.success) {
              console.log('Successfully synced subscription status with Appwrite using API key fallback');
              subscriptionService.clearCache();
            } else {
              console.error('Both session and API key sync methods failed:', fallbackResult.message);
            }
          }
        } catch (syncError: any) {
          console.error('Error syncing with Appwrite:', syncError);
          
          // Check if it's the API key/session conflict error
          if (syncError.message?.includes('API key and session used in the same request')) {
            console.error('API key/session conflict detected - this should be handled by session-aware service');
          }
        }
      }

      const result: ValidationResult = {
        isValid: true,
        hasActiveSubscription,
        customerInfo,
        syncedWithAppwrite,
      };

      console.log('Subscription validation completed:', {
        hasActiveSubscription,
        subscriptionStatus,
        syncedWithAppwrite
      });

      // Notify listeners
      this.notifyValidationListeners(result);

      return result;

    } catch (error: any) {
      console.error('Error validating subscription status:', error);
      
      const result: ValidationResult = {
        isValid: false,
        hasActiveSubscription: false,
        syncedWithAppwrite: false,
        error: error.message || 'Validation failed'
      };

      // Notify listeners of error
      this.notifyValidationListeners(result);

      return result;
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Check if subscription needs validation
   */
  shouldValidate(): boolean {
    const timeSinceLastValidation = Date.now() - this.lastValidationTime;
    return timeSinceLastValidation > this.validationIntervalMs;
  }

  /**
   * Validate specific user's subscription
   */
  async validateUserSubscription(userEmail: string): Promise<ValidationResult> {
    console.log(`Validating subscription for user: ${userEmail}`);
    return this.validateSubscriptionStatus(userEmail);
  }

  /**
   * Get last validation time
   */
  getLastValidationTime(): Date | null {
    return this.lastValidationTime ? new Date(this.lastValidationTime) : null;
  }

  /**
   * Set validation interval (for testing or custom needs)
   */
  setValidationInterval(intervalMs: number): void {
    this.validationIntervalMs = intervalMs;
    
    // Restart periodic validation with new interval
    if (this.validationInterval) {
      this.stopPeriodicValidation();
      this.startPeriodicValidation();
    }
  }

  /**
   * Clean up listeners and intervals
   */
  destroy(): void {
    this.stopPeriodicValidation();
    this.validationCallbacks = [];
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Export singleton instance
export const subscriptionValidationService = SubscriptionValidationService.getInstance();
