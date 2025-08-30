import { formatCurrency } from '@/assets/formatters/currency';
import { formatDateShortWords } from '@/assets/formatters/dates';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { useToast } from '@/hooks/useToast';
import { selectCashbookBalances } from '@/redux/slices/cashbooks/selectCashbookTotals';
import { RootState } from '@/redux/store';
import { fetchCashbooksThunk } from '@/redux/thunks/cashbooks/fetch';
import { deleteCashbookThunk } from '@/redux/thunks/cashbooks/post';
import { fetchCompaniesThunk } from '@/redux/thunks/companies/fetch';
import { fetchExpensesThunk } from '@/redux/thunks/expenses/fetch';
import { fetchIncomeThunk } from '@/redux/thunks/income/fetch';
import { Cashbook } from '@/types/cashbook';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import AddCashbookForm from '../forms/addCashbook';
import { ThemedText } from '../ThemedText';
import BackButton from '../ui/BackButton';
import CashbookExportModal from '../ui/CashbookExportModal';
import CashbookFilter from '../ui/CashbookFilter';
import Loader from '../ui/loading';

export default function CashbooksListScreen() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const router = useRouter()
  const toast = useToast()
  const dispatch = useDispatch()
  const {username} = useStoredUsername()
  const { cashbooks, loading:CashbooksLoading, error } = useSelector((state: RootState) => state.cashbooks);
  const { companies, loading:CompaniesLoading } = useSelector((state: RootState) => state.companies);
  const [whichCompany, setWhichCompany] = React.useState(null);
  const balances = useSelector(selectCashbookBalances)

  // Filter and search states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'name' as 'name' | 'date' | 'balance',
    sortOrder: 'asc' as 'asc' | 'desc',
    balanceFilter: 'all' as 'all' | 'positive' | 'negative' | 'zero',
    dateRange: { start: null, end: null }
  });

  const modalizeRef = React.useRef<Modalize>(null);

  const companyId= useLocalSearchParams()?.id

    React.useEffect(() => {
      if (username) {
        dispatch(fetchCashbooksThunk(username));
        dispatch(fetchCompaniesThunk(username));
        dispatch(fetchIncomeThunk(username));
        dispatch(fetchExpensesThunk(username));
    }

    if (!whichCompany && companies.length) {
      const company = companies.find((company: any) => company.$id === companyId);
      if (company) {
        setWhichCompany(company);
      }
    }
  }, [dispatch, whichCompany, companies, username, companyId]);

  const handleCashbookDeletion = (cashBookId: string, cashbookName: string) => {
    if (!username) return
    if (balances[cashBookId]) {
      toast.showToast({
        type: 'error',
        text1: 'Deletion Restricted',
        text2: 'This cashbook has transactions please delete them first'
      })
      return
    }
    
    Alert.alert(
      "Delete Cashbook",
      `Are you sure you want to delete this cashbook?\n\n"${cashbookName}"`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch(deleteCashbookThunk({documentId: cashBookId}))
              .then(() => {
                toast.showToast({
                  type: 'success',
                  text1: 'Cashbook Deleted',
                  text2: 'Cashbook has been successfully deleted'
                });
                dispatch(fetchCashbooksThunk(username));
              })
              .catch((error: any) => {
                toast.showToast({
                  type: 'error',
                  text1: 'Delete Failed',
                  text2: 'Failed to delete cashbook'
                });
              });
          }
        }
      ]
    );
  }
    const renderRightActions = (cashBookId: string, cashbookName: string) => (
    <TouchableOpacity
      onPress={() => {
        handleCashbookDeletion(cashBookId, cashbookName);  
      }}
      className="bg-red-600 justify-center items-center w-20 h-full"
    >
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const handleAddCashbook = () => {
    modalizeRef.current?.open();
  };

   const  handleCloseModal = () => {
      modalizeRef.current?.close();
      if (username) {
        dispatch(fetchCashbooksThunk(username));
        dispatch(fetchIncomeThunk(username))
        dispatch(fetchExpensesThunk(username))
      }
    }

    // Filter and search functions
    const applyFilters = (newFilters: typeof filters) => {
      setFilters(newFilters);
      setShowFilterModal(false);
    };

    const filteredAndSortedCashbooks = useMemo(() => {
      let result = cashbooks.filter((cashbook: Cashbook) => 
        cashbook.which_company === whichCompany?.$id
      );

      // Apply search filters
      const searchTerm = filters.searchTerm || quickSearch;
      if (searchTerm) {
        result = result.filter(cashbook =>
          cashbook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cashbook.description && cashbook.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Apply balance filter
      if (filters.balanceFilter !== 'all') {
        result = result.filter(cashbook => {
          const balance = balances[cashbook.$id] || 0;
          switch (filters.balanceFilter) {
            case 'positive': return balance > 0;
            case 'negative': return balance < 0;
            case 'zero': return balance === 0;
            default: return true;
          }
        });
      }

      // Apply sorting
      result.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime();
            break;
          case 'balance':
            const balanceA = balances[a.$id] || 0;
            const balanceB = balances[b.$id] || 0;
            comparison = balanceA - balanceB;
            break;
        }
        
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });

      return result;
    }, [cashbooks, whichCompany, filters, quickSearch, balances]);

    const filteredCashbooks = filteredAndSortedCashbooks;

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Header */}
      {CompaniesLoading || CashbooksLoading && <Loader />}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <BackButton />
        <ThemedText type='title' className="text-xl font-bold">{whichCompany?.name}</ThemedText>
      </View>

      {error && <Text className='text-red-500 m-auto text-center w-100 mx-5 mb-4'>{error}</Text>}

      {/* Search and Filter Bar */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center space-x-2">
          {/* Quick Search */}
          <View className="flex-1 relative">
            <TextInput
              className="w-full p-3 pl-10 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
              placeholder="Search cashbooks..."
              placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={quickSearch}
              onChangeText={setQuickSearch}
            />
            <Ionicons
              name="search"
              size={20}
              color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              style={{ position: 'absolute', left: 12, top: 14 }}
            />
            {quickSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuickSearch('')}
                style={{ position: 'absolute', right: 12, top: 14 }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 ml-2"
          >
            <Ionicons
              name="filter"
              size={20}
              color={theme === 'dark' ? 'white' : 'black'}
            />
            {(filters.searchTerm || filters.balanceFilter !== 'all' || filters.sortBy !== 'name') && (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-600 rounded-full" />
            )}
          </TouchableOpacity>

          {/* Export Button */}
          <TouchableOpacity
            onPress={() => setShowExportModal(true)}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 ml-2"
            disabled={filteredCashbooks.length === 0}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={filteredCashbooks.length === 0 
                ? (theme === 'dark' ? '#4B5563' : '#9CA3AF')
                : (theme === 'dark' ? 'white' : 'black')
              }
            />
          </TouchableOpacity>
        </View>

        {/* Results Info */}
        <View className="flex-row justify-between items-center mt-3">
          <ThemedText className="text-base font-semibold text-black dark:text-white">
            Cashbooks ({filteredCashbooks.length})
          </ThemedText>
          {(filters.searchTerm || quickSearch || filters.balanceFilter !== 'all') && (
            <TouchableOpacity
              onPress={() => {
                setQuickSearch('');
                setFilters({
                  searchTerm: '',
                  sortBy: 'name',
                  sortOrder: 'asc',
                  balanceFilter: 'all',
                  dateRange: { start: null, end: null }
                });
              }}
            >
              <ThemedText className="text-sm text-cyan-600 dark:text-cyan-400">Clear filters</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cashbook List */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {filteredCashbooks.length === 0 ? (
            <View className="p-8 items-center">
              <Ionicons
                name="wallet-outline"
                size={48}
                color={theme === 'dark' ? '#4B5563' : '#9CA3AF'}
              />
              <ThemedText className="text-center mt-4 text-gray-500 dark:text-gray-400">
                {(filters.searchTerm || quickSearch || filters.balanceFilter !== 'all') 
                  ? 'No cashbooks match your filters'
                  : 'No cashbooks yet'
                }
              </ThemedText>
              {(filters.searchTerm || quickSearch || filters.balanceFilter !== 'all') && (
                <TouchableOpacity
                  onPress={() => {
                    setQuickSearch('');
                    setFilters({
                      searchTerm: '',
                      sortBy: 'name',
                      sortOrder: 'asc',
                      balanceFilter: 'all',
                      dateRange: { start: null, end: null }
                    });
                  }}
                  className="mt-3"
                >
                  <ThemedText className="text-cyan-600 dark:text-cyan-400">Clear all filters</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredCashbooks.map((cashbook: Cashbook, index) => (
              <View key={cashbook.$id}>
                <Swipeable
                  renderRightActions={() => renderRightActions(cashbook.$id, cashbook.name)}
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/transactions/${cashbook.$id}`)}
                    className={`flex-row items-center py-3 px-4 ${
                      index < filteredCashbooks.length - 1 ? 'border-b border-gray-200 dark:border-[#2C2F5D]' : ''
                    }`}
                  >
                    {/* Icon for cashbook */}
                    <Ionicons
                      name="wallet-outline" // Using a wallet icon for cashbooks
                      size={28}
                      color={theme === 'dark' ? 'white' : '#6B7280'}
                      className="mr-4"
                    />
                    <View className="flex-1">
                      <ThemedText className="text-base font-semibold">{cashbook.name}</ThemedText>
                      <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateShortWords(cashbook.$createdAt)}
                      </ThemedText>
                    </View>
                    <View className="items-end">
                      <ThemedText className="text-sm text-gray-500 dark:text-gray-400">current balance</ThemedText>
                      <Text className={`text-base font-bold ${balances[cashbook.$id] < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}  mt-1`}>
                        {formatCurrency((balances[cashbook.$id] || 0).toString())}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              </View>
            ))
          )}
        </View>

        {/* Add New Cashbook Button */}
        <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-cyan-600 dark:bg-cyan-500 items-center justify-center shadow-md"
          onPress={handleAddCashbook}
        >
          <Text className="text-white p-2 font-bold">Add New Cashbook For {whichCompany?.name}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <Modalize rootStyle={{ backgroundColor: 'transparent' }} modalStyle={{ backgroundColor: 'transparent' }} ref={modalizeRef}>
        <AddCashbookForm onFormSubmit={handleCloseModal} />
      </Modalize>

      <CashbookFilter
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={applyFilters}
        currentFilters={filters}
      />

      <CashbookExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        cashbooks={filteredCashbooks}
        balances={balances}
        companyName={whichCompany?.name || 'Unknown Company'}
        appliedFilters={{
          searchTerm: filters.searchTerm || quickSearch,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          balanceFilter: filters.balanceFilter
        }}
      />
    </View>
  );
}
