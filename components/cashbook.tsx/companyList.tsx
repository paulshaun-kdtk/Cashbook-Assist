import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';

export default function CompanyListPage() {
    const router = useRouter()

  // Dummy data for multiple companies
  const companies = [
    {
      id: '1',
      name: 'Tech Innovators Inc.',
      tagline: 'Leading the future of AI.',
      balance: '$1,250,000.00',
    },
    {
      id: '2',
      name: 'Global Solutions Ltd.',
      tagline: 'Your partner in business growth.',
      balance: '$750,000.00',
    },
    {
      id: '3',
      name: 'Creative Studio Co.',
      tagline: 'Designing dreams into reality.',
      balance: '$320,500.00',
    },
    {
      id: '4',
      name: 'Green Earth Organics',
      tagline: 'Sustainable products for a better planet.',
      balance: '$98,750.00',
    },
  ];

  const handleAddCompany = () => {
    console.log("Add new company button pressed!");
    // Logic to navigate to an 'add company' screen or open a modal
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Header */}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText className="text-xl font-bold">Companies</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Company List */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {companies.map((company, index) => (
            <TouchableOpacity
              key={company.id}
              onPress={() => router.push(`/cashbooks/${company.id}`)}
              className={`flex-row items-center py-3 px-4 ${
                index < companies.length - 1 ? 'border-b border-gray-200 dark:border-[#2C2F5D]' : ''
              }`}
            >
            <View className="flex-1">
                <ThemedText className="text-base font-semibold">{company.name}</ThemedText>
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">{company.tagline}</ThemedText>
              </View>
              <View className="items-end">
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">Balance</ThemedText>
                <Text className="text-base font-bold text-green-600 dark:text-green-400 mt-1">
                  {company.balance}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Company Button */}
        <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-cyan-700 dark:bg-cyan-600 items-center justify-center shadow-md"
          onPress={handleAddCompany}
        >
          <Text className="text-white text-lg font-bold">Add Another Company</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
