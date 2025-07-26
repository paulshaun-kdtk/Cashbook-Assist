import { useAuthUser } from '@/hooks/useAuth';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';

export default function TabLayout() {
  const {user} = useAuthUser();

  if (!user) {
    Toast.show({
      type: "error",
      text1: "Auth required",
      text2: "You need to authenticate to access this page"
    })
    return <Redirect href={'/auth/signin'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
    </Stack>
  );
}
