import store from '@/redux/store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast from "react-native-toast-message";
import { Provider, useDispatch } from "react-redux";
import "../global.css";

import { useColorScheme } from '@/hooks/useColorScheme';
import { initAuth } from '@/redux/thunks/auth/authThunk';
import { useEffect } from 'react';

function AppLayout() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initAuth());
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
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
