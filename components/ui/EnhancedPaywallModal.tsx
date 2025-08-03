import { useToast } from '@/hooks/useToast';
import { manualSubscriptionService } from '@/services/subscription/manualSubscriptionService';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface EnhancedPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail: string;
  onPurchaseSuccess?: () => void;
}

/**
 * Enhanced paywall modal that shows subscription options with Appwrite priority
 * Displays current subscription status and source information
 */
export const EnhancedPaywallModal: React.FC<EnhancedPaywallModalProps> = ({
  visible,
  onClose,
  userEmail,
  onPurchaseSuccess
}) => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { showToast } = useToast();

  const loadSubscriptionDetails = useCallback(async () => {
    setLoading(true);
    try {
      const details = await manualSubscriptionService.getSubscriptionDetails(userEmail);
      setSubscriptionDetails(details);
    } catch (error: any) {
      console.error('Error loading subscription details:', error);
      showToast({
        type: 'error',
        text1: 'Error loading subscription',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [userEmail, showToast]);

  useEffect(() => {
    if (visible && userEmail) {
      loadSubscriptionDetails();
    }
  }, [visible, userEmail, loadSubscriptionDetails]);

  const handleRevenueCatPurchase = async (planType: 'monthly' | 'annual') => {
    setPurchasing(true);
    try {
      // Your existing RevenueCat purchase logic here
      // After successful purchase, the subscription validation system will automatically
      // update the Appwrite subscription status
      
      showToast({
        type: 'success',
        text1: 'Purchase Successful!',
        text2: 'Your premium features are now active'
      });
      
      onPurchaseSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Purchase failed:', error);
      showToast({
        type: 'error',
        text1: 'Purchase Failed',
        text2: error.message || 'Please try again'
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getSubscriptionStatusDisplay = () => {
    if (!subscriptionDetails) return null;

    const { subscription, sourcePriority } = subscriptionDetails;
    
    return (
      <View className="bg-blue-50 rounded-lg p-4 mb-4">
        <Text className="text-lg font-bold text-blue-800 mb-2">
          📊 Current Subscription Status
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-blue-700">Status:</Text>
            <Text className={`text-sm font-medium ${
              subscription.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {subscription.success ? 'Active' : 'Inactive'}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-sm text-blue-700">Premium Access:</Text>
            <Text className={`text-sm font-medium ${
              subscription.isPremium ? 'text-green-600' : 'text-orange-600'
            }`}>
              {subscription.isPremium ? 'Yes' : 'No'}
            </Text>
          </View>
          
          {subscription.free_trial && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-blue-700">Free Trial:</Text>
              <Text className="text-sm font-medium text-blue-600">
                {subscription.time_remaining} days remaining
              </Text>
            </View>
          )}
          
          <View className="flex-row justify-between">
            <Text className="text-sm text-blue-700">Source:</Text>
            <Text className="text-sm font-medium text-blue-800">
              {sourcePriority.primary === 'appwrite' ? '🏢 Appwrite' : '💳 RevenueCat'}
            </Text>
          </View>
          
          {subscription.source && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-blue-700">Platform:</Text>
              <Text className="text-sm text-blue-600 capitalize">
                {subscription.source.replace('_', ' ')}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getPrimaryActionButton = () => {
    if (!subscriptionDetails) return null;

    const { subscription } = subscriptionDetails;

    // User already has premium access
    if (subscription.success && subscription.isPremium) {
      return (
        <View className="bg-green-50 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-center mb-2">
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <Text className="text-lg font-bold text-green-700 ml-2">
              Premium Active!
            </Text>
          </View>
          <Text className="text-sm text-green-600 text-center">
            You have full access to all premium features
          </Text>
          {subscription.source === 'manual_admin' && (
            <Text className="text-xs text-green-500 text-center mt-1">
              Manually granted by administrator
            </Text>
          )}
        </View>
      );
    }

    // User is on free trial
    if (subscription.success && subscription.free_trial) {
      return (
        <View className="bg-orange-50 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-center mb-2">
            <Ionicons name="time" size={24} color="#ea580c" />
            <Text className="text-lg font-bold text-orange-700 ml-2">
              Free Trial Active
            </Text>
          </View>
          <Text className="text-sm text-orange-600 text-center">
            {subscription.time_remaining} days remaining in your trial
          </Text>
          <Text className="text-xs text-orange-500 text-center mt-1">
            Upgrade now to continue enjoying premium features
          </Text>
        </View>
      );
    }

    // No subscription - show upgrade options
    return null;
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
      <View className="bg-white rounded-2xl mx-4 max-h-[80%] w-full max-w-md">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-800">
            Subscription Status
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="p-4">
          {loading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-2">Loading subscription details...</Text>
            </View>
          ) : (
            <>
              {getSubscriptionStatusDisplay()}
              {getPrimaryActionButton()}

              {/* Show upgrade options if user doesn't have premium */}
              {subscriptionDetails && 
               (!subscriptionDetails.subscription.success || !subscriptionDetails.subscription.isPremium) && (
                <View className="space-y-4">
                  <Text className="text-lg font-bold text-gray-800 text-center mb-4">
                    🚀 Upgrade to Premium
                  </Text>

                  {/* Premium Features List */}
                  <View className="bg-gray-50 rounded-lg p-4 mb-4">
                    <Text className="font-semibold text-gray-800 mb-2">Premium Features:</Text>
                    <View className="space-y-1">
                      {[
                        'Unlimited companies & cashbooks',
                        'Unlimited transactions',
                        'AI-powered insights',
                        'Advanced reports & analytics',
                        'Multi-currency support',
                        'Export to PDF & Excel',
                        'Priority support'
                      ].map((feature, index) => (
                        <View key={index} className="flex-row items-center">
                          <Ionicons name="checkmark" size={16} color="#059669" />
                          <Text className="text-sm text-gray-700 ml-2">{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* RevenueCat Purchase Options */}
                  <View className="space-y-3">
                    <TouchableOpacity
                      className="bg-blue-500 rounded-lg py-4 px-6"
                      onPress={() => handleRevenueCatPurchase('monthly')}
                      disabled={purchasing}
                    >
                      <Text className="text-white text-center font-semibold text-lg">
                        Monthly Premium - $9.99/month
                      </Text>
                      <Text className="text-blue-100 text-center text-sm mt-1">
                        Cancel anytime
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-green-500 rounded-lg py-4 px-6"
                      onPress={() => handleRevenueCatPurchase('annual')}
                      disabled={purchasing}
                    >
                      <Text className="text-white text-center font-semibold text-lg">
                        Annual Premium - $99.99/year
                      </Text>
                      <Text className="text-green-100 text-center text-sm mt-1">
                        Save $20 per year! Best value
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Alternative Payment Methods */}
                  <View className="border-t border-gray-200 pt-4 mt-4">
                    <Text className="text-sm text-gray-600 text-center mb-2">
                      Other payment methods available
                    </Text>
                    <TouchableOpacity
                      className="bg-gray-100 rounded-lg py-3 px-4"
                      onPress={() => {
                        showToast({
                          type: 'info',
                          text1: 'Contact Support',
                          text2: 'We support bank transfers, PayPal, and other methods'
                        });
                      }}
                    >
                      <Text className="text-gray-700 text-center text-sm">
                        💬 Contact Support for Alternative Payment
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Development Info */}
              {__DEV__ && subscriptionDetails && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <Text className="text-xs text-yellow-800 font-medium mb-1">
                    🛠️ Development Info:
                  </Text>
                  <Text className="text-xs text-yellow-700">
                    Priority: {subscriptionDetails.sourcePriority.primary}
                  </Text>
                  <Text className="text-xs text-yellow-700">
                    Method: {subscriptionDetails.subscription.method}
                  </Text>
                  <Text className="text-xs text-yellow-700">
                    Recommendation: {subscriptionDetails.recommendation}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};
