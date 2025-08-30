import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Category } from '../../types/category';
import { AICategorySuggestions } from '../ai/AICategorySuggestions';

interface SmartTransactionFormProps {
  categories: Category[];
  onSubmit: (transaction: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    memo: string;
  }) => void;
  onCancel: () => void;
  style?: object;
}

export const SmartTransactionForm: React.FC<SmartTransactionFormProps> = ({
  categories,
  onSubmit,
  onCancel,
  style
}) => {
  const theme = useColorScheme();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [memo, setMemo] = useState('');

  // Clear selected category when transaction type changes
  useEffect(() => {
    setSelectedCategory('');
  }, [type]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    // Prevent rapid type changes that might cause issues
    if (type !== newType) {
      setType(newType);
    }
  };

  // Cleanup effect to prevent memory leaks and navigation context issues
  useEffect(() => {
    return () => {
      // Cleanup any pending operations when component unmounts
    };
  }, []);

  const handleSubmit = () => {
    if (!description.trim() || !amount || !selectedCategory) {
      return;
    }

    onSubmit({
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      memo: memo.trim()
    });

    // Reset form
    setDescription('');
    setAmount('');
    setSelectedCategory('');
    setMemo('');
  };

  const handleCategorySelect = (categoryName: string) => {
    // Check if it's an existing category
    const existingCategory = categories.find(cat => cat.name === categoryName);
    if (existingCategory) {
      setSelectedCategory(existingCategory.$id);
    } else {
      // For new categories, we'd need to create them first
      // For now, just use the name
      setSelectedCategory(categoryName);
    }
  };

  const selectedCategoryName = selectedCategory 
    ? categories.find(cat => cat.$id === selectedCategory)?.name || selectedCategory
    : '';

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A]">
      {/* Header */}
      <View className="px-6 pt-8 pb-4 bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-white">Smart Transaction</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        <View className="items-center">
          <View className="bg-white/20 px-4 py-2 rounded-full">
            <Text className="text-sm text-white/90">✨ AI-Powered Category Suggestions</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Transaction Type Toggle */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Transaction Type
            </Text>
            <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <TouchableOpacity
                onPress={() => handleTypeChange('expense')}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                  type === 'expense' 
                    ? 'bg-red-500 dark:bg-red-600 shadow-lg' 
                    : 'bg-transparent'
                }`}
              >
                <Text className="text-2xl mr-2">💸</Text>
                <Text className={`font-bold ${
                  type === 'expense' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTypeChange('income')}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                  type === 'income' 
                    ? 'bg-green-500 dark:bg-green-600 shadow-lg' 
                    : 'bg-transparent'
                }`}
              >
                <Text className="text-2xl mr-2">💰</Text>
                <Text className={`font-bold ${
                  type === 'income' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Description
            </Text>
            <View className="relative">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="What was this transaction for?"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-gray-800 dark:text-white text-base"
                multiline
                numberOfLines={2}
              />
              <View className="absolute top-4 right-4">
                <Ionicons 
                  name="document-text-outline" 
                  size={20} 
                  color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                />
              </View>
            </View>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Amount
            </Text>
            <View className="relative">
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                keyboardType="numeric"
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-gray-800 dark:text-white text-xl font-bold"
              />
              <View className="absolute top-4 right-4">
                <Text className="text-xl text-gray-500 dark:text-gray-400">$</Text>
              </View>
            </View>
          </View>

          {/* AI Category Suggestions */}
          {description.length > 0 && amount && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                🤖 AI Suggestions
              </Text>
              <AICategorySuggestions
                description={description}
                amount={parseFloat(amount) || 0}
                type={type}
                categories={categories}
                onCategorySelect={handleCategorySelect}
              />
            </View>
          )}

          {/* Selected Category Display */}
          {selectedCategoryName && (
            <View className="mb-6">
              <View className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
                <View className="flex-row items-center">
                  <View className="bg-green-500 rounded-full p-2 mr-3">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Selected Category
                    </Text>
                    <Text className="text-lg font-bold text-green-700 dark:text-green-300">
                      {selectedCategoryName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Manual Category Selection */}
          {!selectedCategory && categories.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Or choose manually:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={category.$id || index}
                      onPress={() => setSelectedCategory(category.$id)}
                      className={`bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${
                        index < categories.length - 1 ? 'mr-3' : ''
                      }`}
                    >
                      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Memo Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Notes (Optional)
            </Text>
            <View className="relative">
              <TextInput
                value={memo}
                onChangeText={setMemo}
                placeholder="Additional notes..."
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-gray-800 dark:text-white text-base min-h-[80px]"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View className="absolute top-4 right-4">
                <Ionicons 
                  name="document-outline" 
                  size={20} 
                  color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} 
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-6 bg-white dark:bg-[#0B0D2A] border-t border-gray-200 dark:border-gray-700">
        <View className="flex-row space-x-4">
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!description.trim() || !amount || !selectedCategory}
            className={`flex-2 py-4 rounded-xl items-center justify-center shadow-lg ${
              (!description.trim() || !amount || !selectedCategory)
                ? 'bg-gray-300 dark:bg-gray-700' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700'
            }`}
            style={{ flex: 2 }}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name="add-circle" 
                size={20} 
                color={(!description.trim() || !amount || !selectedCategory) ? '#9CA3AF' : 'white'} 
              />
              <Text className={`text-base font-bold ml-2 ${
                (!description.trim() || !amount || !selectedCategory)
                  ? 'text-gray-500 dark:text-gray-400' 
                  : 'text-white'
              }`}>
                Add Transaction
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
