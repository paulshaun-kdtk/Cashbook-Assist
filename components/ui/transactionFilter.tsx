import { ThemedText } from '@/components/ThemedText';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { RootState } from '@/redux/store';
import { fetchCategoriesThunk } from '@/redux/thunks/categories/fetch';
import { Category } from '@/types/category';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import ItemPickerModal from './itemPickerModal';

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
  onApplyFilter: (filters: FilterState) => void;
  currentFilters: FilterState;
  position?: { top: number; right: number }; // Position relative to filter icon
}

export default function TransactionFilter({
  visible,
  onClose,
  onApplyFilter,
  currentFilters,
  position = { top: 80, right: 16 },
}: TransactionFilterProps) {
  const theme = useColorScheme();
  const dispatch = useDispatch();
  const { username } = useStoredUsername();
  
  const { categories } = useSelector((state: RootState) => state.categories);
  const { companies } = useSelector((state: RootState) => state.companies);
  const { cashbooks } = useSelector((state: RootState) => state.cashbooks);

  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [showCashbookPicker, setShowCashbookPicker] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (username) {
      dispatch(fetchCategoriesThunk(username) as any);
    }
  }, [dispatch, username]);

  useEffect(() => {
    setFilters(currentFilters);
    if (currentFilters.startDate) {
      setStartDate(new Date(currentFilters.startDate));
    }
    if (currentFilters.endDate) {
      setEndDate(new Date(currentFilters.endDate));
    }
  }, [currentFilters]);

  const defaultCategories = [
    { name: 'Personal', description: 'For personal expenses' },
    { name: 'Business', description: 'For business expenses' },
    { name: 'Travel', description: 'For travel expenses' },
    { name: 'Shopping', description: 'For shopping expenses' },
    { name: 'Health', description: 'For health expenses' },
    { name: 'Food', description: 'For food expenses' },
  ];

  const allCategories = [...(categories || []), ...defaultCategories];

  const handleApply = useCallback(() => {
    onApplyFilter(filters);
    onClose();
  }, [filters, onApplyFilter, onClose]);

  const handleReset = useCallback(() => {
    const resetFilters: FilterState = {
      startDate: '',
      endDate: '',
      category: '',
      type: '',
      company: '',
      cashbook: '',
    };
    setFilters(resetFilters);
    setStartDate(new Date());
    setEndDate(new Date());
  }, []);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
            <ThemedText className="text-base font-bold">Filters</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={20}
                color={theme === 'dark' ? 'white' : 'black'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-3" showsVerticalScrollIndicator={false}>
            {/* Quick Filter Buttons */}
            <View className="mb-4">
              <ThemedText className="text-xs font-semibold mb-2">Quick Filters</ThemedText>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  className={`px-3 py-2 rounded-full border ${
                    filters.type === '' 
                      ? 'bg-cyan-100 dark:bg-cyan-800 border-cyan-500' 
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onPress={() => updateFilter('type', '')}
                >
                  <Text className={`text-xs font-medium ${
                    filters.type === '' ? 'text-cyan-700 dark:text-cyan-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    All
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`px-3 py-2 rounded-full border ${
                    filters.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-800 border-green-500' 
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onPress={() => updateFilter('type', 'income')}
                >
                  <Text className={`text-xs font-medium ${
                    filters.type === 'income' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Income
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`px-3 py-2 rounded-full border ${
                    filters.type === 'expense' 
                      ? 'bg-red-100 dark:bg-red-800 border-red-500' 
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  onPress={() => updateFilter('type', 'expense')}
                >
                  <Text className={`text-xs font-medium ${
                    filters.type === 'expense' ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Range - Compact */}
            <View className="mb-4">
              <ThemedText className="text-xs font-semibold mb-2">Date Range</ThemedText>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                className="p-2 mb-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#2A2E5A]"
              >
                <Text className="text-xs text-gray-600 dark:text-gray-400">Start Date</Text>
                <Text className="text-sm text-black dark:text-white">
                  {filters.startDate ? new Date(filters.startDate).toLocaleDateString() : 'Select Start Date'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#2A2E5A]"
              >
                <Text className="text-xs text-gray-600 dark:text-gray-400">End Date</Text>
                <Text className="text-sm text-black dark:text-white">
                  {filters.endDate ? new Date(filters.endDate).toLocaleDateString() : 'Select End Date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category - Compact */}
            <View className="mb-4">
              <ThemedText className="text-xs font-semibold mb-2">Category</ThemedText>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(true)}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#2A2E5A]"
              >
                <Text className="text-sm text-black dark:text-white">
                  {filters.category || 'All Categories'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Company - Compact */}
            <View className="mb-4">
              <ThemedText className="text-xs font-semibold mb-2">Company</ThemedText>
              <TouchableOpacity
                onPress={() => setShowCompanyPicker(true)}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#2A2E5A]"
              >
                <Text className="text-sm text-black dark:text-white">
                  {filters.company || 'All Companies'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cashbook - Compact */}
            <View className="mb-4">
              <ThemedText className="text-xs font-semibold mb-2">Cashbook</ThemedText>
              <TouchableOpacity
                onPress={() => setShowCashbookPicker(true)}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#2A2E5A]"
              >
                <Text className="text-sm text-black dark:text-white">
                  {filters.cashbook || 'All Cashbooks'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Actions - Compact */}
          <View className="flex-row p-3 space-x-2 border-t border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 items-center"
            >
              <Text className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 dark:bg-cyan-500 items-center"
            >
              <Text className="text-xs text-white font-semibold">Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showStartDatePicker}
        date={startDate}
        mode="date"
        onConfirm={(date) => {
          setShowStartDatePicker(false);
          setStartDate(date);
          updateFilter('startDate', date.toISOString());
        }}
        onCancel={() => setShowStartDatePicker(false)}
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={endDate}
        mode="date"
        onConfirm={(date) => {
          setShowEndDatePicker(false);
          setEndDate(date);
          updateFilter('endDate', date.toISOString());
        }}
        onCancel={() => setShowEndDatePicker(false)}
      />

      {/* Category Picker */}
      <ItemPickerModal
        items={allCategories}
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        onSelectItem={(item: Category) => {
          updateFilter('category', item.name);
          setShowCategoryPicker(false);
        }}
      />

      {/* Company Picker */}
      <ItemPickerModal
        items={companies || []}
        visible={showCompanyPicker}
        onClose={() => setShowCompanyPicker(false)}
        onSelectItem={(item: any) => {
          updateFilter('company', item.name);
          setShowCompanyPicker(false);
        }}
      />

      {/* Cashbook Picker */}
      <ItemPickerModal
        items={cashbooks || []}
        visible={showCashbookPicker}
        onClose={() => setShowCashbookPicker(false)}
        onSelectItem={(item: any) => {
          updateFilter('cashbook', item.name);
          setShowCashbookPicker(false);
        }}
      />
    </Modal>
  );
}
