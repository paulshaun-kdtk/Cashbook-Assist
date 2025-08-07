import { useToast } from '@/hooks/useToast';
import { RootState } from '@/redux/store';
import { sessionAwareSubscriptionService } from '@/services/subscription/sessionAwareSubscriptionService';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useSelector } from 'react-redux';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onPurchaseSuccess
}) => {
  const theme = useColorScheme();
  const { showToast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showMockPlans, setShowMockPlans] = useState(false);

  // Function to restart the app after successful purchase
  const restartApp = async () => {
    try {
      // Check if Updates is available (in Expo managed apps)
      if (Updates.reloadAsync) {
        await Updates.reloadAsync();
      } else {
        // Fallback for development or if Updates is not available
        Alert.alert(
          'Restart Required',
          'Please close and reopen the app to activate your premium features.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Could not restart app automatically:', error);
      Alert.alert(
        'Restart Required',
        'Please close and reopen the app to activate your premium features.',
        [{ text: 'OK' }]
      );
    }
  };

  // Function to open Apple's subscription terms
  const openSubscriptionTerms = () => {
    const appleTermsUrl = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
    Linking.openURL(appleTermsUrl).catch(err => {
      console.error('Failed to open Apple subscription terms:', err);
      Alert.alert(
        'Terms and Conditions',
        'By purchasing a subscription, you agree to Apple\'s Terms and Conditions and acknowledge that subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.',
        [{ text: 'OK' }]
      );
    });
  };

  // Mock plans for development/fallback
  const mockPlans = [
    {
      identifier: 'monthly_premium',
      packageType: 'MONTHLY',
      storeProduct: {
        title: 'Premium Monthly',
        description: 'Full access to all features',
        price: '$9.99',
        priceString: '$9.99',
        currencyCode: 'USD'
      }
    },
    {
      identifier: 'yearly_premium',
      packageType: 'ANNUAL',
      storeProduct: {
        title: 'Premium Yearly',
        description: 'Full access to all features (Save 40%)',
        price: '$59.99',
        priceString: '$59.99',
        currencyCode: 'USD'
      }
    }
  ];

  const debugRevenueCat = useCallback(async () => {
    try {
      console.log('=== RevenueCat Debug Info ===');
      
      // Check if RevenueCat is configured
      const isConfigured = await Purchases.isConfigured();
      console.log('RevenueCat configured:', isConfigured);
      
      // Get customer info
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        console.log('Customer ID:', customerInfo.originalAppUserId);
        console.log('Active entitlements:', Object.keys(customerInfo.entitlements.active));
      } catch (error) {
        console.log('Customer info error:', error);
      }
      
      // Try to get offerings with more detailed error info
      try {
        const offerings = await Purchases.getOfferings();
        
        if (offerings.current) {
          offerings.current.availablePackages.forEach((pkg, index) => {
            console.log(`Package ${index + 1}:`, {
              identifier: pkg.identifier,
              productId: pkg.product.identifier,
              title: pkg.product.title,
              price: pkg.product.priceString,
              period: pkg.product.subscriptionPeriod
            });
          });
        }
      } catch (error) {
        console.log('Offerings fetch error:', error);
      }
      
      console.log('=== End RevenueCat Debug ===');
    } catch (error) {
      console.error('Debug function error:', error);
    }
  }, []);

  const loadOfferings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading RevenueCat offerings...');
      
      // Run debug info first
      await debugRevenueCat();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading offerings')), 10000)
      );
      
      const offeringsPromise = Purchases.getOfferings();
      
      const offerings = await Promise.race([offeringsPromise, timeoutPromise]) as any;
      console.log('Available offerings:', offerings);
      
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        setOfferings(offerings.current);
        setShowMockPlans(false);
        console.log('Offerings loaded successfully:', offerings.current.availablePackages.length, 'packages');
      } else {
        console.log('No current offering found or no packages available, showing mock plans');
        setShowMockPlans(true);
        showToast({
          type: 'info',
          text1: 'Demo Mode',
          text2: 'Showing demo subscription plans'
        });
      }
    } catch (error: any) {
      console.error('Error loading offerings:', error);
      console.log('Falling back to mock plans due to error');
      setShowMockPlans(true);
      showToast({
        type: 'info',
        text1: 'Using Demo Mode',
        text2: 'RevenueCat not available, showing demo plans'
      });
    } finally {
      setLoading(false);
    }
  }, [debugRevenueCat, showToast]);

  const loadCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      console.log('Customer info:', info);
    } catch (error) {
      console.error('Error loading customer info:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadOfferings();
      loadCustomerInfo();
    }
  }, [visible, loadOfferings, loadCustomerInfo]);

  const handleMockPurchase = async (mockPlan: any) => {
    try {
      // Check if user is authenticated before proceeding
      if (!user || !(user as any)?.email) {
        showToast({
          type: 'error',
          text1: 'Authentication Required',
          text2: 'Please log in to purchase a subscription'
        });
        return;
      }

      // Show confirmation with terms
      Alert.alert(
        'Confirm Subscription',
        `Subscribe to ${mockPlan.storeProduct.title} for ${mockPlan.storeProduct.priceString}?\n\nThis is a demo purchase. By continuing, you agree to Apple's Terms and Conditions.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Subscribe', 
            onPress: async () => {
              setPurchasing(mockPlan.identifier);
              console.log('Mock purchase for development:', mockPlan.identifier);
              
              // Simulate a small delay
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // Update Appwrite subscription status for mock purchase - user already validated above
              console.log('Updating Appwrite subscription for mock purchase:', (user as any).email);
              
              const subscriptionUpdateResult = await sessionAwareSubscriptionService.updateAppwriteSubscription(
                (user as any).email,
                {
                  subscription_status: 'active',
                  subscription_type: mockPlan.packageType === 'MONTHLY' ? 'monthly' : 'annual',
                  subscription_plan_id: mockPlan.identifier,
                  subscription_id: `mock_${Date.now()}`, // Required field
                  payment_platform: 'revenue_cat',
                  subscription_platform: 'ios'
                }
              );

              if (subscriptionUpdateResult.success) {
                console.log('Mock subscription updated successfully');
              } else {
                console.error('Failed to update mock subscription:', subscriptionUpdateResult.message);
              }

              showToast({
                type: 'success',
                text1: 'Demo Purchase Successful!',
                text2: 'This is a demo transaction - no real payment was processed'
              });
              onPurchaseSuccess?.();
              onClose();
              
              // Restart app to reflect changes
              setTimeout(() => {
                restartApp();
              }, 1000);
              
              setPurchasing(null);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Mock purchase failed:', error);
      showToast({
        type: 'error',
        text1: 'Demo Purchase Failed',
        text2: error.message || 'Please try again'
      });
      setPurchasing(null);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      // Check if user is authenticated before proceeding
      if (!user || !(user as any)?.email) {
        showToast({
          type: 'error',
          text1: 'Authentication Required',
          text2: 'Please log in to purchase a subscription'
        });
        return;
      }

      // Show confirmation with terms
      const subscriptionPeriod = packageToPurchase.product.subscriptionPeriod === 'P1M' ? 'monthly' : 'yearly';
      Alert.alert(
        'Confirm Subscription',
        `Subscribe to ${packageToPurchase.product.title} for ${packageToPurchase.product.priceString} (${subscriptionPeriod})?\n\nBy continuing, you agree to Apple's Terms and Conditions. Subscription will auto-renew unless cancelled.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Subscribe', 
            onPress: async () => {
              await performPurchase(packageToPurchase);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Purchase confirmation failed:', error);
      showToast({
        type: 'error',
        text1: 'Purchase Failed',
        text2: error.message || 'Please try again'
      });
    }
  };

  const performPurchase = async (packageToPurchase: PurchasesPackage) => {
    try {

      setPurchasing(packageToPurchase.identifier);
      console.log('Attempting to purchase:', packageToPurchase.identifier);
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      console.log('Purchase successful:', customerInfo);
      console.log('Available entitlements:', Object.keys(customerInfo.entitlements.active));
      console.log('All entitlements (including inactive):', Object.keys(customerInfo.entitlements.all));
      
      // Check for any active entitlement (premium, pro, or any other)
      // RevenueCat entitlements might be named differently than 'premium'
      let hasEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
      let activeEntitlementName = Object.keys(customerInfo.entitlements.active)[0] || null;
      let retryCount = 0;
      const maxRetries = 3;
      
      // If entitlement not immediately available, retry with fresh customer info
      while (!hasEntitlement && retryCount < maxRetries) {
        console.log(`Entitlement not found, retrying... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const freshCustomerInfo = await Purchases.getCustomerInfo();
        console.log('Fresh customer info entitlements:', Object.keys(freshCustomerInfo.entitlements.active));
        hasEntitlement = Object.keys(freshCustomerInfo.entitlements.active).length > 0;
        if (hasEntitlement) {
          activeEntitlementName = Object.keys(freshCustomerInfo.entitlements.active)[0];
        }
        retryCount++;
      }
      
      if (hasEntitlement) {
        // Update Appwrite subscription status - user already validated above
        console.log('Updating Appwrite subscription for user:', (user as any).email);
        console.log('Active entitlement found:', activeEntitlementName);
        
        const subscriptionUpdateResult = await sessionAwareSubscriptionService.updateAppwriteSubscription(
          (user as any).email,
          {
            subscription_status: 'active',
            subscription_type: packageToPurchase.product.subscriptionPeriod === 'P1M' ? 'monthly' : 'annual',
            subscription_plan_id: packageToPurchase.identifier,
            subscription_id: customerInfo.originalAppUserId,
            payment_platform: 'revenue_cat',
            subscription_platform: 'ios'
          }
        );

          if (subscriptionUpdateResult.success) {
            console.log('Appwrite subscription updated successfully');
            showToast({
              type: 'success',
              text1: 'Subscription Activated!',
              text2: 'Welcome to Cashbook Assist Premium'
            });
            onPurchaseSuccess?.();
            onClose();
            
            setTimeout(() => {
              restartApp();
            }, 1000);
          } else {
            console.error('Failed to update Appwrite subscription:', subscriptionUpdateResult.message);
            // Purchase was successful but Appwrite update failed
            showToast({
              type: 'info',
              text1: 'Purchase Successful',
              text2: 'Please restart the app to activate premium features'
            });
            onPurchaseSuccess?.();
            onClose();
          }
      } else {
        // Purchase was successful but entitlement not found after retries
        console.error('Purchase successful but no premium entitlement found after retries');
        showToast({
          type: 'info',
          text1: 'Purchase Completed',
          text2: 'Please restart the app or contact support if premium features are not available'
        });
        
        // Still try to update Appwrite with purchase info for manual review
        await sessionAwareSubscriptionService.updateAppwriteSubscription(
          (user as any).email,
          {
            subscription_status: 'pending', // Use pending status for manual review
            subscription_type: packageToPurchase.product.subscriptionPeriod === 'P1M' ? 'monthly' : 'annual',
            subscription_plan_id: packageToPurchase.identifier,
            subscription_id: customerInfo.originalAppUserId,
            payment_platform: 'revenue_cat',
            subscription_platform: 'ios'
          }
        );
        
        onPurchaseSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      if (error.userCancelled) {
        // User cancelled, don't show error
        return;
      }
      
      showToast({
        type: 'error',
        text1: 'Purchase Failed',
        text2: error.message || 'Please try again'
      });
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      // Check if user is authenticated before proceeding
      if (!user || !(user as any)?.email) {
        showToast({
          type: 'error',
          text1: 'Authentication Required',
          text2: 'Please log in to restore purchases'
        });
        return;
      }

      setLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      console.log('Restore result:', customerInfo);
      console.log('Available entitlements after restore:', Object.keys(customerInfo.entitlements.active));
      console.log('All entitlements after restore (including inactive):', Object.keys(customerInfo.entitlements.all));
      
      // Check for any active entitlement with retry mechanism
      let hasEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
      let activeEntitlementName = Object.keys(customerInfo.entitlements.active)[0] || null;
      let retryCount = 0;
      const maxRetries = 3;
      
      // If entitlement not immediately available, retry with fresh customer info
      while (!hasEntitlement && retryCount < maxRetries) {
        console.log(`Entitlement not found after restore, retrying... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const freshCustomerInfo = await Purchases.getCustomerInfo();
        console.log('Fresh customer info entitlements after restore:', Object.keys(freshCustomerInfo.entitlements.active));
        hasEntitlement = Object.keys(freshCustomerInfo.entitlements.active).length > 0;
        if (hasEntitlement) {
          activeEntitlementName = Object.keys(freshCustomerInfo.entitlements.active)[0];
        }
        retryCount++;
      }
      
      if (hasEntitlement) {
        // Update Appwrite subscription status - user already validated above
        console.log('Updating Appwrite subscription after restore for user:', (user as any).email);
        console.log('Active entitlement found after restore:', activeEntitlementName);
        
        const subscriptionUpdateResult = await sessionAwareSubscriptionService.updateAppwriteSubscription(
          (user as any).email,
          {
            subscription_status: 'active',
            subscription_type: 'annual', // Default to annual for restored purchases
            subscription_plan_id: 'restored_purchase',
            subscription_id: customerInfo.originalAppUserId,
            payment_platform: 'revenue_cat',
            subscription_platform: 'ios'
          }
        );

          if (subscriptionUpdateResult.success) {
            console.log('Appwrite subscription updated successfully after restore');
            showToast({
              type: 'success',
              text1: 'Subscription Restored!',
              text2: 'Your premium features have been restored'
            });
            onPurchaseSuccess?.();
            onClose();
            
            // Restart app to reflect changes
            setTimeout(() => {
              restartApp();
            }, 1000);
          } else {
            console.error('Failed to update Appwrite subscription after restore:', subscriptionUpdateResult.message);
            showToast({
              type: 'info',
              text1: 'Subscription Found',
              text2: 'Please restart the app to activate premium features'
            });
            onPurchaseSuccess?.();
            onClose();
          }
      } else {
        showToast({
          type: 'info',
          text1: 'No Active Subscriptions',
          text2: 'No active subscriptions found to restore'
        });
      }
    } catch (error: any) {
      console.error('Restore failed:', error);
      showToast({
        type: 'error',
        text1: 'Restore Failed',
        text2: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (packageItem: PurchasesPackage) => {
    const price = packageItem.product.priceString;
    const period = packageItem.product.subscriptionPeriod;
    
    if (period === 'P1M') return `${price}/month`;
    if (period === 'P1Y') return `${price}/year`;
    if (period === 'P1W') return `${price}/week`;
    return price;
  };

  const getPackageDescription = (packageItem: PurchasesPackage) => {
    const period = packageItem.product.subscriptionPeriod;
    
    if (period === 'P1M') return 'Monthly subscription';
    if (period === 'P1Y') return 'Annual subscription - Best Value!';
    if (period === 'P1W') return 'Weekly subscription';
    return 'One-time purchase';
  };

  const getSavingsText = (packageItem: PurchasesPackage) => {
    const period = packageItem.product.subscriptionPeriod;
    if (period === 'P1Y') return '💰 Save up to 2 months!';
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-[#0B0D2A]">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <View>
            <Text className="text-xl font-bold text-black dark:text-white">
              Upgrade to Premium
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Unlock unlimited features
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color={theme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Premium Features */}
          <View className="p-6">
            <Text className="text-lg font-semibold text-black dark:text-white mb-4">
              Premium Features
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-3 text-base text-black dark:text-white">
                  Unlimited companies
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-3 text-base text-black dark:text-white">
                  Unlimited cashbooks
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-3 text-base text-black dark:text-white">
                  Unlimited transactions
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-3 text-base text-black dark:text-white">
                  Advanced AI insights & reports
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-3 text-base text-black dark:text-white">
                  Priority customer support
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="ml-3 text-base text-black dark:text-white">
                  Export & backup features
                </Text>
              </View>
            </View>
          </View>

          {/* Current Plan Status */}
          <View className="mx-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 mb-6">
            <Text className="text-orange-800 dark:text-orange-200 font-medium">
              🎁 Currently on Free Trial
            </Text>
            <Text className="text-orange-700 dark:text-orange-300 text-sm mt-1">
              Limited to 1 company, 1 cashbook, and 1,000 transactions
            </Text>
          </View>

          {/* Subscription Plans */}
          {loading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#06B6D4" />
              <Text className="text-gray-500 dark:text-gray-400 mt-4">
                Loading subscription plans...
              </Text>
            </View>
          ) : showMockPlans ? (
            <View className="px-6">
              <View className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Text className="text-blue-800 dark:text-blue-200 font-medium text-center">
                  🚀 Demo Mode Active
                </Text>
                <Text className="text-blue-700 dark:text-blue-300 text-sm text-center mt-1">
                  These are demo plans for development purposes
                </Text>
              </View>
              
              <Text className="text-lg font-semibold text-black dark:text-white mb-4">
                Choose Your Plan (Demo)
              </Text>
              
              {mockPlans.map((mockPlan, index) => {
                const isPopular = mockPlan.packageType === 'ANNUAL';
                
                return (
                  <TouchableOpacity
                    key={mockPlan.identifier}
                    onPress={() => handleMockPurchase(mockPlan)}
                    disabled={purchasing === mockPlan.identifier || !user || !(user as any)?.email}
                    className={`mb-4 p-4 rounded-xl border-2 ${
                      isPopular 
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    } ${purchasing === mockPlan.identifier || !user || !(user as any)?.email ? 'opacity-50' : ''}`}
                  >
                    {isPopular && (
                      <View className="absolute -top-2 left-4 bg-cyan-500 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">Most Popular</Text>
                      </View>
                    )}
                    
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-black dark:text-white">
                          {mockPlan.storeProduct.priceString}
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                          {mockPlan.storeProduct.title}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {mockPlan.storeProduct.description}
                        </Text>
                        {isPopular && (
                          <Text className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                            💰 Save up to 2 months!
                          </Text>
                        )}
                      </View>
                      
                      {purchasing === mockPlan.identifier ? (
                        <ActivityIndicator size="small" color="#06B6D4" />
                      ) : (
                        <Ionicons 
                          name="arrow-forward-circle" 
                          size={24} 
                          color={isPopular ? '#06B6D4' : '#6B7280'} 
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : offerings?.availablePackages ? (
            <View className="px-6">
              <Text className="text-lg font-semibold text-black dark:text-white mb-4">
                Choose Your Plan
              </Text>
              
              {offerings.availablePackages.map((packageItem) => {
                const isPopular = packageItem.product.subscriptionPeriod === 'P1Y';
                const savings = getSavingsText(packageItem);
                
                return (
                  <TouchableOpacity
                    key={packageItem.identifier}
                    onPress={() => handlePurchase(packageItem)}
                    disabled={purchasing === packageItem.identifier || !user || !(user as any)?.email}
                    className={`mb-4 p-4 rounded-xl border-2 ${
                      isPopular 
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    } ${purchasing === packageItem.identifier || !user || !(user as any)?.email ? 'opacity-50' : ''}`}
                  >
                    {isPopular && (
                      <View className="absolute -top-2 left-4 bg-cyan-500 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">Most Popular</Text>
                      </View>
                    )}
                    
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-black dark:text-white">
                          {formatPrice(packageItem)}
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                          {getPackageDescription(packageItem)}
                        </Text>
                        {savings && (
                          <Text className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                            {savings}
                          </Text>
                        )}
                      </View>
                      
                      {purchasing === packageItem.identifier ? (
                        <ActivityIndicator size="small" color="#06B6D4" />
                      ) : (
                        <Ionicons 
                          name="arrow-forward-circle" 
                          size={24} 
                          color={isPopular ? '#06B6D4' : '#6B7280'} 
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
              <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                No subscription plans available
              </Text>
              <TouchableOpacity
                onPress={loadOfferings}
                className="mt-4 px-6 py-2 bg-cyan-600 rounded-lg"
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Terms and Conditions */}
          <View className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Text className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">
              By continuing, you agree to Apple&apos;s Paid App Terms
            </Text>
            <TouchableOpacity onPress={openSubscriptionTerms}>
              <Text className="text-xs text-blue-600 dark:text-blue-400 text-center underline">
                View Apple&apos;s Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>
          
          {!showMockPlans && (
            <TouchableOpacity
              onPress={handleRestore}
              disabled={loading || !user || !(user as any)?.email}
              className={`mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg ${loading || !user || !(user as any)?.email ? 'opacity-50' : ''}`}
            >
              <Text className="text-center text-gray-700 dark:text-gray-300 font-medium">
                Restore Previous Purchase
              </Text>
            </TouchableOpacity>
          )}
          
          {showMockPlans && (
            <TouchableOpacity
              onPress={loadOfferings}
              disabled={loading}
              className="mb-4 p-3 bg-cyan-100 dark:bg-cyan-800 rounded-lg"
            >
              <Text className="text-center text-cyan-700 dark:text-cyan-300 font-medium">
                Try Loading Real Plans Again
              </Text>
            </TouchableOpacity>
          )}
          
          <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {showMockPlans 
              ? 'Demo mode - No real payments will be processed'
              : 'Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. You can manage and cancel subscriptions in your App Store account settings.'
            }
          </Text>
        </View>
      </View>
    </Modal>
  );
};
