import { formatCurrency } from '@/assets/formatters/currency';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { useToast } from '@/hooks/useToast';
import { selectCashbookBalances } from '@/redux/slices/cashbooks/selectCashbookTotals';
import { RootState } from '@/redux/store';
import { fetchCashbooksThunk } from '@/redux/thunks/cashbooks/fetch';
import { fetchCompaniesThunk } from '@/redux/thunks/companies/fetch';
import { deleteCompanyThunk } from '@/redux/thunks/companies/post';
import { fetchExpensesThunk } from '@/redux/thunks/expenses/fetch';
import { fetchIncomeThunk } from '@/redux/thunks/income/fetch';
import { Cashbook } from '@/types/cashbook';
import { Company } from '@/types/company';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import AddCompanyForm from '../forms/addCompany';
import { ThemedText } from '../ThemedText';
import Loader from '../ui/loading';

export default function CompanyListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { username } = useStoredUsername();
  const modalizeRef = useRef<Modalize>(null);
  const balances = useSelector(selectCashbookBalances)
  const toast = useToast()
  const { companies, loading: companiesLoading, error: companiesError } = useSelector(
    (state: RootState) => state.companies
  );
  const { cashbooks, loading: cashbooksLoading, error: cashbooksError } = useSelector(
    (state: RootState) => state.cashbooks
  );

  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      dispatch(fetchCompaniesThunk(username));
      dispatch(fetchCashbooksThunk(username));
      dispatch(fetchIncomeThunk(username));
      dispatch(fetchExpensesThunk(username))
    }
  }, [dispatch, username]);

  const toggleCompany = (companyId: string) => {
    setExpandedCompanyId(prev => (prev === companyId ? null : companyId));
  };

  const handleAddCompany = () => {
    modalizeRef.current?.open();
  };

 const  handleCloseModal = () => {
    modalizeRef.current?.close();
    dispatch(fetchCompaniesThunk(username));
  }

  const companyBalance = (cashbooks: Cashbook[]) => {
    return cashbooks.reduce((total, cashbook) => total + balances[cashbook.$id] || 0, 0);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (!username) return
    if (cashbooks.some((cb: Cashbook) => cb.which_company === companyId)) {
      toast.showToast({
        type: 'error',
        text1: 'Deletion Restricted',
        text2: 'This company has cashbooks please delete them first'
      })
      return
    } 
    dispatch(deleteCompanyThunk({documentId: companyId})).then(() => {
      dispatch(fetchCompaniesThunk(username));
    });
  }
  const renderRightActions = (companyId: string) => (
    <TouchableOpacity
      onPress={() => {
      handleDeleteCompany(companyId);  
      }}
      className="bg-red-600 justify-center items-center w-20 h-full"
    >
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {(companiesLoading || cashbooksLoading) && <Loader />}

      {/* Header */}
      <View className="px-4 flex-col items-center justify-center relative mb-6">
        <ThemedText className="text-xl font-bold">Your Companies</ThemedText>
        {companiesError && <Text className="text-red-500 dark:text-red-400 text-center">{companiesError}</Text>}
        {cashbooksError && <Text className="text-red-500 dark:text-red-400 text-center">error fetching cashbooks: {cashbooksError}</Text>}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {companies.map((company: Company, index) => {
            const companyCashbooks = cashbooks.filter((cb: Cashbook) => cb.which_company === company.$id);
            
            return (
              <View key={company.$id}>
                  <Swipeable
                    renderRightActions={() => renderRightActions(company.$id)}
                  >
                    <TouchableOpacity
                      onPress={() => toggleCompany(company.$id)}
                      className={`flex-row items-center py-3 px-4 ${index < companies.length - 1 ? 'border-b border-gray-200 dark:border-[#2C2F5D]' : ''}`}
                    >
                      <View className="flex-1">
                        <ThemedText type='subtitle' className="text-base font-semibold">{company.name}</ThemedText>
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                          {company.description}
                        </Text>
                      </View>
                      
                      <View className="items-end">
                        <ThemedText className="text-sm text-gray-500 dark:text-gray-400">Balance</ThemedText>
                        <Text className={`text-base font-bold ${companyBalance(companyCashbooks) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} mt-1`}>
                          {formatCurrency(companyBalance(companyCashbooks))}
                        </Text>
                      </View>

                    </TouchableOpacity>
                  </Swipeable>

                {expandedCompanyId === company.$id && (
                  <View className="bg-white dark:bg-[#11143b] px-4 pb-4">
                    <View className='flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-[#2C2F5D]'>
                      <Text className='text-xs dark:text-gray-300'>Cashbooks</Text>
                      <Link className='text-cyan-500' href={`/cashbooks/${company.$id}`}>View All</Link>
                    </View>
                    {companyCashbooks.length > 0 ? (
                      companyCashbooks.map((cb: Cashbook) => (
                        <TouchableOpacity
                          key={cb.$id}
                          onPress={() => router.push(`/transactions/${cb.$id}`)}
                          className="py-3 border-b border-gray-200 dark:border-[#2C2F5D]"
                        >
                          <View className="flex-row justify-between">
                            <ThemedText className="text-sm font-medium">{cb.name}</ThemedText>
                            <Text className="text-sm font-bold text-green-700 dark:text-green-400">
                              <Text className={`text-base font-bold ${balances[cb.$id] < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}  mt-1`}>
                                {formatCurrency(balances[cb.$id] || 0)}
                            </Text>
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <ThemedText className="text-sm text-gray-400 pt-2">
                        No cashbooks for this company <Link className='text-green-600 dark:text-green-500' href={`/cashbooks/${company.$id}`}>Add New?</Link>
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Add Company Button */}
        {companies.length < 5 ? (
          <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-cyan-700 dark:bg-cyan-600 items-center justify-center shadow-md"
          onPress={handleAddCompany}
          >
          <Text className="text-white text-lg font-bold">Add Another Company</Text>
        </TouchableOpacity>
        ) : (
          <View className='m-auto w-[75%] mt-5'>
            <Text className='text-center text-slate-800 dark:text-slate-300'>companies limit reached contact<Link className='text-cyan-500' href={"mailto:info@shsoftwares?subject=Requesting enterprise version of cashbook assist"}> support </Link>to get the enterprise version of cashbook assist</Text>
          </View>
        )}
      </ScrollView>

      <Modalize rootStyle={{ backgroundColor: 'transparent' }} modalStyle={{ backgroundColor: 'transparent' }} ref={modalizeRef}><AddCompanyForm onFormSubmit={handleCloseModal} /></Modalize>

    </View>
  );
}
