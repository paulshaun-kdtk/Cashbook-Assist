import { sessionAwareSubscriptionService } from './sessionAwareSubscriptionService';
import { subscriptionService } from './subscriptionService';

/**
 * Manual subscription management service for admin use
 * Provides utilities for manually managing user subscriptions through Appwrite
 */
export const manualSubscriptionService = {
  /**
   * Grant premium access to a user manually
   * Useful for testing, promotions, or manual premium grants
   */
  async grantPremiumAccess(userEmail: string, options?: {
    planId?: string;
    notes?: string;
    source?: string;
  }) {
    console.log('🎁 Granting premium access to:', userEmail);
    const result = await sessionAwareSubscriptionService.updateAppwriteSubscription(userEmail, {
      subscription_status: 'active',
      subscription_type: 'premium',
      subscription_plan_id: options?.planId || 'manual_premium',
      payment_platform: options?.source || 'manual_admin',
      notes: options?.notes || 'Manually granted premium access'
    });
    
    // Clear cache to ensure fresh subscription status
    if (result.success) {
      console.log('✅ Premium access granted, clearing subscription cache');
      subscriptionService.clearCache();
    }
    
    return result;
  },

  /**
   * Start a free trial for a user manually
   * Useful for extending trials or starting trials outside normal flow
   */
  async startFreeTrial(userEmail: string, options?: {
    notes?: string;
    source?: string;
  }) {
    console.log('🆓 Starting free trial for:', userEmail);
    const result = await sessionAwareSubscriptionService.updateAppwriteSubscription(userEmail, {
      subscription_status: 'pending',
      subscription_type: 'trial',
      subscription_plan_id: 'free_trial',
      payment_platform: options?.source || 'manual_admin',
      notes: options?.notes || 'Manually started free trial'
    });
    
    // Clear cache to ensure fresh subscription status
    if (result.success) {
      console.log('✅ Free trial started, clearing subscription cache');
      subscriptionService.clearCache();
    }
    
    return result;
  },

  /**
   * Revoke premium access from a user
   * Sets subscription to expired state
   */
  async revokePremiumAccess(userEmail: string, options?: {
    notes?: string;
  }) {
    console.log('❌ Revoking premium access for:', userEmail);
    const result = await sessionAwareSubscriptionService.updateAppwriteSubscription(userEmail, {
      subscription_status: 'expired',
      subscription_type: 'expired',
      subscription_plan_id: 'revoked',
      payment_platform: 'manual_admin',
      notes: options?.notes || 'Premium access manually revoked'
    });
    
    // Clear cache to ensure fresh subscription status
    if (result.success) {
      console.log('✅ Premium access revoked, clearing subscription cache');
      subscriptionService.clearCache();
    }
    
    return result;
  },

  /**
   * Cancel a user's subscription but allow grace period
   * Sets to cancelled state
   */
  async cancelSubscription(userEmail: string, options?: {
    notes?: string;
  }) {
    console.log('🚫 Cancelling subscription for:', userEmail);
    const result = await sessionAwareSubscriptionService.updateAppwriteSubscription(userEmail, {
      subscription_status: 'cancelled',
      subscription_type: 'cancelled',
      subscription_plan_id: 'cancelled',
      payment_platform: 'manual_admin',
      notes: options?.notes || 'Subscription manually cancelled'
    });
    
    // Clear cache to ensure fresh subscription status
    if (result.success) {
      console.log('✅ Subscription cancelled, clearing subscription cache');
      subscriptionService.clearCache();
    }
    
    return result;
  },

  /**
   * Set subscription from external service (non-RevenueCat)
   * Useful for integrating other payment providers
   */
  async setExternalSubscription(userEmail: string, options: {
    paymentProvider: string;
    planId: string;
    subscriptionId?: string;
    notes?: string;
    isActive?: boolean;
  }) {
    console.log(`💳 Setting external subscription for ${userEmail} via ${options.paymentProvider}`);
    const result = await sessionAwareSubscriptionService.updateAppwriteSubscription(userEmail, {
      subscription_status: options.isActive ? 'active' : 'pending',
      subscription_type: options.isActive ? 'premium' : 'trial',
      subscription_plan_id: options.planId,
      payment_platform: options.paymentProvider,
      notes: options.notes || `External subscription from ${options.paymentProvider}`
    });
    
    // Clear cache to ensure fresh subscription status
    if (result.success) {
      console.log('✅ External subscription set, clearing subscription cache');
      subscriptionService.clearCache();
    }
    
    return result;
  },

  /**
   * Bulk operation to grant premium access to multiple users
   * Useful for promotions or migrations
   */
  async bulkGrantPremium(userEmails: string[], options?: {
    planId?: string;
    notes?: string;
    source?: string;
  }) {
    const results = [];
    
    for (const email of userEmails) {
      try {
        const result = await this.grantPremiumAccess(email, options);
        results.push({ email, success: result.success, message: result.message });
      } catch (error: any) {
        results.push({ email, success: false, message: error.message });
      }
    }
    
    return {
      totalProcessed: userEmails.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  },

  /**
   * Get subscription status with source information
   * Useful for debugging subscription sources
   */
  async getSubscriptionDetails(userEmail: string) {
    const subscriptionResult = await sessionAwareSubscriptionService.checkSubscriptionAuto(userEmail);
    const priority = await sessionAwareSubscriptionService.getSubscriptionSourcePriority(userEmail);
    
    return {
      subscription: subscriptionResult,
      sourcePriority: priority,
      recommendation: priority.recommendation,
      debugInfo: {
        hasAppwriteSubscription: priority.hasAppwriteSubscription,
        shouldCheckRevenueCat: priority.shouldCheckRevenueCat,
        primarySource: priority.primary
      }
    };
  }
};
