import SplashScreenComponent from '@/components/SplashScreen';
import { useColorScheme } from '@/hooks/useColorScheme';
import store from '@/redux/store';
import { initAuth } from '@/redux/thunks/auth/authThunk';
import UpdatesChecker from '@/scripts/updatesChecker';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
        dispatch(initAuth());
        await new Promise(resolve => setTimeout(resolve, 2000));
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync(); 
      }
    };

    prepare();
  }, [dispatch]);

  if (!appReady) {
    return <SplashScreenComponent />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={styles.container}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(companies)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
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