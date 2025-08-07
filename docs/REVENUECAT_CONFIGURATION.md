# RevenueCat Configuration Guide

## Current Issue
Your RevenueCat is configured with products but may be missing the entitlement configuration that the app expects.

## Current Products
- **Monthly**: `$rc_monthly` (Product: `cashbookassist.Monthly`)
- **Annual**: `$rc_annual` (Product: `cashbookassist.Annually`)

## Required Configuration

### 1. Create an Entitlement in RevenueCat Dashboard

1. Go to your RevenueCat dashboard
2. Navigate to **Entitlements** section
3. Create a new entitlement named `premium` (or update the app code to match your entitlement name)
4. Attach both products (`$rc_monthly` and `$rc_annual`) to this `premium` entitlement

### 2. Alternative: Update App Code

If you prefer to use a different entitlement name or want the app to be more flexible, the code has been updated to check for ANY active entitlement instead of specifically looking for `premium`.

## Code Changes Made

The following functions now check for any active entitlement:

```typescript
// Before (looking for specific 'premium' entitlement)
hasEntitlement = customerInfo.entitlements.active.premium !== undefined;

// After (looking for any active entitlement)
hasEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
```

## Testing

After configuration, test the flow:

1. Make a test purchase
2. Check the console logs for:
   - "Available entitlements: [entitlement_names]"
   - "Fresh customer info entitlements: [entitlement_names]"

## Expected Flow

1. User purchases monthly or annual plan
2. RevenueCat processes the purchase
3. Entitlement becomes active
4. App detects active entitlement
5. Appwrite subscription status is updated to 'active'
6. User gets premium access

## Troubleshooting

If purchases still fail to activate:

1. Check RevenueCat dashboard for the purchase
2. Verify entitlements are properly configured
3. Check app logs for entitlement names
4. Ensure App Store Connect/Google Play products match RevenueCat configuration
