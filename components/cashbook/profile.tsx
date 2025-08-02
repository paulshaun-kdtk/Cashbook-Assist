import { RootState } from '@/redux/store';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { ScrollView, Share, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSelector } from 'react-redux';
import { ThemedText } from '../ThemedText';

export default function ProfileScreen() {
    const router = useRouter()
  const theme = useColorScheme(); // 'light' or 'dark'
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View className="px-4 flex-row items-center justify-center relative mb-4">
          <ThemedText className="text-xl font-bold">Profile</ThemedText>
        </View>

        {/* Profile Info */}
        <View className="items-center mb-8">
            <ThemedText className="text-lg font-bold mt-4">{user?.name}</ThemedText>
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</ThemedText>
        </View>

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

          {/* Language */}
          <TouchableOpacity
            onPress={() => WebBrowser.openBrowserAsync('https://apps.apple.com/account/subscriptions')}
            className="flex-row items-center justify-between py-3 px-4 bg-gray-100 dark:bg-[#1A1E4A] border-b border-gray-200 dark:border-[#2C2F5D]">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="web" size={24} color={theme === 'dark' ? 'white' : '#6B7280'} className="mr-3" />
              <ThemedText className="text-base">Subscription</ThemedText>
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
    </View>
  );
}
