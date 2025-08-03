/**
 * Test file demonstrating the enhanced subscription system usage
 * This file shows examples of how to use the new Appwrite-priority subscription logic
 */

import { manualSubscriptionService } from '../services/subscription/manualSubscriptionService';
import { sessionAwareSubscriptionService } from '../services/subscription/sessionAwareSubscriptionService';
import { subscriptionService } from '../services/subscription/subscriptionService';

/**
 * Example 1: Basic subscription check with Appwrite priority
 */
export async function checkUserSubscription(userEmail: string) {
  console.log('🔍 Checking subscription for:', userEmail);
  
  try {
    // This will check Appwrite first, then fall back to RevenueCat if needed
    const result = await sessionAwareSubscriptionService.checkSubscriptionAuto(userEmail);
    
    console.log('Subscription result:', {
      success: result.success,
      isPremium: (result as any).isPremium,
      source: (result as any).source || (result as any).method,
      freeTrial: result.free_trial
    });
    
    return result;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { success: false, message: 'Failed to check subscription' };
  }
}

/**
 * Example 2: Grant premium access manually (for testing/admin use)
 */
export async function grantTestPremiumAccess(userEmail: string) {
  console.log('🎁 Granting test premium access to:', userEmail);
  
  try {
    // Check status before granting premium
    console.log('📊 Status before granting premium:');
    const beforeStatus = await checkUserSubscription(userEmail);
    
    const result = await manualSubscriptionService.grantPremiumAccess(userEmail, {
      planId: 'test_premium',
      notes: 'Premium access for testing premium features',
      source: 'testing'
    });
    
    if (result.success) {
      console.log('✅ Premium access granted successfully');
      
      // Wait a moment for cache to clear
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the change took effect
      console.log('📊 Verifying premium access activation:');
      const verification = await checkUserSubscription(userEmail);
      
      console.log('🔄 Status comparison:', {
        before: { 
          success: beforeStatus.success, 
          isPremium: (beforeStatus as any).isPremium,
          freeTrial: (beforeStatus as any).free_trial 
        },
        after: { 
          success: verification.success, 
          isPremium: (verification as any).isPremium,
          freeTrial: (verification as any).free_trial 
        }
      });
      
      // Force refresh to double-check
      console.log('🔄 Force refreshing subscription service:');
      const forceRefresh = await subscriptionService.forceRefreshSubscriptionStatus({ email: userEmail });
      console.log('💯 Force refresh result:', {
        isPremium: forceRefresh.isPremium,
        isFreeTrial: forceRefresh.isFreeTrial,
        subscriptionStatus: forceRefresh.subscriptionStatus
      });
    } else {
      console.log('❌ Failed to grant premium access:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error granting premium access:', error);
    return { success: false, message: 'Failed to grant premium access' };
  }
}

/**
 * Example 3: Start free trial manually
 */
export async function startTestFreeTrial(userEmail: string) {
  console.log('🆓 Starting free trial for:', userEmail);
  
  try {
    const result = await manualSubscriptionService.startFreeTrial(userEmail, {
      notes: 'Free trial started for new user testing',
      source: 'testing'
    });
    
    if (result.success) {
      console.log('✅ Free trial started successfully');
    } else {
      console.log('❌ Failed to start free trial:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error starting free trial:', error);
    return { success: false, message: 'Failed to start free trial' };
  }
}

/**
 * Example 4: Set subscription from external service (non-RevenueCat)
 */
export async function setExternalSubscription(userEmail: string, provider: string, planId: string) {
  console.log(`💳 Setting external subscription for ${userEmail} via ${provider}`);
  
  try {
    const result = await manualSubscriptionService.setExternalSubscription(userEmail, {
      paymentProvider: provider,
      planId: planId,
      subscriptionId: `ext_${Date.now()}`,
      isActive: true,
      notes: `Subscription via ${provider} payment system`
    });
    
    if (result.success) {
      console.log('✅ External subscription set successfully');
    } else {
      console.log('❌ Failed to set external subscription:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error setting external subscription:', error);
    return { success: false, message: 'Failed to set external subscription' };
  }
}

/**
 * Example 5: Check subscription with detailed source information
 */
export async function getDetailedSubscriptionInfo(userEmail: string) {
  console.log('📊 Getting detailed subscription info for:', userEmail);
  
  try {
    const details = await manualSubscriptionService.getSubscriptionDetails(userEmail);
    
    console.log('Detailed subscription info:', {
      subscription: details.subscription,
      primarySource: details.sourcePriority.primary,
      hasAppwriteSubscription: details.debugInfo.hasAppwriteSubscription,
      shouldCheckRevenueCat: details.debugInfo.shouldCheckRevenueCat,
      recommendation: details.recommendation
    });
    
    return details;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return null;
  }
}

/**
 * Example 6: Use with existing subscription service (for app logic)
 */
export async function checkAppFeatureAccess(user: any) {
  console.log('🎯 Checking feature access for user:', user?.email);
  
  try {
    // The existing subscription service now uses Appwrite-first logic
    const status = await subscriptionService.getUserSubscriptionStatus(user);
    
    console.log('User subscription status:', {
      isPremium: status.isPremium,
      isFreeTrial: status.isFreeTrial,
      subscriptionStatus: status.subscriptionStatus,
      limits: status.limits
    });
    
    // Check specific feature access
    const canCreateCompany = await subscriptionService.canCreateCompany(user, 1);
    const canCreateCashbook = await subscriptionService.canCreateCashbook(user, 1);
    const canCreateTransaction = await subscriptionService.canCreateTransaction(user, 500);
    
    console.log('Feature access:', {
      canCreateCompany: canCreateCompany.allowed,
      canCreateCashbook: canCreateCashbook.allowed,
      canCreateTransaction: canCreateTransaction.allowed
    });
    
    return {
      status,
      featureAccess: {
        canCreateCompany,
        canCreateCashbook,
        canCreateTransaction
      }
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return null;
  }
}

/**
 * Example 7: Bulk premium access for promotions
 */
export async function grantPromotionalAccess(userEmails: string[]) {
  console.log('🎉 Granting promotional access to multiple users:', userEmails.length);
  
  try {
    const result = await manualSubscriptionService.bulkGrantPremium(userEmails, {
      planId: 'promotional_premium',
      notes: 'Holiday promotion - 30 days premium access',
      source: 'promotional'
    });
    
    console.log('Bulk promotion results:', {
      totalProcessed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed
    });
    
    return result;
  } catch (error) {
    console.error('Error with bulk promotion:', error);
    return null;
  }
}

/**
 * Example usage in a React Native component or service
 */
export const SubscriptionTestService = {
  checkUserSubscription,
  grantTestPremiumAccess,
  startTestFreeTrial,
  setExternalSubscription,
  getDetailedSubscriptionInfo,
  checkAppFeatureAccess,
  grantPromotionalAccess,
  debugFreeTrialBanner
};

/**
 * Quick test function - call this to test the subscription system
 */
export async function runSubscriptionTests(testUserEmail: string) {
  console.log('🧪 Running subscription system tests...');
  
  try {
    // 1. Check initial status
    console.log('\n1. Initial subscription check:');
    await checkUserSubscription(testUserEmail);
    
    // 2. Grant premium access
    console.log('\n2. Granting premium access:');
    await grantTestPremiumAccess(testUserEmail);
    
    // 3. Check detailed info
    console.log('\n3. Getting detailed info:');
    await getDetailedSubscriptionInfo(testUserEmail);
    
    // 4. Check feature access
    console.log('\n4. Checking feature access:');
    await checkAppFeatureAccess({ email: testUserEmail });
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Specific test to debug free trial banner issues
 * This function helps identify why the free trial banner shows for premium users
 */
export async function debugFreeTrialBanner(userEmail: string) {
  console.log('🐛 Debugging free trial banner issue for:', userEmail);
  
  try {
    // 1. Clear any cached data
    console.log('\n🗑️ Step 1: Clearing all caches');
    subscriptionService.clearCache();
    
    // 2. Check raw subscription data
    console.log('\n📊 Step 2: Raw subscription check');
    const rawResult = await sessionAwareSubscriptionService.checkSubscriptionAuto(userEmail);
    console.log('Raw result:', {
      success: rawResult.success,
      isPremium: (rawResult as any).isPremium,
      freeTrial: (rawResult as any).free_trial,
      method: (rawResult as any).method,
      source: (rawResult as any).source,
      subscription_status: (rawResult as any).subscription?.subscription_status
    });
    
    // 3. Check processed subscription status
    console.log('\n🏗️ Step 3: Processed subscription status');
    const processedStatus = await subscriptionService.getUserSubscriptionStatus({ email: userEmail });
    console.log('Processed status:', {
      isPremium: processedStatus.isPremium,
      isFreeTrial: processedStatus.isFreeTrial,
      subscriptionStatus: processedStatus.subscriptionStatus,
      limits: processedStatus.limits
    });
    
    // 4. Force refresh and check again
    console.log('\n🔄 Step 4: Force refresh');
    const refreshedStatus = await subscriptionService.forceRefreshSubscriptionStatus({ email: userEmail });
    console.log('Refreshed status:', {
      isPremium: refreshedStatus.isPremium,
      isFreeTrial: refreshedStatus.isFreeTrial,
      subscriptionStatus: refreshedStatus.subscriptionStatus
    });
    
    // 5. Analysis
    console.log('\n🔍 Step 5: Analysis');
    if (rawResult.success && (rawResult as any).isPremium) {
      console.log('✅ Raw data shows premium subscription');
      if (processedStatus.isPremium) {
        console.log('✅ Processed data correctly shows premium');
        console.log('🎯 Free trial banner should NOT be visible');
      } else {
        console.log('❌ Processed data incorrectly shows free trial');
        console.log('🐛 BUG: Processing logic is not recognizing premium status');
      }
    } else if (rawResult.success && (rawResult as any).free_trial) {
      console.log('🕒 Raw data shows free trial');
      console.log('🎯 Free trial banner SHOULD be visible');
    } else {
      console.log('❌ No subscription found');
      console.log('🎯 Free trial banner SHOULD be visible (to encourage signup)');
    }
    
    return {
      rawResult,
      processedStatus,
      refreshedStatus,
      analysis: {
        shouldShowFreeTrial: !((rawResult as any).isPremium),
        actuallyShowingFreeTrial: processedStatus.isFreeTrial,
        isWorking: !((rawResult as any).isPremium) === processedStatus.isFreeTrial
      }
    };
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return null;
  }
}

// Export for easy testing
export default SubscriptionTestService;
