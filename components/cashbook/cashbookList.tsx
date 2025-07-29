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
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import AddCashbookForm from '../forms/addCashbook';
import { ThemedText } from '../ThemedText';
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

    const filteredCashbooks = cashbooks.filter((cashbook: Cashbook) => cashbook.which_company === whichCompany?.$id);

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Header */}
      {CompaniesLoading || CashbooksLoading && <Loader />}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText type='title' className="text-xl font-bold">{whichCompany?.name}</ThemedText>
      </View>

      {error && <Text className='text-red-500 m-auto text-center w-100 mx-5 mb-4'>{error}</Text>}

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-4 mb-4">
          <ThemedText className="text-base font-semibold text-black dark:text-white">Cashbooks</ThemedText>
        </View>

        {/* Cashbook List */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {filteredCashbooks.map((cashbook: Cashbook, index) => (
            <View key={cashbook.$id}>
                  <Swipeable
                    renderRightActions={() => renderRightActions(cashbook.$id, cashbook.name)}
                  >
            <TouchableOpacity
              onPress={() => router.push(`/transactions/${cashbook.$id}`)}
              className={`flex-row items-center py-3 px-4 ${
                index < cashbooks.length - 1 ? 'border-b border-gray-200 dark:border-[#2C2F5D]' : ''
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
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">{formatDateShortWords(cashbook.$createdAt)}</ThemedText>
              </View>
              <View className="items-end">
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">current balance</ThemedText>
                <Text className={`text-base font-bold ${balances[cashbook.$id] < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}  mt-1`}>
                   {formatCurrency(balances[cashbook.$id] || 0)}
                </Text>
              </View>
            </TouchableOpacity>
                </Swipeable>
              </View>
          ))}
        </View>

        {/* Add New Cashbook Button */}
        <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-cyan-600 dark:bg-cyan-500 items-center justify-center shadow-md"
          onPress={handleAddCashbook}
        >
          <Text className="text-white p-2 font-bold">Add New Cashbook For {whichCompany?.name}</Text>
        </TouchableOpacity>
      </ScrollView>
            <Modalize rootStyle={{ backgroundColor: 'transparent' }} modalStyle={{ backgroundColor: 'transparent' }} ref={modalizeRef}><AddCashbookForm onFormSubmit={handleCloseModal} /></Modalize>
    </View>
  );
}
