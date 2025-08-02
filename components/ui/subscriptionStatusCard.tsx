import { useSubscriptionRestrictions } from '@/hooks/useSubscriptionRestrictions';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionStatusCardProps {
  onUpgradePress?: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ 
  onUpgradePress 
}) => {
  const { 
    canCreateCompany, 
    canCreateCashbook, 
    canCreateTransaction, 
    counts 
  } = useSubscriptionRestrictions();

  // Check if user is on free trial (any restriction exists)
  const isFreeTrial = !canCreateCompany.loading && (
    !canCreateCompany.allowed || 
    !canCreateCashbook.allowed || 
    !canCreateTransaction.allowed ||
    counts.companies >= 1 ||
    counts.cashbooks >= 1 ||
    counts.transactions >= 1000
  );

  if (!isFreeTrial) {
    return null; // Don't show anything for premium users
  }

  return (
    <View className="mx-4 mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="gift" size={20} color="#EA580C" />
          <Text className="text-orange-800 dark:text-orange-200 font-semibold text-base ml-2">
            Free Trial
          </Text>
        </View>
        {onUpgradePress && (
          <TouchableOpacity
            onPress={onUpgradePress}
            className="bg-orange-600 px-3 py-1 rounded-full"
          >
            <Text className="text-white text-xs font-medium">Upgrade</Text>
          </TouchableOpacity>
        )}
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
            {counts.transactions}/1,000
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
