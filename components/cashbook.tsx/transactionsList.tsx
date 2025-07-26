import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { ThemedText } from '../ThemedText';

export default function TransactionsListScreen() {
  const theme = useColorScheme(); // 'light' or 'dark'

  // Dummy data for a specific cashbook and its transactions
  // In a real app, the cashbook details would likely be passed as props or fetched
  const cashbookName = 'Main Operating Account'; // This would come from navigation params or state
  const transactions = [
    {
      id: 't1',
      description: 'Software License Renewal',
      date: 'July 24, 2025',
      amount: '-$1,200.00',
      type: 'expense',
    },
    {
      id: 't2',
      description: 'Client Payment - Project Alpha',
      date: 'July 23, 2025',
      amount: '+$5,000.00',
      type: 'income',
    },
    {
      id: 't3',
      description: 'Office Supplies Purchase',
      date: 'July 22, 2025',
      amount: '-$150.50',
      type: 'expense',
    },
    {
      id: 't4',
      description: 'Consulting Fee - Q2',
      date: 'July 20, 2025',
      amount: '+$2,500.00',
      type: 'income',
    },
    {
      id: 't5',
      description: 'Utility Bill',
      date: 'July 18, 2025',
      amount: '-$320.00',
      type: 'expense',
    },
    {
      id: 't6',
      description: 'Refund - Vendor X',
      date: 'July 15, 2025',
      amount: '+$80.00',
      type: 'income',
    },
  ];

  const handleAddTransaction = () => {
    console.log("Add new transaction button pressed for", cashbookName);
    // Logic to navigate to an 'add transaction' screen or open a modal
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Header */}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <TouchableOpacity className="absolute left-4 p-2 rounded-full">
          <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
        <ThemedText className="text-xl font-bold">{cashbookName}</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Transactions List Header */}
        <View className="px-4 mb-4">
          <ThemedText className="text-base font-semibold text-black dark:text-white">Transactions</ThemedText>
        </View>

        {/* Transactions List */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {transactions.map((transaction, index) => (
            <TouchableOpacity
              key={transaction.id}
              className={`flex-row items-center py-3 px-4 ${
                index < transactions.length - 1 ? 'border-b border-gray-200 dark:border-[#2C2F5D]' : ''
              }`}
            >
              {/* Icon for transaction type */}
              <Ionicons
                name={transaction.type === 'income' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
                size={28}
                color={
                  transaction.type === 'income'
                    ? (theme === 'dark' ? '#4ADE80' : '#22C55E') // Green for income
                    : (theme === 'dark' ? '#F87171' : '#EF4444') // Red for expense
                }
                className="mr-4"
              />
              <View className="flex-1">
                <ThemedText className="text-base font-semibold">{transaction.description}</ThemedText>
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</ThemedText>
              </View>
              <View className="items-end">
                <ThemedText
                  className={`text-base font-bold mt-1 ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.amount}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add New Transaction Button */}
        <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-green-500 dark:bg-green-600 items-center justify-center shadow-md"
          onPress={handleAddTransaction}
        >
          <Text className="text-white text-lg font-bold">Add New Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
