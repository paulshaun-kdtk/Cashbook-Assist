import { useColorScheme } from '@/hooks/useColorScheme';
import { useToast } from '@/hooks/useToast';
import { confirmUserName } from '@/redux/appwrite/auth/userActions';
import { appwriteCreds } from '@/redux/appwrite/credentials';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '../ThemedText';

export default function SubscriptionSignupScreen() {
  const theme = useColorScheme();
  const { showToast } = useToast();
  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      showToast({ type: 'error', text1: 'Please enter your email' });
      return false;
    }

    if (!email.includes('@')) {
      showToast({ type: 'error', text1: 'Please enter a valid email address' });
      return false;
    }

    if (!name.trim()) {
      showToast({ type: 'error', text1: 'Please enter your full name' });
      return false;
    }

    if (!username.trim()) {
      showToast({ type: 'error', text1: 'Please enter a username' });
      return false;
    }

    if (username.length < 3) {
      showToast({ type: 'error', text1: 'Username must be at least 3 characters' });
      return false;
    }

    if (!password.trim()) {
      showToast({ type: 'error', text1: 'Please enter a password' });
      return false;
    }

    if (password.length < 6) {
      showToast({ type: 'error', text1: 'Password must be at least 6 characters' });
      return false;
    }

    if (!/\d/.test(password)) {
      showToast({ type: 'error', text1: 'Password must contain at least one number' });
      return false;
    }

    if (password !== confirmPassword) {
      showToast({ type: 'error', text1: 'Passwords do not match' });
      return false;
    }

    return true;
  };

  const createAppwriteUser = async () => {
    try {
      // 1️⃣ Create Auth User first
      const authUserResponse = await fetch(
        `${appwriteCreds.apiUrl}/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': appwriteCreds.projectId!,
            'X-Appwrite-Key': appwriteCreds.apiKey!,
          },
          body: JSON.stringify({
            userId: 'unique()',
            email: email.toLowerCase().trim(),
            password: password,
            name: name.trim(),
          }),
        }
      );

      if (!authUserResponse.ok) {
        const error = await authUserResponse.json();
        console.error('Appwrite auth user creation error', error);
        throw new Error(error.message || 'Failed to create auth user');
      }

      const authUser = await authUserResponse.json();

      // 2️⃣ Add user to team immediately
      const teamId = "6788e80e002d1a60eef7"; // Same team ID from your API
      try {
        const teamMembershipResponse = await fetch(
          `${appwriteCreds.apiUrl}/teams/${teamId}/memberships`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': appwriteCreds.projectId!,
              'X-Appwrite-Key': appwriteCreds.apiKey!,
            },
            body: JSON.stringify({
              userId: authUser.$id,
              roles: ['member'],
              email: email.toLowerCase().trim(),
              name: name.trim(),
            }),
          }
        );

        if (!teamMembershipResponse.ok) {
          const teamError = await teamMembershipResponse.json();
          console.warn('Team membership creation failed:', teamError);
          // Don't throw error - continue with user creation even if team membership fails
        } else {
          console.log('User successfully added to team');
        }
      } catch (teamError) {
        console.warn('Team membership error:', teamError);
        // Continue with user creation even if team membership fails
      }

      // 3️⃣ Create Database User
      const userPayload = {
        documentId: 'unique()',
        data: {
          email: email.toLowerCase().trim(),
          full_name: name.trim(),
          identifier: `${email.toLowerCase().trim()}-${authUser.$id}`,
          which_key: username.toLowerCase().trim(),
          expoNotificationId: 'not-set',
          createdAt: new Date().toISOString(),
        },
      };

      const response = await fetch(
        `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.user_collection_id}/documents`,
        {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': appwriteCreds.projectId!,
            'X-Appwrite-Key': appwriteCreds.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userPayload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Appwrite database user creation error', error);
        throw new Error(error.message || 'Failed to create database user');
      }

      const databaseUser = await response.json();
      
      // Return the database user but include auth user ID for reference
      return {
        ...databaseUser,
        authUserId: authUser.$id,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const createSubscriptionDocument = async (userId: string) => {
    try {
      const subscriptionPayload = {
        documentId: 'unique()',
        data: {
          user: email.toLowerCase().trim(),
          has_user_created: true,
          subscription_status: 'pending',
          subscription_type: 'annual', 
          subscription_platform: Platform.OS,
          payment_platform: 'revenue_cat',
          subscription_plan_id: 'free',
          subscription_id: 'free-trial',
          which_key: username.toLowerCase().trim(),
        },
      };

      const response = await fetch(
        `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.subscription_collection_id}/documents`,
        {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': appwriteCreds.projectId!,
            'X-Appwrite-Key': appwriteCreds.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionPayload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create user in Appwrite
      const user = await createAppwriteUser();
      
      // Create free subscription document
      await createSubscriptionDocument(user.$id);

      showToast({ type: 'success', text1: 'Account created successfully!', text2: 'Welcome to your account.' });
      router.replace('/auth/signin');
    } catch (error: any) {
      console.error('Signup error:', error);
      showToast({ type: 'error', text1: error.message || 'Failed to create account' });
    } finally {
      setIsLoading(false);
    }
  };

      async function handleUsernameCheck() {
        if (!username) {
          setUsernameAvailable(null); // reset to neutral state
          return;
        }
        setCheckingUsername(true);
        try {
          const result = await confirmUserName(username);
          setUsernameAvailable(result.success);
        } catch (error) {
          console.error("Error checking username:", error);
          setUsernameAvailable(false);
        } finally {
          setCheckingUsername(false);
        }
      }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-6 pt-16" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="items-center mb-8">
          <ThemedText className="text-3xl font-bold mb-2">Create Account</ThemedText>
          <ThemedText className="text-gray-600 dark:text-gray-400 text-center">
            Sign up to start managing your cashbooks
          </ThemedText>
        </View>

        {/* User Information Form */}
        <View className="mb-8">
          <ThemedText className="text-lg font-semibold mb-4">Account Information</ThemedText>
          
          {/* Email Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2 ml-2">Email Address</ThemedText>
            <TextInput
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your email"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Name Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2 ml-2">Full Name</ThemedText>
            <TextInput
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your full name"
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Username Input */}
        <View className="mb-4">
        <ThemedText className="text-sm font-medium mb-2 ml-2">Username</ThemedText>
        <TextInput
                className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Confirm your username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={username}
            onChangeText={setUsername}
            onBlur={handleUsernameCheck}
            keyboardType="email-address"
            autoCapitalize="none"
            />
          {checkingUsername && (
                <ThemedText>Validating...</ThemedText>
                )}
                {usernameAvailable === false && (
                <Text className="mt-2 text-sm text-red-500 dark:text-red-400">
                    Username is already taken. Please choose another.
                </Text>
                )}
                {usernameAvailable === true && (
                <Text className="mt-2 text-sm text-green-500 dark:text-green-400">
                    username available.
                </Text>
                )}
        </View>

          {/* Password Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2 ml-2">Password</ThemedText>
            <View className="relative">
              <TextInput
                className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Create a password"
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
          </View>

          {/* Confirm Password Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2 ml-2">Confirm Password</ThemedText>
            <View className="relative">
              <TextInput
                className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Confirm your password"
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
            <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
              Must contain a number and at least 6 characters
            </ThemedText>
          </View>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity
          className={`w-full p-4 rounded-xl items-center justify-center shadow-md mb-4 ${
            isLoading
              ? 'bg-gray-400 dark:bg-gray-600'
              : 'bg-cyan-700 dark:bg-cyan-600'
          }`}
          onPress={handleSignUp}
          disabled={isLoading || !usernameAvailable}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-lg font-bold ml-2">Creating Account...</Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-bold">
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <ThemedText className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
          By creating an account, you agree to our 
          <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync('https://cashbook-assist.shsoftwares.com/application/terms-of-use',)}> 
                       <Text className='text-cyan-500 dark:text-cyan-400 font-bold'>
             Terms of Service
            </Text>

          </TouchableOpacity> and <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync('https://cashbook-assist.shsoftwares.com/application/privacy-policy',)}>
            <Text className='text-cyan-500 dark:text-cyan-400 font-bold'>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </ThemedText>

        {/* Sign In Link */}
        <View className="flex-row justify-center mb-8">
          <ThemedText className="text-sm text-gray-700 dark:text-gray-300">
            Already have an account?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.replace('/auth/signin')}>
            <ThemedText className="text-sm text-cyan-500 dark:text-cyan-400 font-bold">
              Sign In
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
