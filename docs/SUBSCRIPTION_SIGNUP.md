# Subscription-Based Signup Implementation

## Overview

The new subscription-aware signup system integrates RevenueCat for subscription management and provides users with multiple plan options including a free tier. This implementation replaces the basic signup flow with a comprehensive subscription management system.

## Features

### Subscription Plans

The subscription system dynamically loads plans from RevenueCat offerings:

1. **Free Tier** (Always Available)
   - Up to 3 cashbooks
   - Basic transaction tracking
   - Simple reports
   - Export to CSV
   - 7-day free trial status

2. **Pro Monthly** (Loaded from RevenueCat)
   - Price determined by RevenueCat package
   - Unlimited cashbooks
   - Advanced transaction tracking
   - AI-powered insights
   - Smart category suggestions
   - Advanced reports & analytics
   - Multi-currency support
   - Priority support
   - Export to PDF & Excel
   - Marked as "POPULAR"

3. **Pro Annual** (Loaded from RevenueCat)
   - Price determined by RevenueCat package
   - All Pro Monthly features
   - Automatic savings calculation vs monthly
   - Advanced forecasting
   - Custom report templates
   - API access
   - White-label options

**Dynamic Pricing**: The system automatically calculates and displays savings for annual plans compared to monthly plans when both are available from RevenueCat.

**Fallback Handling**: If RevenueCat packages are unavailable, fallback plans are displayed with "Contact Support" pricing and are disabled for purchase.

### Technical Implementation

#### Components

- **`SubscriptionSignupScreen`**: Main signup component with subscription plan selection
- **Plan Selection UI**: Interactive plan cards with feature comparison
- **Form Validation**: Comprehensive user input validation
- **RevenueCat Integration**: Real-time subscription package loading

#### Database Integration

The system creates two types of documents in Appwrite:

1. **User Document** (user_collection_id)
   ```json
   {
     "email": "user@example.com",
     "name": "User Name",
     "username": "username",
     "which_key": "user@example.com",
     "created_at": "2024-01-01T00:00:00.000Z"
   }
   ```

2. **Subscription Document** (subscription_collection_id)
   ```json
   {
     "user": "user@example.com",
     "user_id": "user_document_id",
     "subscription_status": "active|pending",
     "subscription_type": "free|pro_monthly|pro_annual",
     "subscription_period": "trial|monthly|annual",
     "subscription_price": "0|9.99|99.99",
     "revenuecat_customer_id": "rc_customer_id",
     "revenuecat_entitlements": "{entitlements_json}",
     "subscription_start_date": "2024-01-01T00:00:00.000Z",
     "subscription_end_date": "2024-01-08T00:00:00.000Z",
     "auto_renewal": false,
     "created_at": "2024-01-01T00:00:00.000Z"
   }
   ```

#### RevenueCat Configuration

The system dynamically loads subscription packages from RevenueCat offerings:

```typescript
// Configuration for both platforms
if (Platform.OS === 'ios' && process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY) {
  await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY });
} else if (Platform.OS === 'android' && process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY) {
  await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY });
}

// Load offerings and create subscription plans
const offerings = await Purchases.getOfferings();
offerings.current?.availablePackages.forEach((rcPackage) => {
  // Monthly and Annual packages are automatically detected
  // and converted to subscription plans with RevenueCat pricing
});
```

**Key Features**:
- **Dynamic Pricing**: Prices are fetched from RevenueCat in real-time
- **Automatic Savings Calculation**: Annual plans show savings vs monthly
- **Package Detection**: Automatically identifies MONTHLY and ANNUAL package types
- **Fallback Support**: Graceful handling when RevenueCat is unavailable

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# RevenueCat API Keys
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_api_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_api_key
```

### 2. RevenueCat Dashboard Setup

1. Create a RevenueCat account at https://app.revenuecat.com/
2. Set up your app with both iOS and Android configurations
3. Create subscription products:
   - Monthly subscription package
   - Annual subscription package
4. Configure entitlements (e.g., "pro" entitlement)
5. Get API keys from Settings > API Keys

### 3. App Store/Google Play Configuration

#### iOS App Store Connect
1. Create subscription products matching your RevenueCat configuration
2. Set up subscription groups
3. Configure pricing and availability

#### Google Play Console
1. Create subscription products
2. Set up billing configurations
3. Configure pricing and availability

## User Flow

### Free Tier Signup
1. User fills out account information
2. Selects "Free" plan
3. System creates Appwrite user document
4. System creates subscription document with "pending" status (7-day trial)
5. User is redirected to sign-in page

### Paid Subscription Signup
1. User fills out account information
2. Selects Pro Monthly or Pro Annual plan
3. RevenueCat purchase flow is initiated
4. Upon successful payment:
   - System creates Appwrite user document
   - System creates subscription document with "active" status
   - RevenueCat customer information is stored
5. User is redirected to sign-in page

## Error Handling

The implementation includes comprehensive error handling:

- **Form Validation**: Email format, password strength, username requirements
- **Network Errors**: Graceful handling of API failures
- **Purchase Errors**: User-friendly messages for payment failures
- **Fallback Plans**: Default plan display if RevenueCat is unavailable

## Subscription Status Management

The existing `confirmHasSubscription` function in `userActions.ts` handles subscription verification:

- **Active Subscriptions**: Full app access
- **Pending Subscriptions**: 7-day free trial with time remaining calculation
- **Expired Subscriptions**: Limited access or upgrade prompts

## Integration Points

### Existing Features
- **Offline Support**: Subscription data is synced with SQLite
- **AI Features**: Premium AI features are gated by subscription status
- **Authentication**: Integrates with existing Appwrite auth system

### Future Enhancements
- **Subscription Management**: In-app subscription modification
- **Usage Analytics**: Track feature usage by subscription tier
- **A/B Testing**: Different pricing and feature combinations

## Testing

### Test Scenarios
1. **Free Tier Signup**: Verify user creation and trial period
2. **Paid Subscription**: Test purchase flow and entitlement activation
3. **Purchase Cancellation**: Ensure graceful handling of cancelled purchases
4. **Network Failures**: Test offline scenarios and error recovery
5. **Plan Upgrades**: Future upgrade/downgrade functionality

### RevenueCat Sandbox
Use RevenueCat's sandbox environment for testing:
- Test purchases without real money
- Verify subscription lifecycle events
- Test entitlement management

## Security Considerations

- **API Keys**: Store RevenueCat keys securely in environment variables
- **Subscription Validation**: Server-side validation recommended for production
- **User Data**: Encrypt sensitive subscription information
- **Entitlement Verification**: Regular checks against RevenueCat

## Monitoring and Analytics

### Key Metrics
- **Conversion Rate**: Free to paid subscription conversion
- **Churn Rate**: Subscription cancellation rates
- **Revenue**: Monthly/annual recurring revenue tracking
- **Feature Usage**: Premium feature adoption rates

### RevenueCat Analytics
- Built-in subscription analytics dashboard
- Cohort analysis and retention metrics
- Revenue reporting and trends

## Support and Maintenance

### Regular Tasks
- **Price Updates**: Modify subscription prices as needed
- **Feature Gating**: Ensure new features respect subscription tiers
- **Entitlement Sync**: Keep RevenueCat and Appwrite data synchronized

### Troubleshooting
- **Failed Purchases**: Check RevenueCat dashboard for payment issues
- **Sync Issues**: Monitor Appwrite/RevenueCat data consistency
- **Access Problems**: Verify entitlement status and subscription validity
