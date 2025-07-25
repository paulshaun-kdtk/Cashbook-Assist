import { View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';

const DashboardScreen = () => {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  // Placeholder data - replace with actual data fetching/calculation
  useEffect(() => {
    const totalIncome = 2500;
    const totalExpenses = 1200;
    setIncome(totalIncome);
    setExpenses(totalExpenses);
    setBalance(totalIncome - totalExpenses);
  }, []);

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Cashbook Dashboard</Text>

      <View className="bg-white rounded-lg shadow-md p-4 mb-4">
        <Text className="text-lg font-semibold mb-2">Summary</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Income:</Text>
          <Text className="text-green-600 font-semibold">${income.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Expenses:</Text>
          <Text className="text-red-600 font-semibold">-${expenses.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Balance:</Text>
          <Text className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${balance.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* We can add more content here later, like recent transactions */}
    </View>
  );
};

export default DashboardScreen;