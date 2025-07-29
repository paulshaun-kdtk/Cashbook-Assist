import { ThemedText } from '@/components/ThemedText';
import { useToast } from '@/hooks/useToast';
import { RootState } from '@/redux/store';
import { webToMobileAuthThunk } from '@/redux/thunks/auth/authThunk';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function AuthCallback() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const params = useLocalSearchParams();

  useEffect(() => {
    const processWebAuth = async () => {
      try {
        // Get token or JWT from URL parameters
        const token = params.token as string;
        const jwt = params.jwt as string;
        const error = params.error as string;
        
        console.log('Auth callback params:', { token, jwt, error });
        
        if (error) {
          showToast({ type: 'error', text1: 'Authentication failed: ' + error });
          router.replace('/(auth)/auth/signin');
          return;
        }
        
        if (token || jwt) {
          // Process the web-to-mobile authentication
          const response = await (dispatch as any)(webToMobileAuthThunk({ token, jwt })).unwrap();
          
          if (response) {
            showToast({ type: 'success', text1: 'Google login successful!' });
            router.replace('/(tabs)');
          }
        } else {
          // No token received, redirect back to signin
          showToast({ type: 'error', text1: 'No authentication token received' });
          router.replace('/(auth)/auth/signin');
        }
      } catch (error: any) {
        console.error('Auth callback processing error:', error);
        showToast({ type: 'error', text1: error?.message || 'Authentication failed' });
        router.replace('/(auth)/auth/signin');
      }
    };

    // Process the authentication
    processWebAuth();
  }, [dispatch, router, showToast, params]);

  // If we already have a user, redirect immediately
  useEffect(() => {
    if (user && !loading) {
      router.replace('/(tabs)');
    }
  }, [user, loading, router]);

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-[#0B0D2A]">
      <ActivityIndicator size="large" color="#ABF372" />
      <ThemedText className="mt-4 text-lg">Processing authentication...</ThemedText>
      <ThemedText className="mt-2 text-sm text-gray-500">Completing sign in from web...</ThemedText>
    </View>
  );
}
