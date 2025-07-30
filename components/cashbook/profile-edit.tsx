import { useStoredUsername } from '@/hooks/useStoredUsername';
import { logoutThunk } from '@/redux/thunks/auth/authThunk';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, Text, TextInput, TouchableOpacity, UIManager, useColorScheme, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedText } from '../ThemedText';


// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function EditProfilePage() {
  const theme = useColorScheme(); // 'light' or 'dark'
  
  const {user} = useSelector((state: RootState) => state.auth);
  const [showSensitiveActions, setShowSensitiveActions] = useState(false);
  const {username} = useStoredUsername()
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');

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

  const handleDeleteAccount = async () => {
    await WebBrowser.openBrowserAsync('https://cashbook-assist.shsoftwares.com/profile');
  };

  const toggleSensitiveActions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSensitiveActions(!showSensitiveActions);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Picture and Name Section */}
        <View className="items-center mb-8">
          <ThemedText type='title'>{fullName}</ThemedText>
          <Text className="text-base text-gray-500 dark:text-gray-400">{email}</Text>
          <Text className="text-base text-gray-500 dark:text-gray-400">{phoneNumber}</Text>
        </View>

        {/* Profile Options List (now with editable inputs) */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg p-4">
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Full Name</ThemedText>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-[#343A4F] text-black dark:text-white mb-4"
            placeholder="Enter your full name"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={fullName}
            onChangeText={setFullName}
            editable={false}
            autoCapitalize="words"
          />

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Email Address</ThemedText>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-[#343A4F] text-black dark:text-white mb-4"
            placeholder="Enter your email"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={email}
            onChangeText={setEmail}
            editable={false}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Phone Number</ThemedText>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-[#343A4F] text-black dark:text-white mb-4"
            placeholder="Enter your phone number"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">Username</ThemedText>
          <TextInput
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-[#343A4F] text-black dark:text-white mb-4"
            placeholder="Enter your username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={username}
            editable={false}
            autoCapitalize="none"
          />

          {/* Save Changes Button - moved inside this section for logical grouping */}
          <Link
            href="mailto:support@shoftwwares.com?subject=profile change request"
            className="w-full p-4 rounded-xl bg-cyan-600 dark:bg-cyan-500 text-center items-center justify-center shadow-md mt-4"
            onPress={handleSaveChanges}
          >
            <Text className="text-white text-lg font-bold">Request Profile Changes</Text>
          </Link>
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
              className="w-full p-3 rounded-lg bg-red-500 dark:bg-red-600 flex-row items-center justify-center mb-3"
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color="white" className="mr-2" />
              <Text className="text-white text-base font-bold">Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full p-3 rounded-lg bg-red-700 dark:bg-red-800 flex-row items-center justify-center"
              onPress={handleDeleteAccount}
            >
              <MaterialIcons name="folder-delete" size={24} color="white" className="mr-2" />
              <Text className="text-white text-base font-bold">Permanently Delete Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
