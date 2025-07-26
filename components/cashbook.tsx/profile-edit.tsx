import { logoutThunk } from '@/redux/thunks/auth/authThunk';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, Text, TextInput, TouchableOpacity, UIManager, useColorScheme, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { ThemedText } from '../ThemedText';


// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function EditProfilePage() {
  const theme = useColorScheme(); // 'light' or 'dark'

  const [fullName, setFullName] = useState('Lorna Alvarado'); // Changed to match new image
  const [phoneNumber, setPhoneNumber] = useState('0123 4567 8901 2345'); // Changed to match new image
  const [email, setEmail] = useState('hello@reallygreatsite.com'); // Kept for consistency, though not in new image
  const [username, setUsername] = useState('lorna.alvarado'); // Dummy username

  const [showSensitiveActions, setShowSensitiveActions] = useState(false);
    
  const handleSaveChanges = () => {
    console.log('Saving changes:', { fullName, email, phoneNumber, username });
    // Implement logic to save updated profile data (e.g., API call)
  };
  const dispatch = useDispatch()
    const router = useRouter()

  const handleLogout = async () => {
    const response = await dispatch(logoutThunk()).unwrap()
    if (response) {
        router.replace('/(auth)/auth/signin')
    }
};

  const handleDeleteAllData = () => {
    console.log('Deleting all data...');
    // Implement logic to delete all user-related data (requires confirmation)
  };

  const handleDeleteAccount = () => {
    console.log('Deleting account and all related data...');
    // Implement logic to delete user account (requires strong confirmation)
  };

  const toggleSensitiveActions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSensitiveActions(!showSensitiveActions);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Top Navigation Tabs */}
      <View className="px-4 flex-row justify-center mb-6">
        <View className="flex-row bg-gray-100 dark:bg-[#1A1E4A] rounded-full p-1">
          <TouchableOpacity className="flex-1 items-center py-2 rounded-full">
            <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400">Home</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center py-2 rounded-full">
            <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400">Search</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center py-2 rounded-full bg-white dark:bg-[#0B0D2A] shadow-sm">
            <ThemedText className="text-sm font-semibold text-black dark:text-white">Profile</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Picture and Name Section */}
        <View className="items-center mb-8">
          <ThemedText className="text-3xl font-bold mt-4">{fullName}</ThemedText>
          <ThemedText className="text-base text-gray-500 dark:text-gray-400">{phoneNumber}</ThemedText>
        </View>

        {/* Profile Options List (now with editable inputs) */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg p-4">
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Full Name</ThemedText>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-4"
            placeholder="Enter your full name"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Email Address</ThemedText>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-4"
            placeholder="Enter your email"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Phone Number</ThemedText>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-4"
            placeholder="Enter your phone number"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Username</ThemedText>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B0D2A] text-black dark:text-white mb-4"
            placeholder="Enter your username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          {/* Save Changes Button - moved inside this section for logical grouping */}
          <TouchableOpacity
            className="w-full p-4 rounded-xl bg-green-500 dark:bg-green-600 items-center justify-center shadow-md mt-4"
            onPress={handleSaveChanges}
          >
            <Text className="text-white text-lg font-bold">Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* More Section Toggle */}
        <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-gray-100 dark:bg-[#1A1E4A] items-center justify-center shadow-md"
          onPress={toggleSensitiveActions}
        >
          <ThemedText className="text-base font-bold">
            {showSensitiveActions ? 'Hide Sensitive Actions' : 'More'}
          </ThemedText>
        </TouchableOpacity>

        {/* Sensitive Actions Section (conditionally rendered) */}
        {showSensitiveActions && (
          <View className="mx-4 mt-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg p-4">
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sensitive Actions</ThemedText>

            <TouchableOpacity
              className="w-full p-3 rounded-lg bg-red-500 dark:bg-red-600 items-center justify-center mb-3"
              onPress={handleLogout}
            >
              <Text className="text-white text-base font-bold">Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full p-3 rounded-lg bg-red-500 dark:bg-red-600 items-center justify-center mb-3"
              onPress={handleDeleteAllData}
            >
              <Text className="text-white text-base font-bold">Delete All Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full p-3 rounded-lg bg-red-700 dark:bg-red-800 items-center justify-center"
              onPress={handleDeleteAccount}
            >
              <Text className="text-white text-base font-bold">Delete Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
