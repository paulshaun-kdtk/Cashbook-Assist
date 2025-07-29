import { useStoredUsername } from '@/hooks/useStoredUsername';
import { useToast } from '@/hooks/useToast';
import { createCompanyThunk } from '@/redux/thunks/companies/post';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useDispatch } from 'react-redux';

// Assuming ThemedText component is defined as in previous components
const ThemedText = ({ className = '', children }) => {
  const theme = useColorScheme();
  const textColorClass = theme === 'dark' ? 'text-white' : 'text-black';
  return <Text className={`${className} ${textColorClass}`}>{children}</Text>;
};

export default function AddCompanyForm({onFormSubmit=null}) {
  const theme = useColorScheme(); // 'light' or 'dark'
  const dispatch = useDispatch();
  const toast = useToast()
  const {username} = useStoredUsername()
  const [isSubmitting, setIsSubmitting] = React.useState(false);
   
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
    }
  });

  // Function to handle form submission
  const onSubmit = async data => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const companyData = {
        which_key: username,
        name: data.name,
        description: data.description
    }
    try {
        const success = await dispatch(createCompanyThunk({data: companyData})).unwrap()
        if (success) {
            toast.showToast({ type: 'success', text1: 'Company created successfully!' });
            onFormSubmit && onFormSubmit()
        }
    } catch (error) {
        toast.showToast({ type: 'error', text1: error?.message || 'Company creation failed, please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#0B0D2A] pt-12 min-h-screen">
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText className="text-xl font-bold">Add New Company</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mx-4 rounded-xl overflow-hidden shadow-lg p-4">
          {/* Company Name Input */}
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Company Name</ThemedText>
          <Controller
            control={control}
            rules={{
              required: true,
              minLength: 3,
              maxLength: 50
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#0B0D2A] text-black dark:text-white mb-2"
                placeholder="e.g., Acme Corp."
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
              {errors.name.type === 'required' && 'Company name is required.'}
              {errors.name.type === 'minLength' && 'Company name must be at least 3 characters.'}
              {errors.name.type === 'maxLength' && 'Company name cannot exceed 50 characters.'}
            </Text>
          )}

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Company Description</ThemedText>
          <Controller
            control={control}
            rules={{
              required: false,
              minLength: 10,
              maxLength: 500
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#0B0D2A] text-black dark:text-white mb-2 h-24 text-top" // Increased height for description
                placeholder="e.g., A leading technology company specializing in AI solutions."
                placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline={true}
                textAlignVertical="top" // Ensures text starts from the top for multiline
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

          {/* Add Company Button */}
          <TouchableOpacity
            className={`w-full p-4 rounded-xl items-center justify-center mt-4 ${
              isSubmitting 
                ? 'bg-gray-400 dark:bg-gray-600' 
                : 'bg-cyan-700 dark:bg-cyan-600'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text className="text-white text-lg font-bold">
              {isSubmitting ? 'Adding Company...' : 'Add Company'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
