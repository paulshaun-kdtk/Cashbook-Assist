import CustomTabBar from '@/components/ui/tabBar';
import { useAuthUser } from '@/hooks/useAuth';
import { Redirect, Tabs } from 'expo-router';
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
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
