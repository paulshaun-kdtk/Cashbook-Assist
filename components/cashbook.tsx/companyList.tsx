import { useStoredUsername } from '@/hooks/useStoredUsername';
import { RootState } from '@/redux/store';
import { fetchCompaniesThunk } from '@/redux/thunks/companies/fetch';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedText } from '../ThemedText';
import Loader from '../ui/loading';

export default function CompanyListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { username } = useStoredUsername();

  const { companies, loading: companiesLoading, error: companiesError } = useSelector(
    (state: RootState) => state.companies
  );
  const { items: cashbooks, loading: cashbooksLoading } = useSelector(
    (state: RootState) => state.cashbooks
  );

  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      dispatch(fetchCompaniesThunk(username));
      // You may also want to fetch cashbooks globally if not already fetched
    }
  }, [dispatch, username]);

  const toggleCompany = (companyId: string) => {
    setExpandedCompanyId(prev => (prev === companyId ? null : companyId));
  };

  const handleAddCompany = () => {
    console.log('Add new company button pressed!');
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {(companiesLoading || cashbooksLoading) && <Loader />}
      {companiesError && <Text className="text-red-500 dark:text-red-400">{companiesError}</Text>}

      {/* Header */}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText className="text-xl font-bold">Your Companies</ThemedText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {companies.map((company, index) => {
            const companyCashbooks = cashbooks.filter(cb => cb.which_company === company.$id);

            return (
              <View key={company.$id}>
                {/* Company Entry */}
                <TouchableOpacity
                  onPress={() => toggleCompany(company.$id)}
                  className={`flex-row items-center py-3 px-4 ${
                    index < companies.length - 1 ? 'border-b border-gray-200 dark:border-[#2C2F5D]' : ''
                  }`}
                >
                  <View className="flex-1">
                    <ThemedText className="text-base font-semibold">{company.name}</ThemedText>
                    <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                      {company.description}
                    </ThemedText>
                  </View>
                  <View className="items-end">
                    <ThemedText className="text-sm text-gray-500 dark:text-gray-400">Balance</ThemedText>
                    <Text className="text-base font-bold text-green-600 dark:text-green-400 mt-1">$ 0</Text>
                  </View>
                </TouchableOpacity>

                {/* Cashbook Sublist */}
                {expandedCompanyId === company.$id && (
                  <View className="bg-white dark:bg-[#11143b] px-4 pb-4">
                    {companyCashbooks.length > 0 ? (
                      companyCashbooks.map(cb => (
                        <TouchableOpacity
                          key={cb.id}
                          onPress={() => router.push(`/cashbooks/${cb.id}`)}
                          className="py-2 border-b border-gray-200 dark:border-[#2C2F5D]"
                        >
                          <View className="flex-row justify-between">
                            <ThemedText className="text-sm font-medium">{cb.name}</ThemedText>
                            <Text className="text-sm font-bold text-green-700 dark:text-green-400">
                              ${cb.balance ?? 0}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <ThemedText className="text-sm text-gray-400 italic pt-2">
                        No cashbooks for this company.
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            );
          })}
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
