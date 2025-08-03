# Free Trial Banner Debug Guide

## Issue Description
The free trial banner is showing even when a user's subscription activates and they should have premium access.

## Root Cause Analysis

The issue is likely caused by one of these factors:

1. **Cached subscription status** - The subscription service cache isn't being cleared when status changes
2. **Timing issues** - The subscription status update hasn't propagated yet
3. **Logic errors** - The premium detection logic isn't working correctly
4. **Appwrite data issues** - The subscription status in Appwrite isn't set to "active"

## Debug Steps

### 1. Use the Debug Function

```typescript
import { SubscriptionTestService } from '@/utils/subscriptionTestService';

// Run this for any user showing the wrong banner
const debugResult = await SubscriptionTestService.debugFreeTrialBanner('user@example.com');
console.log('Debug result:', debugResult);
```

### 2. Manual Debug Steps

#### Step A: Check Raw Appwrite Data
```typescript
import { sessionAwareSubscriptionService } from '@/services/subscription/sessionAwareSubscriptionService';

const rawResult = await sessionAwareSubscriptionService.checkSubscriptionAuto('user@example.com');
console.log('Raw subscription data:', rawResult);
```

**Expected for Premium User:**
```json
{
  "success": true,
  "isPremium": true,
  "subscription": {
    "subscription_status": "active"
  }
}
```

**If showing free trial instead:**
```json
{
  "success": true,
  "free_trial": true,
  "subscription": {
    "subscription_status": "pending"
  }
}
```

#### Step B: Check Processed Status
```typescript
import { subscriptionService } from '@/services/subscription/subscriptionService';

const status = await subscriptionService.getUserSubscriptionStatus({ email: 'user@example.com' });
console.log('Processed status:', status);
```

**Expected for Premium User:**
```json
{
  "isPremium": true,
  "isFreeTrial": false,
  "subscriptionStatus": "active"
}
```

#### Step C: Force Refresh
```typescript
// Clear cache and get fresh data
subscriptionService.clearCache();
const freshStatus = await subscriptionService.forceRefreshSubscriptionStatus({ email: 'user@example.com' });
console.log('Fresh status:', freshStatus);
```

## Quick Fixes

### Fix 1: Grant Premium Access Manually
```typescript
import { manualSubscriptionService } from '@/services/subscription/manualSubscriptionService';

// This will set subscription_status to "active" and clear cache
await manualSubscriptionService.grantPremiumAccess('user@example.com', {
  planId: 'manual_premium',
  notes: 'Manual fix for banner issue',
  source: 'manual_admin'
});
```

### Fix 2: Force Cache Clear in Your Component
```typescript
import { subscriptionService } from '@/services/subscription/subscriptionService';

// Add this when subscription status changes
subscriptionService.clearCache();

// Then re-fetch subscription status
const updatedStatus = await subscriptionService.getUserSubscriptionStatus(user);
```

### Fix 3: Check Component Logic
Make sure your component is checking the right property:

```typescript
// ❌ Wrong - checking success instead of isPremium
if (subscriptionStatus.success) {
  // Hide free trial banner
}

// ✅ Correct - check isPremium
if (subscriptionStatus.isPremium) {
  // Hide free trial banner
}

// ✅ Also correct - check both
if (subscriptionStatus.isPremium || !subscriptionStatus.isFreeTrial) {
  // Hide free trial banner
}
```

## Test Scenarios

### Scenario 1: User Just Purchased Premium
```typescript
// 1. User starts with free trial
let status = await subscriptionService.getUserSubscriptionStatus(user);
console.log('Before:', status.isFreeTrial); // Should be true

// 2. User purchases premium (this should update Appwrite)
// RevenueCat purchase flow...

// 3. Check status after purchase
subscriptionService.clearCache(); // Important!
status = await subscriptionService.getUserSubscriptionStatus(user);
console.log('After:', status.isPremium); // Should be true
console.log('Free trial:', status.isFreeTrial); // Should be false
```

### Scenario 2: Manual Premium Grant
```typescript
// 1. Grant premium manually
await manualSubscriptionService.grantPremiumAccess('user@example.com');

// 2. Check immediately (cache should be auto-cleared)
const status = await subscriptionService.getUserSubscriptionStatus({ email: 'user@example.com' });
console.log('Is premium:', status.isPremium); // Should be true
console.log('Is free trial:', status.isFreeTrial); // Should be false
```

## Component Integration

### In Your Banner Component
```typescript
import { subscriptionService } from '@/services/subscription/subscriptionService';
import { useEffect, useState } from 'react';

const FreeTrialBanner = ({ user }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setLoading(true);
        
        // Force fresh check (bypass cache)
        const status = await subscriptionService.forceRefreshSubscriptionStatus(user);
        
        // Show banner only if user is on free trial or has no subscription
        const shouldShow = status.isFreeTrial && !status.isPremium;
        setShowBanner(shouldShow);
        
        console.log('Banner decision:', {
          isPremium: status.isPremium,
          isFreeTrial: status.isFreeTrial,
          subscriptionStatus: status.subscriptionStatus,
          showBanner: shouldShow
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
        // Show banner on error (safe default)
        setShowBanner(true);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      checkSubscription();
    }
  }, [user?.email]);

  if (loading) {
    return null; // Or loading indicator
  }

  if (!showBanner) {
    return null; // User has premium, don't show banner
  }

  return (
    <View className="bg-orange-100 p-4">
      <Text>Free trial banner content...</Text>
    </View>
  );
};
```

## Prevention

To prevent this issue in the future:

1. **Always clear cache** when subscription status changes
2. **Use forceRefreshSubscriptionStatus** after purchases
3. **Test subscription flows** thoroughly
4. **Monitor console logs** for subscription status changes
5. **Use the debug function** when issues arise

## Emergency Fix

If users are complaining about the banner not disappearing:

```typescript
// Quick fix for specific user
import { debugFreeTrialBanner, grantTestPremiumAccess } from '@/utils/subscriptionTestService';

// 1. Debug the issue
await debugFreeTrialBanner('affected-user@example.com');

// 2. If needed, manually grant premium
await grantTestPremiumAccess('affected-user@example.com');
```
