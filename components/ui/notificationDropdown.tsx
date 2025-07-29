import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

interface FilterState {
  startDate: string;
  endDate: string;
  category: string;
  type: string;
  company: string;
  cashbook: string;
}

interface TransactionFilterProps {
  visible: boolean;
  onClose: () => void;
  position?: { top: number; right: number }; // Position relative to filter icon
}

export default function NotificationDropdown({
  visible,
  onClose,
  position = { top: 80, right: 16 },
}: TransactionFilterProps) {
  const theme = useColorScheme();
const [notifications, setNotifications] = useState([]);

  const handleReset = useCallback(() => {
    setNotifications([]);
}, []);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      {/* Backdrop */}
      <TouchableOpacity 
        className="flex-1 bg-transparent" 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* Dropdown Container */}
        <View 
          className="absolute bg-white dark:bg-[#1A1E4A] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 max-h-96"
          style={{ 
            top: position.top, 
            right: position.right,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <ThemedText className="text-base font-bold">Notifications</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={20}
                color={theme === 'dark' ? 'white' : 'black'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-3" showsVerticalScrollIndicator={false}>
            { notifications.length > 0 ? (
                <View className="flex-row flex-wrap space-x-2 space-y-2 mb-4">
                    {notifications.map((notification, index) => (
                        <TouchableOpacity
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                            onPress={() => {
                                // Handle notification click
                            }}
                        >
                            <Text className="text-xs text-gray-700 dark:text-gray-300">
                                {notification.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    No new notifications
                </Text>
            )}
          </ScrollView>

          {/* Footer Actions - Compact */}
          <View className="flex-row p-3 space-x-2 border-t border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 items-center"
            >
              <Text className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 dark:bg-cyan-500 items-center"
            >
              <Text className="text-xs text-white font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

    </Modal>
  );
}
