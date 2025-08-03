import { confirmHasSubscription } from '@/redux/appwrite/auth/userActions';
import { database, query } from '@/redux/appwrite/config';
import { appwriteCreds } from '@/redux/appwrite/credentials';
import Purchases from 'react-native-purchases';

/**
 * Session-aware subscription service that prioritizes Appwrite subscription status
 * - Appwrite "active" subscriptions get premium access regardless of RevenueCat status
 * - Appwrite "pending" subscriptions get free trial access until upgrade
 * - Supports manual premium access, RevenueCat, and other subscription services
 * - Uses user session for authenticated users (avoids API key conflict)
 * - Falls back to API key method for unauthenticated operations
 */
export const sessionAwareSubscriptionService = {
  /**
   * Check subscription using user session with Appwrite-first priority
   * This method prioritizes Appwrite subscription status over RevenueCat
   */
  async checkSubscriptionWithSession(userEmail: string) {
    try {
      console.log('🔐 Using session-based subscription check with Appwrite priority for:', userEmail);
      
      const result = await database.listDocuments(
        appwriteCreds.databaseId!,
        appwriteCreds.subscription_collection_id!,
        [
          query.equal('user', userEmail.toLowerCase().trim()),
          query.limit(1)
        ]
      );

      if (result.documents.length > 0) {
        const subscription = result.documents[0];
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Priority 1: Active subscriptions get premium access regardless of source
        if (subscription.subscription_status === "active") {
          console.log('✅ Active subscription found in Appwrite - granting premium access');
          return {
            success: true,
            isPremium: true,
            message: "User has an active subscription.",
            subscription,
            method: 'session',
            source: subscription.payment_platform || 'appwrite_manual'
          };
        }

        // Priority 2: Pending subscriptions get free trial access
        if (subscription.subscription_status === "pending" && new Date(subscription.$createdAt) > oneWeekAgo) {
          console.log('🕒 Pending subscription found - providing free trial access');
          return {
            success: true,
            isPremium: false,
            free_trial: true,
            time_remaining: Math.ceil(
              (new Date(subscription.$createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) /
                (1000 * 60 * 60 * 24)
            ),
            message: "User is on a free trial - can upgrade via RevenueCat or other services.",
            subscription,
            method: 'session',
            source: subscription.payment_platform || 'appwrite_manual'
          };
        }

        // Priority 3: Expired or cancelled subscriptions
        console.log('❌ Found expired/cancelled subscription in Appwrite');
        return {
          success: false,
          isPremium: false,
          message: "Subscription cancelled or expired - can be reactivated via RevenueCat or other services.",
          subscription,
          method: 'session',
          source: subscription.payment_platform || 'appwrite_manual'
        };
      }

      // No Appwrite subscription found
      console.log('📝 No Appwrite subscription found - user can create one or use external services');
      return {
        success: false,
        isPremium: false,
        message: "User does not have a subscription - can subscribe via RevenueCat or other services.",
        method: 'session'
      };

    } catch (error: any) {
      console.warn('⚠️ Session-based check failed:', error.message);
      
      // Check if it's the API key conflict error
      if (error.message?.includes('API key and session used in the same request')) {
        throw new Error('AUTHENTICATION_CONFLICT: API key and session conflict detected');
      }
      
      throw error;
    }
  },

  /**
   * Check subscription with automatic method selection and Appwrite priority
   * - First checks Appwrite for active/pending subscriptions (highest priority)
   * - Falls back to RevenueCat only if no Appwrite subscription exists
   * - Supports manual premium access through Appwrite
   */
  async checkSubscriptionAuto(userEmail: string) {
    try {
      // First, try session-based approach with Appwrite priority
      const appwriteResult = await this.checkSubscriptionWithSession(userEmail);
      
      // If we found an active subscription in Appwrite, use it regardless of RevenueCat
      if (appwriteResult.success && appwriteResult.isPremium) {
        console.log('✅ Using Appwrite active subscription - no need to check RevenueCat');
        return appwriteResult;
      }
      
      // If we found a pending subscription in Appwrite, use it (free trial)
      if (appwriteResult.success && appwriteResult.free_trial) {
        console.log('🕒 Using Appwrite pending subscription for free trial');
        return appwriteResult;
      }
      
      // Only check RevenueCat if no valid Appwrite subscription exists
      console.log('🔄 No active Appwrite subscription found, checking RevenueCat as fallback');
      
      return appwriteResult; // Return the Appwrite result even if no subscription
    } catch (error: any) {
      console.log('🔄 Session method failed, falling back to API key method');
      
      if (error.message?.includes('AUTHENTICATION_CONFLICT')) {
        console.warn('🚨 Authentication conflict detected - this should not happen in production');
      }
      
      // Fallback to API key method only if session fails
      try {
        // Check if RevenueCat is configured before using it
        const isConfigured = await Purchases.isConfigured();
        
        if (!isConfigured) {
          console.warn('⚠️ RevenueCat not configured, cannot use API key fallback');
          return {
            success: false,
            isPremium: false,
            method: 'error',
            message: 'RevenueCat not configured'
          };
        }
        
        const result = await confirmHasSubscription(userEmail);
        return {
          ...result,
          method: 'api_key',
          source: 'revenue_cat_fallback'
        };
      } catch (apiError) {
        console.error('❌ Both session and API key methods failed:', apiError);
        throw apiError;
      }
    }
  },

  /**
   * Update or create Appwrite subscription (for manual premium access or external services)
   * This allows admins to grant premium access directly through Appwrite
   */
  async updateAppwriteSubscription(userEmail: string, subscriptionData: {
    subscription_status: 'active' | 'pending' | 'cancelled' | 'expired';
    subscription_type?: string;
    subscription_plan_id?: string;
    payment_platform?: string;
    notes?: string;
  }) {
    try {
      console.log('🔧 Updating Appwrite subscription for:', userEmail, subscriptionData);
      
      // Find existing subscription
      const result = await database.listDocuments(
        appwriteCreds.databaseId!,
        appwriteCreds.subscription_collection_id!,
        [
          query.equal('user', userEmail.toLowerCase().trim()),
          query.limit(1)
        ]
      );

      const updateData = {
        user: userEmail.toLowerCase().trim(),
        subscription_status: subscriptionData.subscription_status,
        subscription_type: subscriptionData.subscription_type || 'manual',
        subscription_plan_id: subscriptionData.subscription_plan_id || 'manual_premium',
        payment_platform: subscriptionData.payment_platform || 'manual_admin',
        notes: subscriptionData.notes || 'Manually managed subscription',
        $updatedAt: new Date().toISOString()
      };

      if (result.documents.length > 0) {
        // Update existing subscription
        const existingDoc = result.documents[0];
        await database.updateDocument(
          appwriteCreds.databaseId!,
          appwriteCreds.subscription_collection_id!,
          existingDoc.$id,
          updateData
        );
        console.log('✅ Successfully updated existing Appwrite subscription');
      } else {
        // Create new subscription
        await database.createDocument(
          appwriteCreds.databaseId!,
          appwriteCreds.subscription_collection_id!,
          'unique()',
          updateData
        );
        console.log('✅ Successfully created new Appwrite subscription');
      }

      return {
        success: true,
        message: 'Subscription updated successfully',
        method: 'manual_update'
      };
    } catch (error: any) {
      console.error('❌ Failed to update Appwrite subscription:', error);
      return {
        success: false,
        message: error.message || 'Failed to update subscription',
        method: 'manual_update_error'
      };
    }
  },

  /**
   * Determine the best authentication method to use
   */
  async getBestAuthMethod(userEmail: string) {
    try {
      await this.checkSubscriptionWithSession(userEmail);
      return 'session';
    } catch (error: any) {
      if (error.message?.includes('AUTHENTICATION_CONFLICT')) {
        return 'conflict_detected';
      }
      return 'api_key';
    }
  },

  /**
   * Get subscription source priority for a user
   * Returns which subscription source should be trusted first
   */
  async getSubscriptionSourcePriority(userEmail: string) {
    try {
      const appwriteResult = await this.checkSubscriptionWithSession(userEmail);
      
      return {
        primary: 'appwrite',
        hasAppwriteSubscription: appwriteResult.success || appwriteResult.subscription,
        shouldCheckRevenueCat: !appwriteResult.success || !appwriteResult.isPremium,
        recommendation: appwriteResult.success && appwriteResult.isPremium 
          ? 'Use Appwrite subscription only' 
          : 'Check RevenueCat as secondary source'
      };
    } catch (error: any) {
      console.warn('Error checking Appwrite subscription priority:', error.message);
      return {
        primary: 'revenue_cat',
        hasAppwriteSubscription: false,
        shouldCheckRevenueCat: true,
        recommendation: 'Use RevenueCat due to Appwrite access issues'
      };
    }
  }
};
