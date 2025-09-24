import { useSubscriptionRestrictions } from '@/hooks/useSubscriptionRestrictions';
import { RootState } from '@/redux/store';
import { subscriptionService } from '@/services/subscription/subscriptionService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

interface SubscriptionStatusCardProps {
  onUpgradePress?: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ 
  onUpgradePress 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userEmail = (user as any)?.email;
  const { 
    canCreateCompany, 
    canCreateCashbook, 
    canCreateTransaction, 
    counts,
    refreshRestrictions
  } = useSubscriptionRestrictions();

  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [forceRefreshKey, setForceRefreshKey] = useState(0);

  // Force refresh subscription status periodically and when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const refreshSubscriptionStatus = async () => {
      if (!userEmail) return;

      try {
        console.log('🔄 SubscriptionStatusCard: Refreshing subscription status');
        
        // Force refresh to get latest status (bypasses cache)
        const status = await subscriptionService.forceRefreshSubscriptionStatus(user);
        
        if (isMounted) {
          setSubscriptionStatus(status);
          console.log('📊 SubscriptionStatusCard: Status updated', {
            isPremium: status.isPremium,
            isFreeTrial: status.isFreeTrial,
            subscriptionStatus: status.subscriptionStatus
          });
        }
      } catch (error) {
        console.error('❌ SubscriptionStatusCard: Error refreshing status:', error);
      }
    };

    refreshSubscriptionStatus();

    // Set up periodic refresh every 30 seconds to catch status changes
    const refreshInterval = setInterval(refreshSubscriptionStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [user, userEmail, forceRefreshKey]);

  // Enhanced logic to determine if user is on free trial
  // Use both the restriction checks AND the direct subscription status
  const isFreeTrial = (() => {
    // If we have subscription status, use it as the primary source
    if (subscriptionStatus) {
      // User has premium subscription - definitely not free trial
      if (subscriptionStatus.isPremium) {
        console.log('✅ SubscriptionStatusCard: User has premium - hiding banner');
        return false;
      }
      
      // User is explicitly on free trial
      if (subscriptionStatus.isFreeTrial && subscriptionStatus.subscriptionStatus === 'pending') {
        console.log('🕒 SubscriptionStatusCard: User on free trial - showing banner');
        return true;
      }
      
      // No subscription - show trial to encourage signup
      if (subscriptionStatus.subscriptionStatus === 'none') {
        console.log('📝 SubscriptionStatusCard: No subscription - showing trial banner');
        return true;
      }
    }
    
    // Fallback to restriction-based detection if subscription status unavailable
    const hasRestrictions = !canCreateCompany.loading && (
      !canCreateCompany.allowed || 
      !canCreateCashbook.allowed || 
      !canCreateTransaction.allowed 
    );
    
    console.log('📊 SubscriptionStatusCard: Using restriction fallback', {
      hasRestrictions,
      subscriptionStatus: subscriptionStatus?.subscriptionStatus || 'unknown'
    });
    
    return hasRestrictions;
  })();

  // Add a manual refresh function for testing
  const handleRefresh = async () => {
    console.log('🔄 SubscriptionStatusCard: Manual refresh triggered');
    setForceRefreshKey(prev => prev + 1);
    // Also refresh the restrictions
    if (refreshRestrictions) {
      refreshRestrictions();
    }
  };

  if (!isFreeTrial) {
    console.log('✅ SubscriptionStatusCard: Not showing banner - user has premium access');
    return null; 
  }

  console.log('🎯 SubscriptionStatusCard: Showing free trial banner');

  return (
    <View className="mx-4 mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="gift" size={20} color="#EA580C" />
          <Text className="text-orange-800 dark:text-orange-200 font-semibold text-base ml-2">
            Free Trial
          </Text>
          {subscriptionStatus?.subscriptionStatus && (
            <Text className="text-orange-600 text-xs ml-2 opacity-75">
              ({subscriptionStatus.subscriptionStatus})
            </Text>
          )}
        </View>
        <View className="flex-row items-center space-x-2">
          {/* Debug refresh button (only in development) */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={handleRefresh}
              className="bg-gray-500 px-2 py-1 rounded-full"
            >
              <Text className="text-white text-xs">↻</Text>
            </TouchableOpacity>
          )}
          {onUpgradePress && (
            <TouchableOpacity
              onPress={onUpgradePress}
              className="bg-orange-600 px-3 py-1 rounded-full"
            >
              <Text className="text-white text-xs font-medium">Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="space-y-2">
        {/* Companies Usage */}
        <View className="flex-row justify-between items-center">
          <Text className="text-orange-700 dark:text-orange-300 text-sm">
            Companies
          </Text>
          <Text className="text-orange-800 dark:text-orange-200 text-sm font-medium">
            {counts.companies}/1
          </Text>
        </View>

        {/* Cashbooks Usage */}
        <View className="flex-row justify-between items-center">
          <Text className="text-orange-700 dark:text-orange-300 text-sm">
            Cashbooks
          </Text>
          <Text className="text-orange-800 dark:text-orange-200 text-sm font-medium">
            {counts.cashbooks}/1
          </Text>
        </View>

        {/* Transactions Usage */}
        <View className="flex-row justify-between items-center">
          <Text className="text-orange-700 dark:text-orange-300 text-sm">
            Transactions
          </Text>
          <Text className="text-orange-800 dark:text-orange-200 text-sm font-medium">
            {counts.transactions}/1000
          </Text>
        </View>
      </View>

      {/* Progress Bar for Transactions */}
      <View className="mt-3">
        <View className="bg-orange-200 dark:bg-orange-800/40 h-2 rounded-full overflow-hidden">
          <View 
            className="bg-orange-500 h-full" 
            style={{ 
              width: `${Math.min((counts.transactions / 1000) * 100, 100)}%` 
            }}
          />
        </View>
        <Text className="text-orange-600 dark:text-orange-400 text-xs mt-1 text-center">
          {counts.transactions >= 1000 ? 
            'Transaction limit reached' : 
            `${1000 - counts.transactions} transactions remaining`
          }
        </Text>
      </View>
    </View>
  );
};
