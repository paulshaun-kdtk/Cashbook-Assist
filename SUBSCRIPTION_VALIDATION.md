# Subscription Validation System

This document explains the comprehensive subscription validation system that ensures active subscriptions in RevenueCat stay synchronized with Appwrite subscription documents and app restrictions.

## Overview

The subscription validation system provides:

1. **Periodic validation** of RevenueCat subscription status
2. **Automatic synchronization** with Appwrite subscription documents
3. **Real-time subscription status monitoring**
4. **Background validation** when app becomes active
5. **Error handling and retry mechanisms**

## Architecture

### Core Components

#### SubscriptionValidationService
- **Location**: `services/subscription/subscriptionValidationService.ts`
- **Purpose**: Singleton service that manages periodic validation
- **Features**:
  - Automatic validation every 30 minutes
  - App state change detection (validates when app becomes active)
  - RevenueCat customer info checking
  - Appwrite subscription document synchronization
  - Listener callbacks for validation results

#### SubscriptionAPIService
- **Location**: `services/subscription/subscriptionAPIService.ts`
- **Purpose**: Handles Appwrite subscription document CRUD operations
- **Methods**:
  - `updateSubscription()` - Update existing subscription
  - `createSubscription()` - Create new subscription document
  - `upsertSubscription()` - Update or create (recommended)

#### SubscriptionService
- **Location**: `services/subscription/subscriptionService.ts`
- **Purpose**: Core subscription logic and restriction checking
- **Features**:
  - User session-based validation
  - Cached subscription status (5-minute cache)
  - Free trial vs Premium limit enforcement

#### useSubscriptionValidation Hook
- **Location**: `hooks/useSubscriptionValidation.ts`
- **Purpose**: React hook for components to access validation functionality
- **Returns**:
  - `validateNow()` - Manual validation trigger
  - `hasActiveSubscription` - Current subscription status
  - `lastValidationTime` - When validation last ran
  - `syncedWithAppwrite` - Whether sync was successful

## How It Works

### 1. Initialization
```typescript
// In app/_layout.tsx
subscriptionValidationService.startPeriodicValidation();
```

### 2. Periodic Validation (Every 30 minutes)
```typescript
// Automatically runs every 30 minutes
const customerInfo = await Purchases.getCustomerInfo();
const hasActiveSubscription = customerInfo.entitlements.active.premium !== undefined;
```

### 3. Appwrite Synchronization
```typescript
// Updates Appwrite subscription document
await subscriptionAPIService.upsertSubscription(userEmail, username, {
  subscription_status: hasActiveSubscription ? 'active' : 'expired',
  subscription_type: hasActiveSubscription ? 'premium' : 'trial',
  subscription_id: customerInfo.originalAppUserId,
  payment_platform: 'revenue_cat'
});
```

### 4. Cache Invalidation
```typescript
// Clears subscription cache to force refresh
subscriptionService.clearCache();
```

### 5. App State Monitoring
```typescript
// Validates when app becomes active (if > 5 minutes since last validation)
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    this.validateSubscriptionStatus();
  }
});
```

## Usage Examples

### Basic Component Integration
```typescript
import { useSubscriptionValidation } from '@/hooks/useSubscriptionValidation';

export const MyComponent = () => {
  const { 
    validateNow, 
    hasActiveSubscription, 
    lastValidationTime,
    syncedWithAppwrite 
  } = useSubscriptionValidation();

  return (
    <View>
      <Text>Premium Status: {hasActiveSubscription ? 'Active' : 'Inactive'}</Text>
      <Text>Last Validated: {lastValidationTime?.toLocaleString()}</Text>
      <Text>Synced: {syncedWithAppwrite ? 'Yes' : 'No'}</Text>
      <Button title="Validate Now" onPress={validateNow} />
    </View>
  );
};
```

### Manual Validation
```typescript
import { subscriptionValidationService } from '@/services/subscription/subscriptionValidationService';

// Validate specific user
const result = await subscriptionValidationService.validateUserSubscription(userEmail);

if (result.isValid && !result.hasActiveSubscription) {
  // User's subscription has ended
  showUpgradePrompt();
}
```

### Listening to Validation Events
```typescript
// Add listener for validation results
const removeListener = subscriptionValidationService.addValidationListener((result) => {
  console.log('Validation result:', result);
  
  if (result.hasActiveSubscription) {
    console.log('User has active subscription');
  } else {
    console.log('User subscription has ended');
  }
});

// Clean up
removeListener();
```

## Validation Scenarios

### 1. Active Subscription
- **RevenueCat**: `customerInfo.entitlements.active.premium` exists
- **Appwrite**: `subscription_status: 'active'`
- **App Behavior**: Full premium features enabled

### 2. Cancelled Subscription
- **RevenueCat**: No active entitlements, recent expiration
- **Appwrite**: `subscription_status: 'cancelled'`
- **App Behavior**: Graceful degradation to free trial

### 3. Expired Subscription
- **RevenueCat**: No active entitlements, old expiration
- **Appwrite**: `subscription_status: 'expired'`
- **App Behavior**: Free trial limits enforced

### 4. Network/Sync Errors
- **Fallback**: Uses cached subscription status
- **Retry**: Automatic retry on next validation cycle
- **User Feedback**: Error notifications via toast

## Configuration

### Validation Interval
```typescript
// Default: 30 minutes
subscriptionValidationService.setValidationInterval(15 * 60 * 1000); // 15 minutes
```

### App State Validation Threshold
```typescript
// Default: 5 minutes
// Validates when app becomes active if > 5 minutes since last validation
```

## Error Handling

### RevenueCat Errors
- Network failures during customer info fetch
- Invalid API key or configuration
- User not found in RevenueCat

### Appwrite Errors
- Database connection failures
- Invalid subscription document format
- Authentication/permission errors

### Graceful Degradation
- Uses cached subscription status when validation fails
- Defaults to free trial limits on critical errors
- Logs errors for debugging without breaking user experience

## Best Practices

### 1. Component Usage
- Use `useSubscriptionValidation` hook in components that need subscription status
- Don't call validation manually unless absolutely necessary
- Trust the automatic validation system

### 2. Error Handling
- Always check `syncedWithAppwrite` for critical subscription-dependent features
- Provide fallback behavior when validation fails
- Show user-friendly error messages

### 3. Performance
- Validation runs in background, doesn't block UI
- Results are cached to minimize API calls
- Only validates when necessary (time-based + app state)

### 4. Testing
- Use development/staging RevenueCat environment
- Test subscription cancellation scenarios
- Verify Appwrite sync functionality

## Monitoring and Debugging

### Console Logs
```typescript
// Validation start
"Starting subscription validation..."

// RevenueCat status
"RevenueCat subscription status: { hasActiveSubscription: true, ... }"

// Appwrite sync
"Successfully synced subscription status with Appwrite"

// Completion
"Subscription validation completed: { hasActiveSubscription: true, ... }"
```

### Validation Results
- Check `ValidationResult` object for detailed status
- Monitor `syncedWithAppwrite` for data consistency
- Use `lastValidationTime` to debug timing issues

## Security Considerations

- User email is used as the primary identifier
- RevenueCat customer info is trusted source of truth
- Appwrite sync uses server-side API keys
- No sensitive payment information is stored locally

---

This validation system ensures that subscription status is always accurate and synchronized across RevenueCat payments and Appwrite business logic, providing a seamless premium feature experience.
