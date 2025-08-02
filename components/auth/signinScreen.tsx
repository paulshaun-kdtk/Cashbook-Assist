import { useToast } from '@/hooks/useToast';
import { confirmUserNameBelongsToUser } from '@/redux/appwrite/auth/userActions';
import { RootState } from '@/redux/store';
import { googleLoginThunk, loginThunk } from '@/redux/thunks/auth/authThunk';
import { Ionicons } from '@expo/vector-icons'; // For eye icon, Google, and Apple icons
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedText } from '../ThemedText';

export default function SigninScreen() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loading, user, error } = useSelector((state: RootState) => state.auth)

  const router = useRouter();
  const dispatch = useDispatch()
  const { showToast } = useToast();

  // Preload browser for faster OAuth
  useEffect(() => {
    const preloadBrowser = async () => {
      try {
        await WebBrowser.warmUpAsync();
      } catch (error) {
        console.log('Browser warm-up failed:', error);
      }
    };
    
    preloadBrowser();
    
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    if (user) {
      showToast({type: 'info', text1: `welcome back ${user?.email}`})
      router.push('/(tabs)')
    }
  }, [router, user, showToast])

  // Reset Google loading state on component unmount or if stuck
  useEffect(() => {
    return () => {
      setGoogleLoading(false);
    };
  }, []);

  // Auto-reset Google loading if it's been stuck for too long
  useEffect(() => {
    if (googleLoading) {
      const resetTimer = setTimeout(() => {
        setGoogleLoading(false);
      }, 5000); // Reset after 5 seconds max

      return () => clearTimeout(resetTimer);
    }
  }, [googleLoading]);

  
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !usernameAvailable) {
      showToast({ type: 'error', text1: 'Please set a valid username' });
      return;
    }

    try {
      const response = await dispatch(loginThunk({ email, password, username })).unwrap();
      if (response) {
        showToast({ type: 'success', text1: 'Login successful!' });
        router.replace('/(tabs)');
        return;
      }
      showToast({ type: 'error', text1: response?.message || 'Login failed, please try again.' });
    } catch (error) {
      console.error('Login error:', error);
      showToast({ type: 'error', text1: error?.message || 'Login failed, please try again.' });
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return; // Prevent double clicks
    
    setGoogleLoading(true);
    try {
      showToast({ type: 'info', text1: 'Opening Google sign in...' });
      
      console.log('Starting Google OAuth with web redirect...');
      
      const result = await (dispatch as any)(googleLoginThunk()).unwrap();
      
      console.log('Google login result:', result);
      
      if (result?.initiated) {
        if (result.authenticated) {
          // User completed authentication in browser
          showToast({ type: 'success', text1: 'Google login successful!' });
          router.replace('/(tabs)');
        } else {
          showToast({ type: 'info', text1: 'Complete sign in on shsoftwares.com' });
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      showToast({ type: 'error', text1: error?.message || 'Failed to open Google sign in' });
    } finally {
      // Reset loading state quickly since OAuth opens external browser
      setTimeout(() => setGoogleLoading(false), 1000);
    }
  };

  // Test function to check if WebBrowser works
  const testBrowser = async () => {
    try {
      console.log('Testing browser...');
      const result = await WebBrowser.openBrowserAsync('https://google.com');
      console.log('Browser test result:', result);
      showToast({ type: 'info', text1: 'Browser test completed' });
    } catch (error) {
      console.error('Browser test failed:', error);
      showToast({ type: 'error', text1: 'Browser test failed' });
    }
  };

  const handleAppleLogin = () => {
    console.log('Continue with Apple');
    // Implement Apple login logic
  };

    async function handleUsernameCheck() {
      if (!username) {
        setUsernameAvailable(null); // reset to neutral state
        return;
      }
      setCheckingUsername(true);
      try {
        const result = await confirmUserNameBelongsToUser(email, username);
        setUsernameAvailable(result.success);
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    }

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
        <View className="flex-row justify-end items-center mb-10 mr-4">
          <ThemedText className="text-xs text-gray-400 dark:text-gray-500 mt-1">© Cashbook Assist {new Date().getFullYear()} All rights reserved.</ThemedText>
        </View>
        {error && (<Text className="text-red-500 text-center mb-4">{error}</Text>)}
        {loading && <ActivityIndicator size={'small'}  color={'#ABF372'}/>}

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
            placeholder="Email Address"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View className='w-full mb-4'>
          <TextInput
            className="p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] text-black dark:text-white"
            placeholder="Confirm your username"
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={username}
            readOnly={!email}
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
                      This user_name does not match with the one you signed up with. Click <Link className="text-emerald-500 underline text-base" href={"mailto:support@shsoftwares.com?subject=Username recovery"} >here</Link> if you have forgotten it and need help recovering it... or contact support using our call centers.
                    </Text>
                  )}
                  {usernameAvailable === true && (
                    <Text className="mt-2 text-sm text-green-500 dark:text-green-400">
                      username confirmed.
                    </Text>
                  )}
            </View>
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
            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync('https://cashbook-assist.shsoftwares.com/signin')}>
              <ThemedText className="text-sm text-cyan-500 dark:text-cyan-400 font-semibold">Forgot Password?</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            disabled={!usernameAvailable}
            className="w-full p-4 rounded-xl bg-cyan-700 dark:bg-cyan-600 items-center justify-center shadow-md"
            onPress={handleLogin}
          >
            <Text className="text-white text-lg font-bold">Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Continue With Separator */}
        {/* <View className="flex-row items-center justify-center my-6">
          <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mx-4">Or continue with</ThemedText>
          <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        </View> */}

        {/* DEBUG: Test Browser Button */}
        {/* <TouchableOpacity
          className="w-full p-2 mb-4 rounded-xl bg-red-500 items-center justify-center"
          onPress={testBrowser}
        >
          <ThemedText className="text-white text-sm">🔍 Test Browser (Debug)</ThemedText>
        </TouchableOpacity> */}

        {/* Social Login Buttons */}
        {/* <View className="flex-row justify-center gap-4 mb-8">
          <TouchableOpacity
            className={`flex-row items-center justify-center flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm ${
              googleLoading 
                ? 'bg-cyan-100 dark:bg-cyan-900' 
                : 'bg-gray-50 dark:bg-[#1A1E4A]'
            }`}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={theme === 'dark' ? 'white' : 'black'} />
            ) : (
              <AntDesign name="google" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            )}
            <ThemedText className="ml-2 text-base font-semibold">
              {googleLoading ? 'Starting...' : 'Google'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E4A] shadow-sm"
            onPress={handleAppleLogin}
          >
            <AntDesign name="apple1" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            <ThemedText className="ml-2 text-base font-semibold">Apple</ThemedText>
          </TouchableOpacity>
        </View> */}

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
