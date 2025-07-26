import { Ionicons } from '@expo/vector-icons'; // For eye icon
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

// Placeholder for ThemedText component - assuming it's defined elsewhere or can be simple
const ThemedText = ({ className = '', children }) => {
  const theme = useColorScheme();
  const textColorClass = theme === 'dark' ? 'text-white' : 'text-black';
  return <Text className={`${className} ${textColorClass}`}>{children}</Text>;
};

export default function SignUpScreen() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter()

  const handleSignUp = () => {
    // Implement sign-up logic here
    console.log('Signing up with:', { emailOrPhone, fullName, username, password, confirmPassword });
    // You would typically call an authentication API here
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
        {/* Header/Logo */}
        <View className="flex-row justify-end items-center mb-10 mr-4">
            <ThemedText className="text-xs text-gray-400 dark:text-gray-500 mt-1">© Cashbook Assist {new Date().getFullYear()} All rights reserved.</ThemedText>
        </View>

        {/* Welcome Section */}
        <View className="mb-8">
          <ThemedText className="text-5xl font-extrabold mb-2">Hi!</ThemedText>
          <ThemedText className="text-5xl font-extrabold mb-4">Welcome</ThemedText>
          <ThemedText className="text-base text-gray-600 dark:text-gray-400">
            Let's create an account
          </ThemedText>
        </View>

        {/* Sign Up Form */}
        <View className="mb-6">
          <TextInput
            className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] text-black dark:text-white mb-4"
            placeholder="Email or Phone Number"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] text-black dark:text-white mb-4"
            placeholder="Full Name"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <TextInput
            className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] text-black dark:text-white mb-4"
            placeholder="Username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <View className="relative w-full mb-2">
            <TextInput
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] text-black dark:text-white pr-12"
              placeholder="Password"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
          <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mb-4 ml-2">
            Must contain a number and least of 6 characters
          </ThemedText>

          <View className="relative w-full mb-2">
            <TextInput
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] text-black dark:text-white pr-12"
              placeholder="Confirm Password"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
          <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mb-6 ml-2">
            Must contain a number and least of 6 characters
          </ThemedText>

          <TouchableOpacity
            className="w-full p-4 rounded-xl bg-cyan-700 dark:bg-cyan-600 items-center justify-center shadow-md"
            onPress={handleSignUp}
          >
            <Text className="text-white text-lg font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Log In Link */}
        <View className="flex-row justify-center mt-8">
          <ThemedText className="text-sm text-gray-700 dark:text-gray-300">Have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.replace('/auth/signin')}>
            <ThemedText className="text-sm text-cyan-500 dark:text-cyan-400 font-bold">Log In</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
