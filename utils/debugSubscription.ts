import { confirmHasSubscription } from '@/redux/appwrite/auth/userActions';
import { database, query } from '@/redux/appwrite/config';
import { appwriteCreds } from '@/redux/appwrite/credentials';
import { appwriteSubscriptionListener } from '@/services/subscription/appwriteSubscriptionListener';
import { subscriptionValidationService } from '@/services/subscription/subscriptionValidationService';

/**
 * Debug utility to manually trigger subscription validation
 * Use this in development to force sync after manual Appwrite changes
 */
export const debugSubscription = {
  /**
   * Check Appwrite subscription status using user session (not API key)
   */
  async checkAppwriteSubscriptionWithSession(userEmail: string) {
    console.log('🔍 Checking Appwrite subscription with user session for:', userEmail);
    
    try {
      // Use the session-based database client instead of fetch with API key
      const result = await database.listDocuments(
        appwriteCreds.databaseId!,
        appwriteCreds.subscription_collection_id!,
        [
          query.equal('user', userEmail.toLowerCase().trim()),
          query.limit(1)
        ]
      );

      console.log('📋 Session-based subscription result:', result);

      if (result.documents.length > 0) {
        const subscription = result.documents[0];
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        if (subscription.subscription_status === "pending" && new Date(subscription.$createdAt) > oneWeekAgo) {
          return {
            success: true,
            free_trial: true,
            time_remaining: Math.ceil(
              (new Date(subscription.$createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) /
                (1000 * 60 * 60 * 24)
            ),
            message: "User is on a free trial.",
            subscription,
            documents: result.documents
          };
        }

        if (subscription.subscription_status === "active") {
          return {
            success: true,
            message: "User has an active subscription.",
            subscription,
            documents: result.documents
          };
        }

        return {
          success: false,
          message: "Subscription cancelled or expired.",
          subscription,
          documents: result.documents
        };
      }

      return {
        success: false,
        message: "User does not have a subscription.",
        documents: result.documents
      };

    } catch (error) {
      console.error('❌ Session-based Appwrite check failed:', error);
      throw error;
    }
  },

  /**
   * Check Appwrite subscription status directly (fallback to API key method)
   */
  async checkAppwriteSubscription(userEmail: string) {
    console.log('🔍 Checking Appwrite subscription for:', userEmail);
    
    try {
      const result = await confirmHasSubscription(userEmail);
      console.log('📋 Appwrite subscription result:', result);
      return result;
    } catch (error) {
      console.error('❌ Appwrite check failed:', error);
      throw error;
    }
  },

  /**
   * Hybrid validation that respects both Appwrite and RevenueCat (session-based)
   */
  async hybridValidationWithSession(userEmail: string) {
    console.log('🔄 Starting session-based hybrid validation for:', userEmail);
    
    try {
      // 1. Check Appwrite with user session (safer for authenticated users)
      const appwriteResult = await this.checkAppwriteSubscriptionWithSession(userEmail);
      
      // 2. Check RevenueCat
      const revenueCatResult = await subscriptionValidationService.validateUserSubscription(userEmail);
      
      console.log('📊 Session-based validation comparison:', {
        appwrite: {
          hasSubscription: appwriteResult.success,
          status: appwriteResult.subscription?.subscription_status,
          freeTrial: appwriteResult.free_trial
        },
        revenueCat: {
          hasSubscription: revenueCatResult.hasActiveSubscription,
          isValid: revenueCatResult.isValid
        }
      });

      // 3. Determine final status
      let finalStatus = 'expired';
      let shouldPreserveAppwrite = false;

      if (appwriteResult.success) {
        if (appwriteResult.subscription?.subscription_status === 'active') {
          // User has active Appwrite subscription
          if (!revenueCatResult.hasActiveSubscription) {
            console.log('⚠️ WARNING: Active Appwrite subscription but no RevenueCat record');
            console.log('🛡️ PRESERVING Appwrite subscription to prevent data loss');
            shouldPreserveAppwrite = true;
            finalStatus = 'active';
          } else {
            // Both systems agree - active
            finalStatus = 'active';
          }
        } else if (appwriteResult.free_trial) {
          // Free trial
          finalStatus = 'pending';
        }
      } else if (revenueCatResult.hasActiveSubscription) {
        // RevenueCat has subscription but Appwrite doesn't
        console.log('📝 RevenueCat subscription found, syncing to Appwrite');
        finalStatus = 'active';
      }

      return {
        appwriteResult,
        revenueCatResult,
        finalStatus,
        shouldPreserveAppwrite,
        recommendation: this.getRecommendation(appwriteResult, revenueCatResult)
      };

    } catch (error) {
      console.error('❌ Session-based hybrid validation failed:', error);
      
      // Fallback to API key method if session fails
      console.log('🔄 Falling back to API key method...');
      return await this.hybridValidation(userEmail);
    }
  },

  /**
   * Hybrid validation that respects both Appwrite and RevenueCat
   */
  async hybridValidation(userEmail: string) {
    console.log('🔄 Starting hybrid validation for:', userEmail);
    
    try {
      // 1. Check Appwrite first
      const appwriteResult = await this.checkAppwriteSubscription(userEmail);
      
      // 2. Check RevenueCat
      const revenueCatResult = await subscriptionValidationService.validateUserSubscription(userEmail);
      
      console.log('📊 Validation comparison:', {
        appwrite: {
          hasSubscription: appwriteResult.success,
          status: appwriteResult.subscription?.subscription_status,
          freeTrial: appwriteResult.free_trial
        },
        revenueCat: {
          hasSubscription: revenueCatResult.hasActiveSubscription,
          isValid: revenueCatResult.isValid
        }
      });

      // 3. Determine final status
      let finalStatus = 'expired';
      let shouldPreserveAppwrite = false;

      if (appwriteResult.success) {
        if (appwriteResult.subscription?.subscription_status === 'active') {
          // User has active Appwrite subscription
          if (!revenueCatResult.hasActiveSubscription) {
            console.log('⚠️ WARNING: Active Appwrite subscription but no RevenueCat record');
            console.log('🛡️ PRESERVING Appwrite subscription to prevent data loss');
            shouldPreserveAppwrite = true;
            finalStatus = 'active';
          } else {
            // Both systems agree - active
            finalStatus = 'active';
          }
        } else if (appwriteResult.free_trial) {
          // Free trial
          finalStatus = 'pending';
        }
      } else if (revenueCatResult.hasActiveSubscription) {
        // RevenueCat has subscription but Appwrite doesn't
        console.log('📝 RevenueCat subscription found, syncing to Appwrite');
        finalStatus = 'active';
      }

      return {
        appwriteResult,
        revenueCatResult,
        finalStatus,
        shouldPreserveAppwrite,
        recommendation: this.getRecommendation(appwriteResult, revenueCatResult)
      };

    } catch (error) {
      console.error('❌ Hybrid validation failed:', error);
      throw error;
    }
  },

  /**
   * Get recommendation based on validation results
   */
  getRecommendation(appwriteResult: any, revenueCatResult: any) {
    if (appwriteResult.success && appwriteResult.subscription?.subscription_status === 'active' && !revenueCatResult.hasActiveSubscription) {
      return {
        type: 'preserve_appwrite',
        message: 'Active Appwrite subscription without RevenueCat record - preserving Appwrite data',
        action: 'Manual investigation needed - possible admin-granted subscription'
      };
    }
    
    if (!appwriteResult.success && revenueCatResult.hasActiveSubscription) {
      return {
        type: 'sync_to_appwrite',
        message: 'RevenueCat subscription found - syncing to Appwrite',
        action: 'Normal sync operation'
      };
    }
    
    if (appwriteResult.success && revenueCatResult.hasActiveSubscription) {
      return {
        type: 'both_active',
        message: 'Both systems have active subscriptions - normal operation',
        action: 'Continue with standard validation'
      };
    }
    
    return {
      type: 'no_subscription',
      message: 'No active subscriptions found in either system',
      action: 'User should upgrade or check subscription status'
    };
  },
  /**
   * Complete subscription sync with session-based hybrid logic
   */
  async fullSyncHybridWithSession(userEmail: string) {
    console.log('🚀 Starting session-based hybrid sync for:', userEmail);
    
    // 1. Restart listener
    this.restartListener(userEmail);
    
    // 2. Wait for listener to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Run session-based hybrid validation
    const hybridResult = await this.hybridValidationWithSession(userEmail);
    
    // 4. Handle the result based on recommendation
    switch (hybridResult.recommendation.type) {
      case 'preserve_appwrite':
        console.log('🛡️ Preserving Appwrite subscription data');
        // Don't overwrite - just clear cache to refresh UI
        break;
      
      case 'sync_to_appwrite':
        console.log('📝 Syncing RevenueCat to Appwrite');
        await this.forceValidation(userEmail);
        break;
      
      case 'both_active':
        console.log('✅ Both systems active - standard sync');
        await this.forceValidation(userEmail);
        break;
      
      case 'no_subscription':
        console.log('❌ No subscriptions found - standard validation');
        await this.forceValidation(userEmail);
        break;
    }
    
    console.log('✅ Session-based hybrid sync completed');
    return hybridResult;
  },

  /**
   * Complete subscription sync with hybrid logic
   */
  async fullSyncHybrid(userEmail: string) {
    console.log('🚀 Starting hybrid full sync for:', userEmail);
    
    // 1. Restart listener
    this.restartListener(userEmail);
    
    // 2. Wait for listener to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Run hybrid validation
    const hybridResult = await this.hybridValidation(userEmail);
    
    // 4. Handle the result based on recommendation
    switch (hybridResult.recommendation.type) {
      case 'preserve_appwrite':
        console.log('🛡️ Preserving Appwrite subscription data');
        // Don't overwrite - just clear cache to refresh UI
        break;
      
      case 'sync_to_appwrite':
        console.log('📝 Syncing RevenueCat to Appwrite');
        await this.forceValidation(userEmail);
        break;
      
      case 'both_active':
        console.log('✅ Both systems active - standard sync');
        await this.forceValidation(userEmail);
        break;
      
      case 'no_subscription':
        console.log('❌ No subscriptions found - standard validation');
        await this.forceValidation(userEmail);
        break;
    }
    
    console.log('✅ Hybrid sync completed');
    return hybridResult;
  },

  /**
   * Force immediate validation for a user
   */
  async forceValidation(userEmail: string) {
    console.log('🔄 Forcing subscription validation for:', userEmail);
    
    try {
      const result = await subscriptionValidationService.validateUserSubscription(userEmail);
      console.log('✅ Validation result:', result);
      return result;
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  },

  /**
   * Check if Appwrite listener is active
   */
  checkListenerStatus() {
    const isListening = appwriteSubscriptionListener.isCurrentlyListening();
    console.log('🎧 Appwrite listener status:', isListening ? 'ACTIVE' : 'INACTIVE');
    return isListening;
  },

  /**
   * Restart Appwrite listener for a user
   */
  restartListener(userEmail: string) {
    console.log('🔄 Restarting Appwrite listener for:', userEmail);
    
    // Stop and restart listener
    appwriteSubscriptionListener.stopListening();
    appwriteSubscriptionListener.startListening(userEmail);
    
    console.log('✅ Listener restarted');
  },

  /**
   * Complete subscription sync - listener + validation
   */
  async fullSync(userEmail: string) {
    console.log('🚀 Starting full subscription sync for:', userEmail);
    
    // 1. Restart listener
    this.restartListener(userEmail);
    
    // 2. Wait a moment for listener to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Force validation
    const result = await this.forceValidation(userEmail);
    
    console.log('✅ Full sync completed');
    return result;
  }
};
