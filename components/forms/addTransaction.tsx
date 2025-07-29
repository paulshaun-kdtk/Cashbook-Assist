import { useStoredUsername } from '@/hooks/useStoredUsername';
import { useToast } from '@/hooks/useToast';
import { RootState } from '@/redux/store';
import { fetchCategoriesThunk } from '@/redux/thunks/categories/fetch';
import { createExpenseThunk } from '@/redux/thunks/expenses/post';
import { createIncomeThunk } from '@/redux/thunks/income/post';
import { Category } from '@/types/category';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedText } from '../ThemedText';
import ItemPickerModal from '../ui/itemPickerModal';
import AddCategoryForm from './addCategory';

export default function AddTransactionForm({onFormSubmit}: {onFormSubmit?: (() => void) | null}) {
  const theme = useColorScheme(); // 'light' or 'dark'
  const which_cashbook = useLocalSearchParams().id;
  const {username} = useStoredUsername()
  const [date, setDate] = React.useState(new Date());
  const [datePickerOpen, setShowDatePicker] = React.useState(false);
  const { categories } = useSelector((state: RootState) => state.categories);
  const [showCategoryPicker, setShowCategoryPicker] = React.useState(false);
  const [category, setCategory] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const dispatch = useDispatch()
  const toast = useToast()

  React.useEffect(() => {
    if (username) {
      dispatch(fetchCategoriesThunk(username));
    }
  }, [dispatch, username]);

  const defaultCategories = [
    {name: 'Personal', description: 'For personal expenses'},
    {name: 'Business', description: 'For business expenses'},
    {name: 'Travel', description: 'For travel expenses'},
    {name: 'Shopping', description: 'For shopping expenses'},
    {name: 'Health', description: 'For health expenses'},
    {name: 'Food', description: 'For food expenses'},
  ]

  const allCategories = [...(categories || []), ...defaultCategories];


  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      description: '',
      memo: '',
      amount: '', 
      type: 'expense',
    }
  });

  const transactionType = watch('type');

  const modalizeRef = React.useRef<Modalize>(null);

  const handleAddCashbook = () => {
    modalizeRef.current?.open();
  };

    const  handleCloseModal = () => {
        modalizeRef.current?.close();
        if (username) {
          dispatch(fetchCategoriesThunk(username));
        }
      }
  
  const onSubmit = async data => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const transactionData = {
      description: data.description,
      category: category,
      memo: data.memo,
      amount: parseFloat(data.amount), 
      which_cashbook: which_cashbook,
      which_key: username,
      createdAt: new Date(date).toISOString(),
    };
    try {
      const success = data.type === 'income' ? await dispatch(createIncomeThunk({data: transactionData})).unwrap() : await dispatch(createExpenseThunk({data: transactionData})).unwrap()
       if (success) {
            toast.showToast({ type: 'success', text1: 'Transaction added successfully!' });
            onFormSubmit && onFormSubmit()
        }
    }  catch (error) {
        console.log(error)
        toast.showToast({ type: 'error', text1: error?.message || 'Transaction creation failed, please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12 min-h-screen" style={{ zIndex: 10000, elevation: 1000 }}>
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText type='subtitle' className="text-xl font-bold">Add New Transaction</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 350 }}>
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
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-2"  
          > 
            <Text className="text-base font-bold dark:text-white">{date.toDateString()}</Text>
          </TouchableOpacity>

          {/* Description Input */}
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</ThemedText>
          <Controller
            control={control}
            rules={{ required: true }}
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

          <TouchableOpacity className='bg-transparent p-4 rounded-lg border border-gray-300 dark:border-gray-700 text-black dark:text-white mb-2' onPress={() => setShowCategoryPicker(true)}>
            <Text className='text-base font-bold dark:text-cyan-500'>{category || 'Select a category'}</Text>
          </TouchableOpacity>

          <TouchableOpacity className='bg-transparent p-2' onPress={handleAddCashbook} activeOpacity={0.5} hitSlop={10}>
            <Text className='text-base font-bold dark:text-cyan-500'>Add new category</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-full p-4 rounded-xl items-center justify-center shadow-md mt-4 ${
              isSubmitting 
                ? 'bg-gray-400 dark:bg-gray-600' 
                : 'bg-cyan-600 dark:bg-cyan-500'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text className="text-white text-lg font-bold">
              {isSubmitting ? 'Adding Transaction...' : 'Add Transaction'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modalize rootStyle={{ backgroundColor: 'transparent' }} modalStyle={{ backgroundColor: 'transparent' }} ref={modalizeRef}><AddCategoryForm onFormSubmit={handleCloseModal} /></Modalize>
      
      <DatePicker
        modal
        open={datePickerOpen}
        date={date}
        mode='date'
        onConfirm={(date) => {
          setShowDatePicker(false)
          setDate(date)
        }}
        onCancel={() => {
          setShowDatePicker(false)
        }}
      />

          <ItemPickerModal
                  items={allCategories}
                  visible={showCategoryPicker}
                  onClose={() => setShowCategoryPicker(false)}
                  onSelectItem={(item: Category) => {
                  setCategory(item.name);
                  setShowCategoryPicker(false);
                  }}
              />
    </View>
  );
}
