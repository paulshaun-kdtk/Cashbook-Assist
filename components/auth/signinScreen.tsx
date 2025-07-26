import { AntDesign, Ionicons } from '@expo/vector-icons'; // For eye icon, Google, and Apple icons
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

// Placeholder for ThemedText component - assuming it's defined elsewhere or can be simple
const ThemedText = ({ className = '', children }) => {
  const theme = useColorScheme();
  const textColorClass = theme === 'dark' ? 'text-white' : 'text-black';
  return <Text className={`${className} ${textColorClass}`}>{children}</Text>;
};

export default function LandingPage() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()

  const handleLogin = () => {
    // Implement login logic here
    console.log('Logging in with:', { username, password });
    // You would typically call an authentication API here
  };

  const handleGoogleLogin = () => {
    console.log('Continue with Google');
    // Implement Google login logic
  };

  const handleAppleLogin = () => {
    console.log('Continue with Apple');
    // Implement Apple login logic
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
        <View className="flex-row justify-end items-center mb-10 mr-4">
          <ThemedText className="text-xs text-gray-400 dark:text-gray-500 mt-1">© Cashbook Assist {new Date().getFullYear()} All rights reserved.</ThemedText>
        </View>

        {/* Welcome Section */}
        <View className="mb-8">
          <ThemedText className="text-5xl font-extrabold mb-2">Hi!</ThemedText>
          <ThemedText className="text-5xl font-extrabold mb-4">Welcome</ThemedText>
          <ThemedText className="text-base text-gray-600 dark:text-gray-400">
           Confirm your identity to continue
          </ThemedText>
        </View>

        {/* Login Form */}
        <View className="mb-6">
          <TextInput
            className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] text-black dark:text-white mb-4"
            placeholder="Username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] text-black dark:text-white mb-4"
            placeholder="Email or Phone Number"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View className="relative w-full mb-4">
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

          <View className="flex-row justify-end items-center mb-6">
            <TouchableOpacity>
              <ThemedText className="text-sm text-cyan-500 dark:text-cyan-400 font-semibold">Forgot Password?</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="w-full p-4 rounded-xl bg-cyan-700 dark:bg-cyan-600 items-center justify-center shadow-md"
            onPress={handleLogin}
          >
            <Text className="text-white text-lg font-bold">Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Continue With Separator */}
        <View className="flex-row items-center justify-center my-6">
          <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mx-4">Or continue with</ThemedText>
          <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        </View>

        {/* Social Login Buttons */}
        <View className="flex-row justify-center gap-4 mb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] shadow-sm"
            onPress={handleGoogleLogin}
          >
            <AntDesign name="google" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            <ThemedText className="ml-2 text-base font-semibold">Google</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] shadow-sm"
            onPress={handleAppleLogin}
          >
            <AntDesign name="apple1" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            <ThemedText className="ml-2 text-base font-semibold">Apple</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-8">
          <ThemedText className="text-sm text-gray-700 dark:text-gray-300">Don't have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <ThemedText className="text-sm text-cyan-500 dark:text-cyan-400 font-bold">Sign Up</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
