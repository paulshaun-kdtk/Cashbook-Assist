import { formatCurrency } from '@/assets/formatters/currency';
import { ThemedText } from '@/components/ThemedText';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { selectCashbookBalances } from '@/redux/slices/cashbooks/selectCashbookTotals';
import { RootState } from '@/redux/store';
import { fetchCashbooksThunk } from '@/redux/thunks/cashbooks/fetch';
import { fetchCompaniesThunk } from '@/redux/thunks/companies/fetch';
import { fetchExpensesThunk } from '@/redux/thunks/expenses/fetch';
import { fetchIncomeThunk } from '@/redux/thunks/income/fetch';
import { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';


export default function HomeScreen() {
  const theme = useColorScheme();
  const {user} = useSelector((state: RootState) => state.auth);
  const {username} = useStoredUsername()
  const dispatch = useDispatch()

    const balances = useSelector(selectCashbookBalances)
    const { income, loading: incomeLoading, error: incomeError } = useSelector((state: RootState) => state.income);
    const { expenses, loading: expensesLoading, error: expensesError } = useSelector((state: RootState) => state.expenses);
    const { companies, loading: companiesLoading, error: companiesError } = useSelector(
      (state: RootState) => state.companies
    );
    const { cashbooks, loading: cashbooksLoading, error: cashbooksError } = useSelector(
      (state: RootState) => state.cashbooks
    );
  
    const [expandedCompanyId, setExpandedCompanyId] = React.useState<string | null>(null);
  
    React.useEffect(() => {
      if (username) {
        dispatch(fetchCompaniesThunk(username));
        dispatch(fetchCashbooksThunk(username));
        dispatch(fetchIncomeThunk(username));
        dispatch(fetchExpensesThunk(username))
      }
    }, [dispatch, username]);

    const totalBalance = React.useMemo(() => {
      return Object.values(balances).reduce((sum, val) => sum + val, 0);
    }, [balances]);

    const totalIncome = income.reduce((sum, item: Transaction) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item: Transaction) => sum + item.amount, 0);

    const recentTransactions = [...income, ...expenses]
    .sort((a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 25); // Show top 5


  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View className="px-4 flex-row justify-between items-center">
          <View className="flex-row items-center space-x-2">
            <View>
              <ThemedText className="text-xs text-gray-500 dark:text-gray-400">Hello!</ThemedText>
              <ThemedText className="text-black dark:text-green-400 font-bold">
                {user?.name}
              </ThemedText>
            </View>
          </View>
        <View className="flex-row items-center gap-5">
          <TouchableOpacity>
            <SimpleLineIcons name="equalizer" size={24} color={theme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
           
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
      </View>
        </View>

        {/* Balance */}
        <View className="bg-gray-100 dark:bg-[#1A1E4A] mx-4 mt-6 rounded-xl p-4">
          <View className="flex-row justify-between items-center">
            <ThemedText className="text-black dark:text-white"> Balance</ThemedText>
            <ThemedText className="text-xs text-gray-500 dark:text-white">All Time</ThemedText>
          </View>
          <ThemedText className="text-4xl font-bold text-green-500 dark:text-green-400 mt-2">{formatCurrency(totalBalance)}</ThemedText>

          <View className="flex-row justify-between mt-4 space-x-3">
            <View className="flex-1 rounded-xl p-3 bg-gradient-to-b from-blue-300 to-blue-600 dark:from-[#4C4AFF] dark:to-[#2B2A7C]">
              <ThemedText className="text-sm text-black dark:text-white">Income</ThemedText>
              <Text className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-300">all time</Text>
            </View>
            <View className="flex-1 rounded-xl p-3 bg-gradient-to-b from-red-300 to-red-600 dark:from-[#FF4C4C] dark:to-[#7C2B2B]">
              <ThemedText className="text-sm text-black dark:text-white">Expenses</ThemedText>
              <Text className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses)}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-300">all time</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row justify-around mt-6 px-6">
          {[
            { icon: 'add', label: 'Add' },
            { icon: 'share-outline', label: 'Share' },
            { icon: 'download-outline', label: 'Export' },
            { icon: 'card', label: 'Transfer' },
          ].map(({ icon, label }) => (
            <View key={label} className='items-center'>
            <TouchableOpacity className="bg-gray-100 dark:bg-[#1A1E4A] rounded-xl p-4 w-lg">
              <Ionicons name={icon as any} size={24} color={theme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
            <Text className="text-xs text-black dark:text-white mt-1">{label}</Text>
            </View>
          ))}
        </View>

        {/* Transactions */}
        <View className="bg-gray-100 dark:bg-[#1A1E4A] mx-4 mt-6 rounded-xl p-4">
          <View className="flex-row justify-between mb-3">
            <ThemedText className="text-sm text-black dark:text-white">Transaction</ThemedText>
            <Link href={'/(tabs)/companies'} className="text-xs text-green-500 dark:text-green-400">See All</Link>
          </View>

          {recentTransactions.map((item: Transaction, index) => (
            <View
              key={item.$id || index}
              className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-[#2C2F5D]"
            >
              <View>
                <ThemedText className="text-black dark:text-white">{item.description || item.memo}</ThemedText>
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.createdAt).toDateString()}
                </ThemedText>
              </View>
              <ThemedText
                className={`font-semibold ${
                  item.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}
              >
                {formatCurrency(item.amount)}
              </ThemedText>
            </View>
          ))}

        </View>
      </ScrollView>
    </View>
  );
}
