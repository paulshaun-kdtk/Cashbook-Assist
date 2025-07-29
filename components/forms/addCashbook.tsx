import { currencyList } from '@/assets/data/currencyList';
import ItemPickerModal from '@/components/ui/itemPickerModal';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { useToast } from '@/hooks/useToast';
import { createCashbookThunk } from '@/redux/thunks/cashbooks/post';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { ThemedText } from '../ThemedText';

export default function AddCashbookForm({onFormSubmit=null}) {
  const theme = useColorScheme(); // 'light' or 'dark'
  const whichCompany = useLocalSearchParams()?.id
  const dispatch = useDispatch()
  const { username } = useStoredUsername()
  const [showPicker, setShowPicker] = React.useState(false);
  const [currency, setCurrency] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
    }
  });
  const toast = useToast()

  // Function to handle form submission
  const onSubmit = async data => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const cashbookData = {
      which_key: username,
      which_company: whichCompany,
      name: data.name,
      description: data.description,
      currency: currency ? currency?.currency : "",
      currency_symbol: currency ? currency?.symbol : "",
    }

    try {
      const success = await dispatch(createCashbookThunk({data: cashbookData})).unwrap()
      if (success) {
        toast.showToast({ type: 'success', text1: 'Cashbook created successfully!' });
        onFormSubmit && onFormSubmit()
      }
    } catch (error) {
      toast.showToast({ type: 'error', text1: error?.message || 'Cashbook creation failed, please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12 min-h-screen">
      {/* Header */}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText className="text-xl font-bold">Add New Cashbook</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg p-4">

          {/* Name Input */}
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cashbook Name</ThemedText>
          <Controller
            control={control}
            rules={{ required: true, minLength: 3 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-2"
                placeholder="e.g., Main Account"
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="words"
              />
            )}
            name="name"
          />
          {errors.name && (
            <Text className="text-red-500 text-xs mb-4">
              {errors.name.type === 'required' && 'Cashbook name is required.'}
              {errors.name.type === 'minLength' && 'Cashbook name must be at least 3 characters.'}
            </Text>
          )}

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</ThemedText>
          <Controller
            control={control}
            rules={{ required: false, minLength: 10, maxLength: 500 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-2 h-24 text-top"
                placeholder="e.g., This cashbook is used for daily operational expenses."
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline={true}
                textAlignVertical="top"
              />
            )}
            name="description"
          />
          {errors.description && (
            <Text className="text-red-500 text-xs mb-4">
              {errors.description.type === 'minLength' && 'Description must be at least 10 characters.'}
              {errors.description.type === 'maxLength' && 'Description cannot exceed 500 characters.'}
            </Text>
          )}

          <ThemedText>Select base currency</ThemedText>
            <TouchableOpacity
                className="p-3 bg-white text-slate-800 placeholder:text-slate-300 rounded-2xl dark:bg-[#0B0D2A] dark:text-white"
                onPress={() => setShowPicker(true)}
              >
                <ThemedText>
                  {currency?.code || "Select Currency"}
                </ThemedText>
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
              {isSubmitting ? 'Adding Cashbook...' : 'Add Cashbook'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    <ItemPickerModal
            items={currencyList}
            visible={showPicker}
            onClose={() => setShowPicker(false)}
            is_currency={true}
            onSelectItem={(item) => {
            setCurrency(item);
            setShowPicker(false);
            }}
        />
    </View>
  );
}
