import { confirmHasSubscription } from '@/redux/appwrite/auth/userActions';
import { appwriteSubscriptionListener } from '@/services/subscription/appwriteSubscriptionListener';
import { sessionAwareSubscriptionService } from '@/services/subscription/sessionAwareSubscriptionService';
import { subscriptionValidationService } from '@/services/subscription/subscriptionValidationService';
import Purchases from 'react-native-purchases';

/**
 * Debug utility for testing subscription validation logic
 * This includes hybrid validation to protect against data loss
 */
export const debugSubscription = {
  /**
   * Check Appwrite subscription using session-aware service
   */
  async checkAppwriteSubscriptionWithSession(userEmail: string) {
    console.log('🔍 Checking Appwrite subscription with session-aware service for:', userEmail);
    
    try {
      const result = await sessionAwareSubscriptionService.checkSubscriptionWithSession(userEmail);
      
      console.log('📋 Session-aware subscription result:', {
        success: result.success,
        method: result.method,
        message: result.message
      });

      return result;
    } catch (error: any) {
      console.error('❌ Session-aware subscription check failed:', error);
      return {
        success: false,
        method: 'error',
        message: error.message || 'Unknown error'
      };
    }
  },

  /**
   * Check RevenueCat subscription
   */
  async checkRevenueCat() {
    console.log('🧾 Checking RevenueCat subscription...');
    
    try {
      // Check if RevenueCat is configured before using it
      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) {
        console.warn('⚠️ RevenueCat not configured, skipping check');
        return {
          success: false,
          message: 'RevenueCat not configured'
        };
      }

      // confirmHasSubscription expects userEmail parameter
      const result = await confirmHasSubscription('debug@test.com');
      console.log('📊 RevenueCat result:', result);
      return result;
    } catch (error: any) {
      console.error('❌ RevenueCat check failed:', error);
      return {
        success: false,
        message: error.message || 'RevenueCat check failed'
      };
    }
  },

  /**
   * Hybrid validation that protects against data loss
   * If either source shows active subscription, user keeps access
   */
  async hybridValidationWithSession(userEmail: string) {
    console.log('🔬 Starting hybrid validation with session-aware auth for:', userEmail);
    
    const results = {
      revenueCat: await this.checkRevenueCat(),
      appwrite: await this.checkAppwriteSubscriptionWithSession(userEmail)
    };

    console.log('📊 Hybrid validation results:', results);

    // Protective logic: If either shows active, user gets access
    const hasActiveRevenueCat = results.revenueCat?.success === true;
    const hasActiveAppwrite = results.appwrite?.success === true;
    
    const overallStatus = hasActiveRevenueCat || hasActiveAppwrite;
    
    // Determine the source of truth
    let source = 'none';
    if (hasActiveRevenueCat && hasActiveAppwrite) {
      source = 'both';
    } else if (hasActiveRevenueCat) {
      source = 'revenueCat';
    } else if (hasActiveAppwrite) {
      source = 'appwrite';
    }

    console.log(`🎯 Hybrid validation result: ${overallStatus ? 'ACTIVE' : 'INACTIVE'} (source: ${source})`);

    return {
      success: overallStatus,
      source,
      details: results,
      message: overallStatus 
        ? `Subscription active (verified via ${source})`
        : 'No active subscription found'
    };
  },

  /**
   * Full sync with hybrid protection using session-based authentication
   */
  async fullSyncHybridWithSession(userEmail: string, showNotification = true) {
    console.log('🔄 Starting full sync with hybrid protection using session auth...');
    
    try {
      // Check if RevenueCat is configured before proceeding
      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) {
        console.warn('⚠️ RevenueCat not configured, using Appwrite-only validation');
        
        // Just check Appwrite subscription when RevenueCat isn't available
        const appwriteResult = await this.checkAppwriteSubscriptionWithSession(userEmail);
        
        if (showNotification) {
          console.log('ℹ️ RevenueCat not available, checked Appwrite only');
        }
        
        return {
          success: appwriteResult.success,
          message: appwriteResult.success 
            ? 'Subscription verified (Appwrite only - RevenueCat not configured)'
            : 'No active subscription found',
          appwriteOnly: true,
          result: appwriteResult
        };
      }

      // First do hybrid validation to check current status
      const hybridResult = await this.hybridValidationWithSession(userEmail);
      
      // If user has active subscription, proceed with sync
      if (hybridResult.success) {
        console.log('✅ User has active subscription, proceeding with sync...');
        
        // Trigger the validation service sync
        await subscriptionValidationService.validateSubscriptionStatus();
        
        if (showNotification) {
          console.log('🎉 Sync completed successfully!');
        }
        
        return {
          success: true,
          message: 'Subscription synced successfully',
          hybridResult
        };
      } else {
        console.log('⚠️ No active subscription found, sync not needed');
        
        if (showNotification) {
          console.log('ℹ️ No active subscription to sync');
        }
        
        return {
          success: false,
          message: 'No active subscription found',
          hybridResult
        };
      }
      
    } catch (error: any) {
      console.error('❌ Full sync failed:', error);
      
      if (showNotification) {
        console.error('❌ Sync failed: ' + error.message);
      }
      
      return {
        success: false,
        message: error.message || 'Sync failed',
        error: error
      };
    }
  },

  /**
   * Test the Appwrite subscription listener
   */
  async testAppwriteListener(userEmail: string, callback?: (change: any) => void) {
    console.log('👂 Testing Appwrite subscription listener for user:', userEmail);
    
    try {
      // Register callback if provided
      let removeListener: (() => void) | undefined;
      if (callback) {
        removeListener = appwriteSubscriptionListener.addChangeListener(callback);
      }
      
      // Start listening (only takes userEmail parameter)
      appwriteSubscriptionListener.startListening(userEmail);
      
      console.log('✅ Listener started successfully');
      
      // Return cleanup function
      return {
        success: true,
        cleanup: () => {
          appwriteSubscriptionListener.stopListening();
          if (removeListener) {
            removeListener();
          }
        },
        message: 'Listener started successfully'
      };
      
    } catch (error: any) {
      console.error('❌ Failed to start listener:', error);
      return {
        success: false,
        message: error.message || 'Failed to start listener'
      };
    }
  }
};

// Export individual functions for direct use
export const checkAppwriteSubscriptionWithSession = debugSubscription.checkAppwriteSubscriptionWithSession.bind(debugSubscription);
export const checkRevenueCat = debugSubscription.checkRevenueCat.bind(debugSubscription);
export const hybridValidationWithSession = debugSubscription.hybridValidationWithSession.bind(debugSubscription);
export const fullSyncHybridWithSession = debugSubscription.fullSyncHybridWithSession.bind(debugSubscription);
export const testAppwriteListener = debugSubscription.testAppwriteListener.bind(debugSubscription);
