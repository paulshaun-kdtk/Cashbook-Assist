import { useSubscriptionValidation } from '@/hooks/useSubscriptionValidation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionStatusIndicatorProps {
  showDetails?: boolean;
}

export const SubscriptionStatusIndicator: React.FC<SubscriptionStatusIndicatorProps> = ({
  showDetails = false
}) => {
  const {
    validateNow,
    lastValidationTime,
    hasActiveSubscription,
    isValidating,
    syncedWithAppwrite,
    isValidationValid
  } = useSubscriptionValidation();

  const getStatusColor = () => {
    if (!isValidationValid) return '#EF4444'; // Red for errors
    if (hasActiveSubscription) return '#10B981'; // Green for premium
    return '#F59E0B'; // Orange for free trial
  };

  const getStatusText = () => {
    if (!isValidationValid) return 'Validation Error';
    if (hasActiveSubscription) return 'Premium Active';
    return 'Free Trial';
  };

  const getStatusIcon = () => {
    if (!isValidationValid) return 'alert-circle';
    if (hasActiveSubscription) return 'checkmark-circle';
    return 'time';
  };

  return (
    <View className="p-3 mx-4 my-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Status Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons 
            name={getStatusIcon()} 
            size={20} 
            color={getStatusColor()} 
          />
          <Text className="ml-2 font-medium text-black dark:text-white">
            {getStatusText()}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={validateNow}
          disabled={isValidating}
          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-md"
        >
          <Text className="text-xs text-blue-600 dark:text-blue-300">
            {isValidating ? 'Validating...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sync Status */}
      <View className="flex-row items-center mt-2">
        <Ionicons 
          name={syncedWithAppwrite ? 'cloud-done' : 'cloud-offline'} 
          size={16} 
          color={syncedWithAppwrite ? '#10B981' : '#6B7280'} 
        />
        <Text className="ml-1 text-xs text-gray-600 dark:text-gray-400">
          {syncedWithAppwrite ? 'Synced with server' : 'Sync pending'}
        </Text>
      </View>

      {/* Detailed Information */}
      {showDetails && (
        <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Last Validation: {lastValidationTime?.toLocaleTimeString() || 'Never'}
          </Text>
          
          {hasActiveSubscription && (
            <Text className="text-xs text-green-600 dark:text-green-400">
              ✓ Premium features unlocked
            </Text>
          )}
          
          {!hasActiveSubscription && (
            <Text className="text-xs text-orange-600 dark:text-orange-400">
              ⚠ Limited to free trial features
            </Text>
          )}
          
          {!isValidationValid && (
            <Text className="text-xs text-red-600 dark:text-red-400">
              ✗ Validation failed - using cached status
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
