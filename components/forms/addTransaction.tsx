import { useStoredUsername } from '@/hooks/useStoredUsername';
import { useToast } from '@/hooks/useToast';
import { createExpenseThunk } from '@/redux/thunks/expenses/post';
import { createIncomeThunk } from '@/redux/thunks/income/post';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { ThemedText } from '../ThemedText';

export default function AddTransactionForm({onFormSubmit=null}) {
  const theme = useColorScheme(); // 'light' or 'dark'
  const which_cashbook = useLocalSearchParams().id;
  const {username} = useStoredUsername()
  const dispatch = useDispatch()
  const toast = useToast()

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: '',
      description: '',
      memo: '',
      amount: '', 
      type: 'expense',
      category: '',
    }
  });

  const transactionType = watch('type');

  const onSubmit = async data => {
    const transactionData = {
      description: data.description,
      category: data.category,
      memo: data.memo,
      amount: parseFloat(data.amount), 
      which_cashbook: which_cashbook,
      which_key: username,
      createdAt: new Date(data.date).toISOString(),
    };
    try {
      const success = data.type === 'income' ? await dispatch(createIncomeThunk({data: transactionData})).unwrap() : await dispatch(createExpenseThunk({data: transactionData})).unwrap()
       if (success) {
            toast.showToast({ type: 'success', text1: 'Transaction added successfully!' });
        }
    }  catch (error) {
        toast.showToast({ type: 'error', text1: error?.message || 'Company creation failed, please try again.' });
    }
    onFormSubmit && onFormSubmit()
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12 min-h-screen">
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText type='subtitle' className="text-xl font-bold">Add New Transaction</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg p-4">

          {/* Type Selector (Income/Expense) */}
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Transaction Type</ThemedText>
          <View className="flex-row rounded-lg bg-white dark:bg-[#0B0D2A] border border-gray-300 dark:border-gray-700 mb-4 overflow-hidden">
            <TouchableOpacity
              className={`flex-1 items-center py-3 ${transactionType === 'income' ? 'bg-cyan-600 dark:bg-cyan-500' : ''}`}
              onPress={() => setValue('type', 'income')}
            >
              <Text className={`text-base font-bold ${transactionType === 'income' ? 'text-white' : 'text-black dark:text-white'}`}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 items-center py-3 ${transactionType === 'expense' ? 'bg-red-500 dark:bg-red-600' : ''}`}
              onPress={() => setValue('type', 'expense')}
            >
              <Text className={`text-base font-bold ${transactionType === 'expense' ? 'text-white' : 'text-black dark:text-white'}`}>Expense</Text>
            </TouchableOpacity>
          </View>

          {/* Date Input */}
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Date</ThemedText>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-2"
                placeholder="e.g., YYYY-MM-DD"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numbers-and-punctuation" // For date format
              />
            )}
            name="date"
          />
          {errors.date && (
            <Text className="text-red-500 text-xs mb-4">
              {errors.date.type === 'required' && 'Date is required.'}
            </Text>
          )}

          {/* Description Input */}
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</ThemedText>
          <Controller
            control={control}
            rules={{ required: true, minLength: 5 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-2"
                placeholder="e.g., Monthly Rent Payment"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="sentences"
              />
            )}
            name="description"
          />
          {errors.description && (
            <Text className="text-red-500 text-xs mb-4">
              {errors.description.type === 'required' && 'Description is required.'}
              {errors.description.type === 'minLength' && 'Description must be at least 5 characters.'}
            </Text>
          )}

          {/* Memo Input */}
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Memo (Optional)</ThemedText>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-2"
                placeholder="e.g., For office supplies"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="sentences"
              />
            )}
            name="memo"
          />

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Amount</ThemedText>
          <Controller
            control={control}
            rules={{ required: true, pattern: /^\d+(\.\d{1,2})?$/ }} // Allows positive numbers with up to 2 decimal places
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-2"
                placeholder="e.g., 150.75"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numbers-and-punctuation"
              />
            )}
            name="amount"
          />
          {errors.amount && (
            <Text className="text-red-500 text-xs mb-4">
              {errors.amount.type === 'required' && 'Amount is required.'}
              {errors.amount.type === 'pattern' && 'Please enter a valid positive number (e.g., 123.45).'}
            </Text>
          )}

          {/* Category Input */}
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Category</ThemedText>
          <Controller
            control={control}
            rules={{ required: true, minLength: 3 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-2"
                placeholder="e.g., Utilities, Salary, Travel"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="words"
              />
            )}
            name="category"
          />
          {errors.category && (
            <Text className="text-red-500 text-xs mb-4">
              {errors.category.type === 'required' && 'Category is required.'}
              {errors.category.type === 'minLength' && 'Category must be at least 3 characters.'}
            </Text>
          )}


          <TouchableOpacity
            className="w-full p-4 rounded-xl bg-cyan-600 dark:bg-cyan-500 items-center justify-center shadow-md mt-4"
            onPress={handleSubmit(onSubmit)}
          >
            <Text className="text-white text-lg font-bold">Add Transaction</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
