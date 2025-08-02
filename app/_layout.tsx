import SplashScreenComponent from '@/components/SplashScreen';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { useColorScheme } from '@/hooks/useColorScheme';
import store from '@/redux/store';
import { initAuth } from '@/redux/thunks/auth/authThunk';
import UpdatesChecker from '@/scripts/updatesChecker';
import { OfflineInitializer } from '@/services/OfflineInitializer';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import 'react-native-reanimated';
import Toast from "react-native-toast-message";
import { Provider, useDispatch } from "react-redux";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const [appReady, setAppReady] = useState(false);


useEffect(() => {
    const prepare = async () => {
      try {
        // Initialize offline support first
        await OfflineInitializer.initialize();
        
        // Then initialize auth
        dispatch(initAuth() as any);
        
        // Note: Subscription validation is initialized by the hook when needed
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync(); 
      }
    };

    prepare();
  }, [dispatch]);

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === 'ios' && process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY) {
       Purchases.configure({apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY});
    } else if (Platform.OS === 'android' && process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY) {
       Purchases.configure({apiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY});
    }
  }, []);

  if (!appReady) {
    return <SplashScreenComponent />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={styles.container}>
        <View style={{ flex: 1 }}>
          <OfflineIndicator />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(companies)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </GestureHandlerRootView>
      <StatusBar style="auto" />
      <UpdatesChecker />
      <Toast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <AppLayout />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});