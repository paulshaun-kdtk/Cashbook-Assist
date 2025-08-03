import { useToast } from '@/hooks/useToast';
import { manualSubscriptionService } from '@/services/subscription/manualSubscriptionService';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

/**
 * Admin utility component for manual subscription management
 * This should only be accessible to admin users in development/testing
 * DO NOT INCLUDE IN PRODUCTION BUILDS
 */
export const AdminSubscriptionPanel = () => {
  const [userEmail, setUserEmail] = useState('');
  const [planId, setPlanId] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('testing');
  const [loading, setLoading] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  
  const showToast = useToast();

  const handleGrantPremium = async () => {
    if (!userEmail.trim()) {
      Alert.alert('Error', 'Please enter a user email');
      return;
    }

    setLoading(true);
    try {
      const result = await manualSubscriptionService.grantPremiumAccess(userEmail.trim(), {
        planId: planId.trim() || 'admin_premium',
        notes: notes.trim() || 'Admin granted premium access',
        source: source
      });

      if (result.success) {
        showToast({
          type: 'success',
          text1: 'Premium Access Granted',
          text2: `Successfully granted premium to ${userEmail}`
        });
        
        // Refresh subscription details
        await handleCheckStatus();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to grant premium access');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!userEmail.trim()) {
      Alert.alert('Error', 'Please enter a user email');
      return;
    }

    setLoading(true);
    try {
      const result = await manualSubscriptionService.startFreeTrial(userEmail.trim(), {
        notes: notes.trim() || 'Admin started free trial',
        source: source
      });

      if (result.success) {
        showToast({
          type: 'success',
          text1: 'Free Trial Started',
          text2: `Successfully started trial for ${userEmail}`
        });
        
        // Refresh subscription details
        await handleCheckStatus();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start free trial');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePremium = async () => {
    if (!userEmail.trim()) {
      Alert.alert('Error', 'Please enter a user email');
      return;
    }

    Alert.alert(
      'Confirm Revoke',
      `Are you sure you want to revoke premium access for ${userEmail}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await manualSubscriptionService.revokePremiumAccess(userEmail.trim(), {
                notes: notes.trim() || 'Admin revoked premium access'
              });

              if (result.success) {
                showToast({
                  type: 'success',
                  text1: 'Premium Access Revoked',
                  text2: `Successfully revoked premium for ${userEmail}`
                });
                
                // Refresh subscription details
                await handleCheckStatus();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to revoke premium access');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCheckStatus = async () => {
    if (!userEmail.trim()) {
      Alert.alert('Error', 'Please enter a user email');
      return;
    }

    setLoading(true);
    try {
      const details = await manualSubscriptionService.getSubscriptionDetails(userEmail.trim());
      setSubscriptionDetails(details);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check subscription status');
      setSubscriptionDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">
          🛠️ Admin Subscription Management
        </Text>
        
        <Text className="text-sm text-red-600 mb-4">
          ⚠️ Development/Testing Only - Do not use in production
        </Text>

        {/* User Email Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">User Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            placeholder="user@example.com"
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Plan ID Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Plan ID (Optional)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            placeholder="test_premium, admin_premium, etc."
            value={planId}
            onChangeText={setPlanId}
          />
        </View>

        {/* Source Selection */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Source</Text>
          <View className="flex-row flex-wrap">
            {['testing', 'promotional', 'manual_admin', 'customer_support'].map((sourceOption) => (
              <TouchableOpacity
                key={sourceOption}
                className={`px-3 py-1 rounded-full mr-2 mb-2 ${
                  source === sourceOption 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
                onPress={() => setSource(sourceOption)}
              >
                <Text className={`text-xs ${
                  source === sourceOption 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}>
                  {sourceOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Notes (Optional)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            placeholder="Reason for manual subscription change..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            className={`bg-green-500 rounded-lg py-3 ${loading ? 'opacity-50' : ''}`}
            onPress={handleGrantPremium}
            disabled={loading}
          >
            <Text className="text-white text-center font-medium">
              🏆 Grant Premium Access
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-blue-500 rounded-lg py-3 ${loading ? 'opacity-50' : ''}`}
            onPress={handleStartTrial}
            disabled={loading}
          >
            <Text className="text-white text-center font-medium">
              🆓 Start Free Trial
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-red-500 rounded-lg py-3 ${loading ? 'opacity-50' : ''}`}
            onPress={handleRevokePremium}
            disabled={loading}
          >
            <Text className="text-white text-center font-medium">
              ❌ Revoke Premium Access
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-gray-500 rounded-lg py-3 ${loading ? 'opacity-50' : ''}`}
            onPress={handleCheckStatus}
            disabled={loading}
          >
            <Text className="text-white text-center font-medium">
              🔍 Check Subscription Status
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription Details Display */}
      {subscriptionDetails && (
        <View className="bg-white rounded-lg p-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            📊 Subscription Details
          </Text>
          
          <View className="space-y-2">
            <Text className="text-sm">
              <Text className="font-medium">Status:</Text> {' '}
              <Text className={`${
                subscriptionDetails.subscription.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {subscriptionDetails.subscription.success ? 'Active' : 'Inactive'}
              </Text>
            </Text>
            
            <Text className="text-sm">
              <Text className="font-medium">Premium:</Text> {' '}
              <Text className={`${
                subscriptionDetails.subscription.isPremium ? 'text-green-600' : 'text-orange-600'
              }`}>
                {subscriptionDetails.subscription.isPremium ? 'Yes' : 'No'}
              </Text>
            </Text>
            
            <Text className="text-sm">
              <Text className="font-medium">Free Trial:</Text> {' '}
              <Text className={`${
                subscriptionDetails.subscription.free_trial ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {subscriptionDetails.subscription.free_trial ? 'Yes' : 'No'}
              </Text>
            </Text>
            
            {subscriptionDetails.subscription.time_remaining && (
              <Text className="text-sm">
                <Text className="font-medium">Time Remaining:</Text> {' '}
                {subscriptionDetails.subscription.time_remaining} days
              </Text>
            )}
            
            <Text className="text-sm">
              <Text className="font-medium">Primary Source:</Text> {' '}
              {subscriptionDetails.sourcePriority.primary}
            </Text>
            
            <Text className="text-sm">
              <Text className="font-medium">Method:</Text> {' '}
              {subscriptionDetails.subscription.method || 'N/A'}
            </Text>
            
            {subscriptionDetails.subscription.source && (
              <Text className="text-sm">
                <Text className="font-medium">Source:</Text> {' '}
                {subscriptionDetails.subscription.source}
              </Text>
            )}
            
            <Text className="text-sm text-gray-600 mt-2">
              <Text className="font-medium">Recommendation:</Text> {' '}
              {subscriptionDetails.recommendation}
            </Text>
          </View>
        </View>
      )}
      
      <View className="h-20" />
    </ScrollView>
  );
};
