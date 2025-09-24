import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { useToast } from '@/hooks/useToast';
import { RootState } from '@/redux/store';
import { fetchCashbooksThunk } from '@/redux/thunks/cashbooks/fetch';
import { fetchCategoriesThunk } from '@/redux/thunks/categories/fetch';
import { fetchCompaniesThunk } from '@/redux/thunks/companies/fetch';
import { fetchExpensesThunk } from '@/redux/thunks/expenses/fetch';
import { fetchIncomeThunk } from '@/redux/thunks/income/fetch';
import { fullSyncHybridWithSession } from '@/utils/debugSubscriptionFixed';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Share, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedText } from '../ThemedText';
import { PaywallModal } from '../ui/paywallModal';
import { SubscriptionStatusCard } from '../ui/subscriptionStatusCard';
import { SwipeActionTutorial } from '../ui/SwipeActionTutorial';

export default function ProfileScreen() {
    const router = useRouter()
  const theme = useColorScheme(); // 'light' or 'dark'
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = React.useState(false);
  const {username} = useStoredUsername()
    // Offline sync hook to check connectivity status
  const { isOnline } = useOfflineSync();
  
  const handleManualSync = async () => {
    if (!(user as any)?.email) {
      showToast({ type: 'error', text1: 'No user email found' });
      return;
    }

    setIsSyncing(true);
    try {
      // Use session-based hybrid sync for authenticated users to avoid API key conflicts
      const result = await fullSyncHybridWithSession((user as any).email, false);
      
      showToast({ 
        type: 'success', 
        text1: 'Subscription Synced!', 
        text2: result.message || 'Sync completed successfully'
      });
      
      console.log('Session-based sync result:', result);
    } catch (error) {
      console.error('Manual sync failed:', error);
      showToast({ 
        type: 'error', 
        text1: 'Sync Failed', 
        text2: 'Please try again later' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

    React.useEffect(() => {
      if (username) {
        dispatch(fetchCompaniesThunk(username));
        dispatch(fetchCashbooksThunk(username));
        dispatch(fetchIncomeThunk(username));
        dispatch(fetchExpensesThunk(username));
        dispatch(fetchCategoriesThunk(username));
      }
    }, [dispatch, username]);
  
  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View className="px-4 flex-row items-center justify-center relative mb-4">
          <ThemedText className="text-xl font-bold">Profile</ThemedText>
        </View>

        {/* Profile Info */}
        <View className="items-center mb-8">
            <ThemedText className="text-lg font-bold mt-4">{(user as any)?.name}</ThemedText>
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400">{(user as any)?.email}</ThemedText>
        </View>

        {/* Subscription Status Card - Only show when online */}
        {isOnline && (
          <SubscriptionStatusCard 
            onUpgradePress={() => setShowPaywallModal(true)}
          />
        )}


        {/* Settings Options */}
        <View className="mx-4 rounded-xl overflow-hidden">
          {/* Edit Profile */}
          <TouchableOpacity 
          onPress={() => router.push('/profile/edit')}
          className="flex-row items-center justify-between py-3 px-4 bg-gray-100 mb-8 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="pencil-outline" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Edit Profile</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
          </TouchableOpacity>

          {/* General Settings Header */}
          <View className="py-3 px-4 bg-gray-50 dark:bg-[#121438]">
            <ThemedText className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">General Settings</ThemedText>
          </View>

          {/* Subscription */}
          <TouchableOpacity
            onPress={() => WebBrowser.openBrowserAsync('https://apps.apple.com/account/subscriptions')}
            className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="web" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Subscription</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
          </TouchableOpacity>

          {/* Manual Sync Button */}
          <TouchableOpacity
            onPress={handleManualSync}
            disabled={isSyncing}
            className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="sync" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Sync Subscription</ThemedText>
            </View>
            {isSyncing ? (
              <ActivityIndicator size="small" color={theme === 'dark' ? 'white' : '#6B7280'} />
            ) : (
              <Ionicons name="refresh" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
            )}
          </TouchableOpacity>

          {/* Show Swipe Tutorial */}
          <TouchableOpacity
            onPress={() => setShowSwipeTutorial(true)}
            className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]">
            <View className="flex-row items-center">
              <Ionicons name="help-outline" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Show Swipe Tutorial</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]"
          onPress={() => WebBrowser.openBrowserAsync('https://cashbook-assist.shsoftwares.com/#features')}
          >
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">About</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
          </TouchableOpacity>

          {/* Terms & Conditions */}
          <TouchableOpacity 
          onPress={() => WebBrowser.openBrowserAsync('https://cashbook-assist.shsoftwares.com/application/terms-of-use')}
          className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Terms & Conditions</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity 
          onPress={() => WebBrowser.openBrowserAsync('https://cashbook-assist.shsoftwares.com/application/privacy-policy')}
          className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]">
            <View className="flex-row items-center">
              <Ionicons name="lock-closed-outline" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Privacy Policy</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
          </TouchableOpacity>

          {/* Rate This App */}
          <TouchableOpacity 
          onPress={() => WebBrowser.openBrowserAsync('https://apps.apple.com/app/id6749472637')}
          className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]">
            <View className="flex-row items-center">
              <FontAwesome name="star-o" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Rate This App</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
          </TouchableOpacity>

          {/* Share This App */}
          <TouchableOpacity 
          onPress={() => {
            Share.share({
              message: 'Check out Cashbook Assist - the best app for managing your finances! Download it now: https://apps.apple.com/app/id6749472637',
              url: 'https://apps.apple.com/app/id6749472637',
            });
          }}
          className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A]">
            <View className="flex-row items-center">
              <Ionicons name="share-social-outline" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Share This App</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? 'white' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Swipe Action Tutorial */}
      <SwipeActionTutorial
        visible={showSwipeTutorial}
        onClose={() => setShowSwipeTutorial(false)}
        targetComponent="transactions"
      />

            {/* Paywall Modal */}
            <PaywallModal
              visible={showPaywallModal}
              onClose={() => setShowPaywallModal(false)}
              onPurchaseSuccess={() => {
                setShowPaywallModal(false);
                // Refresh data after subscription purchase
                if (username) {
                  dispatch(fetchCompaniesThunk(username));
                  dispatch(fetchCashbooksThunk(username));
                  dispatch(fetchIncomeThunk(username));
                  dispatch(fetchExpensesThunk(username));
                  dispatch(fetchCategoriesThunk(username));
                }
              }}
            />
      
    </View>
  );
}
