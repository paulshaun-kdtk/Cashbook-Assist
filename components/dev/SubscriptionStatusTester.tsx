import { RootState } from '@/redux/store';
import { manualSubscriptionService } from '@/services/subscription/manualSubscriptionService';
import { subscriptionService } from '@/services/subscription/subscriptionService';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

/**
 * Quick subscription status test component
 * Use this to test subscription changes and verify the banner updates correctly
 */
export const SubscriptionStatusTester = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userEmail = (user as any)?.email;
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!userEmail || !user) return;
    
    setLoading(true);
    try {
      const status = await subscriptionService.forceRefreshSubscriptionStatus(user);
      setSubscriptionStatus(status);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing status:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail, user]);

  const grantPremium = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      await manualSubscriptionService.grantPremiumAccess(userEmail, {
        planId: 'test_premium',
        notes: 'Test premium grant',
        source: 'testing'
      });
      
      // Wait a moment then refresh
      setTimeout(refreshStatus, 500);
    } catch (error) {
      console.error('Error granting premium:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      await manualSubscriptionService.startFreeTrial(userEmail, {
        notes: 'Test free trial',
        source: 'testing'
      });
      
      // Wait a moment then refresh
      setTimeout(refreshStatus, 500);
    } catch (error) {
      console.error('Error starting trial:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokePremium = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      await manualSubscriptionService.revokePremiumAccess(userEmail, {
        notes: 'Test premium revocation'
      });
      
      // Wait a moment then refresh
      setTimeout(refreshStatus, 500);
    } catch (error) {
      console.error('Error revoking premium:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      refreshStatus();
    }
  }, [userEmail, refreshStatus]);

  if (!userEmail) {
    return (
      <View className="bg-red-50 p-4 m-4 rounded-lg">
        <Text className="text-red-800">No user email found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-white">
      <View className="p-4 bg-blue-50 border-b border-blue-200">
        <Text className="text-lg font-bold text-blue-800 mb-2">
          🧪 Subscription Status Tester
        </Text>
        <Text className="text-sm text-blue-600">
          Test user: {userEmail}
        </Text>
        {lastUpdated && (
          <Text className="text-xs text-blue-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Current Status Display */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          📊 Current Status
        </Text>
        
        {subscriptionStatus ? (
          <View className="bg-gray-50 p-3 rounded-lg space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-700">Premium:</Text>
              <Text className={`text-sm font-medium ${
                subscriptionStatus.isPremium ? 'text-green-600' : 'text-red-600'
              }`}>
                {subscriptionStatus.isPremium ? 'Yes' : 'No'}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-700">Free Trial:</Text>
              <Text className={`text-sm font-medium ${
                subscriptionStatus.isFreeTrial ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {subscriptionStatus.isFreeTrial ? 'Yes' : 'No'}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-700">Status:</Text>
              <Text className="text-sm font-medium text-blue-600">
                {subscriptionStatus.subscriptionStatus}
              </Text>
            </View>

            {subscriptionStatus.timeRemaining && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-700">Time Remaining:</Text>
                <Text className="text-sm font-medium text-orange-600">
                  {subscriptionStatus.timeRemaining} days
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text className="text-gray-500">Loading...</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View className="p-4 space-y-3">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          🎛️ Test Actions
        </Text>

        <TouchableOpacity
          onPress={refreshStatus}
          disabled={loading}
          className={`bg-blue-500 p-4 rounded-lg flex-row items-center justify-center ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text className="text-white font-medium ml-2">
            Refresh Status
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={grantPremium}
          disabled={loading}
          className={`bg-green-500 p-4 rounded-lg flex-row items-center justify-center ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <Ionicons name="star" size={16} color="white" />
          <Text className="text-white font-medium ml-2">
            Grant Premium Access
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={startTrial}
          disabled={loading}
          className={`bg-orange-500 p-4 rounded-lg flex-row items-center justify-center ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <Ionicons name="gift" size={16} color="white" />
          <Text className="text-white font-medium ml-2">
            Start Free Trial
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={revokePremium}
          disabled={loading}
          className={`bg-red-500 p-4 rounded-lg flex-row items-center justify-center ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <Ionicons name="close-circle" size={16} color="white" />
          <Text className="text-white font-medium ml-2">
            Revoke Premium Access
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View className="p-4 bg-yellow-50 border-t border-yellow-200">
        <Text className="text-sm font-medium text-yellow-800 mb-2">
          💡 How to Test:
        </Text>
        <Text className="text-xs text-yellow-700 leading-5">
          1. Grant premium access and watch the subscription status card disappear{'\n'}
          2. Start free trial and watch the card appear{'\n'}
          3. Revoke premium and watch the card reappear{'\n'}
          4. Use refresh to manually check status changes
        </Text>
      </View>
    </ScrollView>
  );
};
