import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { ThemedText } from '../ThemedText';

interface FilterOptions {
  searchTerm: string;
  sortBy: 'name' | 'date' | 'balance';
  sortOrder: 'asc' | 'desc';
  balanceFilter: 'all' | 'positive' | 'negative' | 'zero';
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface CashbookFilterProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export default function CashbookFilter({ 
  visible, 
  onClose, 
  onApplyFilters, 
  currentFilters 
}: CashbookFilterProps) {
  const theme = useColorScheme();
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      searchTerm: '',
      sortBy: 'name',
      sortOrder: 'asc',
      balanceFilter: 'all',
      dateRange: { start: null, end: null }
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const SortOption = ({ 
    value, 
    label, 
    isSelected 
  }: { 
    value: FilterOptions['sortBy']; 
    label: string; 
    isSelected: boolean; 
  }) => (
    <TouchableOpacity
      onPress={() => setFilters(prev => ({ ...prev, sortBy: value }))}
      className={`p-3 rounded-lg mr-2 mb-2 ${
        isSelected 
          ? 'bg-cyan-600 dark:bg-cyan-500' 
          : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <Text className={`text-sm font-medium ${
        isSelected 
          ? 'text-white' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const BalanceFilterOption = ({ 
    value, 
    label, 
    isSelected 
  }: { 
    value: FilterOptions['balanceFilter']; 
    label: string; 
    isSelected: boolean; 
  }) => (
    <TouchableOpacity
      onPress={() => setFilters(prev => ({ ...prev, balanceFilter: value }))}
      className={`p-3 rounded-lg mr-2 mb-2 ${
        isSelected 
          ? 'bg-cyan-600 dark:bg-cyan-500' 
          : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <Text className={`text-sm font-medium ${
        isSelected 
          ? 'text-white' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-[#0B0D2A]">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={onClose}>
            <Ionicons 
              name="close" 
              size={24} 
              color={theme === 'dark' ? 'white' : 'black'} 
            />
          </TouchableOpacity>
          <ThemedText className="text-lg font-bold">Filter Cashbooks</ThemedText>
          <TouchableOpacity onPress={handleReset}>
            <ThemedText className="text-cyan-600 dark:text-cyan-400 font-medium">Reset</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Search */}
          <View className="mb-6">
            <ThemedText className="text-base font-semibold mb-2">Search</ThemedText>
            <View className="relative">
              <TextInput
                className="w-full p-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
                placeholder="Search cashbooks by name..."
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={filters.searchTerm}
                onChangeText={(text) => setFilters(prev => ({ ...prev, searchTerm: text }))}
              />
              <Ionicons
                name="search"
                size={20}
                color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                style={{ position: 'absolute', left: 12, top: 14 }}
              />
            </View>
          </View>

          {/* Sort By */}
          <View className="mb-6">
            <ThemedText className="text-base font-semibold mb-3">Sort By</ThemedText>
            <View className="flex-row flex-wrap">
              <SortOption value="name" label="Name" isSelected={filters.sortBy === 'name'} />
              <SortOption value="date" label="Date Created" isSelected={filters.sortBy === 'date'} />
              <SortOption value="balance" label="Balance" isSelected={filters.sortBy === 'balance'} />
            </View>
            
            {/* Sort Order */}
            <View className="flex-row mt-3">
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                className={`flex-row items-center p-3 rounded-lg mr-3 ${
                  filters.sortOrder === 'asc' 
                    ? 'bg-cyan-600 dark:bg-cyan-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <MaterialIcons
                  name="arrow-upward"
                  size={18}
                  color={filters.sortOrder === 'asc' ? 'white' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')}
                />
                <Text className={`ml-2 text-sm font-medium ${
                  filters.sortOrder === 'asc' 
                    ? 'text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Ascending
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
                className={`flex-row items-center p-3 rounded-lg ${
                  filters.sortOrder === 'desc' 
                    ? 'bg-cyan-600 dark:bg-cyan-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <MaterialIcons
                  name="arrow-downward"
                  size={18}
                  color={filters.sortOrder === 'desc' ? 'white' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')}
                />
                <Text className={`ml-2 text-sm font-medium ${
                  filters.sortOrder === 'desc' 
                    ? 'text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Descending
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Filter */}
          <View className="mb-6">
            <ThemedText className="text-base font-semibold mb-3">Balance Filter</ThemedText>
            <View className="flex-row flex-wrap">
              <BalanceFilterOption value="all" label="All Balances" isSelected={filters.balanceFilter === 'all'} />
              <BalanceFilterOption value="positive" label="Positive" isSelected={filters.balanceFilter === 'positive'} />
              <BalanceFilterOption value="negative" label="Negative" isSelected={filters.balanceFilter === 'negative'} />
              <BalanceFilterOption value="zero" label="Zero" isSelected={filters.balanceFilter === 'zero'} />
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="p-4 border-t border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={handleApply}
            className="w-full p-4 bg-cyan-600 dark:bg-cyan-500 rounded-xl items-center"
          >
            <Text className="text-white text-lg font-bold">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
