import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { ThemedText } from '../ThemedText';

export default function CashbooksListScreen() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const router = useRouter()
  // Dummy data for a single company and its cashbooks
  // In a real app, the company details would likely be passed as props or fetched
  const companyName = 'Tech Innovators Inc.'; // This would come from navigation params or state
  const cashbooks = [
    {
      id: 'cb1',
      name: 'Main Operating Account',
      lastUpdated: '2h ago',
      amount: '$850,000.00',
      description: 'Primary account for daily operations.',
    },
    {
      id: 'cb2',
      name: 'Marketing Fund',
      lastUpdated: '1d ago',
      amount: '$200,000.00',
      description: 'Dedicated funds for marketing campaigns.',
    },
    {
      id: 'cb3',
      name: 'Payroll Account',
      lastUpdated: '3d ago',
      amount: '$150,000.00',
      description: 'Account for employee salaries and benefits.',
    },
    {
      id: 'cb4',
      name: 'Investment Portfolio',
      lastUpdated: '1w ago',
      amount: '$50,000.00',
      description: 'Long-term investment holdings.',
    },
    {
      id: 'cb5',
      name: 'Emergency Reserve',
      lastUpdated: '2w ago',
      amount: '$100,000.00',
      description: 'Funds for unforeseen circumstances.',
    },
  ];

  const handleAddCashbook = () => {
    console.log("Add new cashbook button pressed for", companyName);
    // Logic to navigate to an 'add cashbook' screen or open a modal
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Header */}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <TouchableOpacity className="absolute left-4 p-2 rounded-full" onPress={() => router.replace('/companies')}>
          <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
        <ThemedText className="text-xl font-bold">{companyName}</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cashbook List Header */}
        <View className="px-4 mb-4">
          <ThemedText className="text-base font-semibold text-black dark:text-white">Cashbooks</ThemedText>
        </View>

        {/* Cashbook List */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {cashbooks.map((cashbook, index) => (
            <TouchableOpacity
              key={cashbook.id}
              onPress={() => router.push(`/transactions/${cashbook.id}`)}
              className={`flex-row items-center py-3 px-4 ${
                index < cashbooks.length - 1 ? 'border-b border-gray-200 dark:border-[#2C2F5D]' : ''
              }`}
            >
              {/* Icon for cashbook */}
              <Ionicons
                name="wallet-outline" // Using a wallet icon for cashbooks
                size={28}
                color={theme === 'dark' ? 'white' : '#6B7280'}
                className="mr-4"
              />
              <View className="flex-1">
                <ThemedText className="text-base font-semibold">{cashbook.name}</ThemedText>
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">{cashbook.description}</ThemedText>
              </View>
              <View className="items-end">
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">{cashbook.lastUpdated}</ThemedText>
                <ThemedText className="text-base font-bold text-green-600 dark:text-green-400 mt-1">
                  {cashbook.amount}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add New Cashbook Button */}
        <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-green-500 dark:bg-green-600 items-center justify-center shadow-md"
          onPress={handleAddCashbook}
        >
          <Text className="text-white text-lg font-bold">Add New Cashbook</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
