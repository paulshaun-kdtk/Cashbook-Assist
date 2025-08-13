import { formatCurrency } from '@/assets/formatters/currency';
import { ThemedText } from '@/components/ThemedText';
import TransferFundsModal from '@/components/forms/transferFunds';
import ExportModal from '@/components/ui/exportModal';
import { PaywallModal } from '@/components/ui/paywallModal';
import { SubscriptionStatusCard } from '@/components/ui/subscriptionStatusCard';
import TransactionFilter from '@/components/ui/transactionFilter';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { useSubscriptionValidation } from '@/hooks/useSubscriptionValidation';
import { selectCashbookBalances } from '@/redux/slices/cashbooks/selectCashbookTotals';
import { RootState } from '@/redux/store';
import { fetchCashbooksThunk } from '@/redux/thunks/cashbooks/fetch';
import { fetchCategoriesThunk } from '@/redux/thunks/categories/fetch';
import { fetchCompaniesThunk } from '@/redux/thunks/companies/fetch';
import { fetchExpensesThunk } from '@/redux/thunks/expenses/fetch';
import { fetchIncomeThunk } from '@/redux/thunks/income/fetch';
import { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Link, router } from 'expo-router';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AIReports } from '../ai/AIReports';
import NotificationDropdown from '../ui/notificationDropdown';

export default function HomeScreen() {
  const theme = useColorScheme();
  const {user} = useSelector((state: RootState) => state.auth);
  const {username} = useStoredUsername()
  const dispatch = useDispatch()
  
  // Offline sync hook to check connectivity status
  const { isOnline } = useOfflineSync();
  
  // Subscription validation hook - automatically validates subscriptions
  const { 
    validateNow, 
    lastValidationTime, 
    hasActiveSubscription,
    syncedWithAppwrite 
  } = useSubscriptionValidation();    const balances = useSelector(selectCashbookBalances)
    const { income } = useSelector((state: RootState) => state.income);
    const { expenses } = useSelector((state: RootState) => state.expenses);
    const { companies } = useSelector(
      (state: RootState) => state.companies
    );
    const { cashbooks } = useSelector(
      (state: RootState) => state.cashbooks
    );
    const { categories } = useSelector(
      (state: RootState) => state.categories
    );
  
  const [showNotificationDropdown, setShowNotificationDropdown] = React.useState(false);
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [showCashbookSelector, setShowCashbookSelector] = React.useState(false);
  const [showAIReportsModal, setShowAIReportsModal] = React.useState(false);
  const [showPaywallModal, setShowPaywallModal] = React.useState(false);
  const [filters, setFilters] = React.useState({
    startDate: "",
    endDate: "",
    category: "",
    type: "",
    company: "",
    cashbook: "",
  });
  
    React.useEffect(() => {
      if (username) {
        dispatch(fetchCompaniesThunk(username));
        dispatch(fetchCashbooksThunk(username));
        dispatch(fetchIncomeThunk(username));
        dispatch(fetchExpensesThunk(username));
        dispatch(fetchCategoriesThunk(username));
      }
    }, [dispatch, username]);

    const totalBalance = React.useMemo(() => {
      return Object.values(balances).reduce((sum, val) => sum + val, 0);
    }, [balances]);

    const totalIncome = income.reduce((sum, item: Transaction) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item: Transaction) => sum + item.amount, 0);

    // Filter and normalize transactions based on current filters
    const rawFilteredTransactions = React.useMemo(() => {
      // First normalize all transactions with proper amount signs and structure
      const normalizedTransactions = [
        ...income.map((item: Transaction) => ({
          ...item,
          amount: Math.abs(item.amount), // Ensure income is positive
          type: 'income' as const,
          normalizedAmount: Math.abs(item.amount)
        })),
        ...expenses.map((item: Transaction) => ({
          ...item,
          amount: -Math.abs(item.amount), // Ensure expenses are negative
          type: 'expense' as const,
          normalizedAmount: -Math.abs(item.amount)
        }))
      ];

      let filtered = normalizedTransactions;

      // Filter by date range
      if (filters.startDate) {
        filtered = filtered.filter(item => 
          new Date(item.createdAt) >= new Date(filters.startDate)
        );
      }
      if (filters.endDate) {
        filtered = filtered.filter(item => 
          new Date(item.createdAt) <= new Date(filters.endDate)
        );
      }

      // Filter by transaction type
      if (filters.type) {
        filtered = filtered.filter(item => item.type === filters.type);
      }

      // Filter by category
      if (filters.category) {
        filtered = filtered.filter(item => 
          item.category && item.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }

      // Filter by company
      if (filters.company) {
        const selectedCompany = companies.find((comp: any) => comp.name === filters.company);
        if (selectedCompany) {
          const companyBooks = cashbooks.filter((book: any) => book.which_company === selectedCompany.$id);
          const companyBookIds = companyBooks.map((book: any) => book.$id);
          filtered = filtered.filter(item => 
            companyBookIds.includes(item.which_cashbook)
          );
        }
      }

      // Filter by cashbook
      if (filters.cashbook) {
        const selectedCashbook = cashbooks.find((book: any) => book.name === filters.cashbook);
        if (selectedCashbook) {
          filtered = filtered.filter(item => 
            item.which_cashbook === selectedCashbook.$id
          );
        }
      }

      // Sort by date ascending for running balance calculation
      return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [income, expenses, filters, companies, cashbooks]);

    // Add running balance to filtered transactions
    const filteredTransactions = React.useMemo(() => {
      let runningBalance = 0;
      return rawFilteredTransactions.map((item) => {
        runningBalance += item.normalizedAmount;
        return {
          ...item,
          balance: runningBalance,
          id: item.$id,
        };
      });
    }, [rawFilteredTransactions]);

    // Get recent transactions for display (sorted by date descending)
    const recentTransactions = React.useMemo(() => {
      return filteredTransactions
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 25); // Show top 25
    }, [filteredTransactions]);

    const handleFilterApply = (newFilters: typeof filters) => {
      setFilters(newFilters);
    };

    // Calculate totals for filtered transactions using normalized amounts
    const filteredTotalIncome = React.useMemo(() => {
      return filteredTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum, item: any) => sum + Math.abs(item.amount), 0);
    }, [filteredTransactions]);

    const filteredTotalExpenses = React.useMemo(() => {
      return filteredTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum, item: any) => sum + Math.abs(item.amount), 0);
    }, [filteredTransactions]);

    const filteredNetAmount = React.useMemo(() => {
      return filteredTotalIncome - filteredTotalExpenses;
    }, [filteredTotalIncome, filteredTotalExpenses]);

    // Get current balance from filtered transactions
    const currentFilteredBalance = React.useMemo(() => {
      return filteredTransactions.length > 0 ? filteredTransactions[filteredTransactions.length - 1].balance : 0;
    }, [filteredTransactions]);


  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View className="px-4 flex-row justify-between items-center">
          <View className="flex-row items-center space-x-2">
            <View>
              <ThemedText className="text-xs text-gray-500 dark:text-gray-400">Hello!</ThemedText>
              <ThemedText className="text-black dark:text-green-400 font-bold">
                {(user as any)?.name}
              </ThemedText>
            </View>
          </View>
        <View className="flex-row items-center gap-5">
          <TouchableOpacity onPress={() => setShowFilterModal(true)}>
            <SimpleLineIcons name="equalizer" size={24} color={theme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowNotificationDropdown(true)}>
            <Ionicons name="notifications-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
          </TouchableOpacity>
      </View>
        </View>

        {/* Subscription Status Card - Only show when online */}
        {isOnline && (
          <SubscriptionStatusCard 
            onUpgradePress={() => setShowPaywallModal(true)}
          />
        )}

        {/* Balance */}
        <View className="bg-gray-100 dark:bg-[#1A1E4A] mx-4 mt-6 rounded-xl p-4">
          <View className="flex-row justify-between items-center">
            <ThemedText className="text-black dark:text-white"> Balance</ThemedText>
            <ThemedText className="text-xs text-gray-500 dark:text-white">
              {Object.keys(filters).some(key => filters[key as keyof typeof filters]) ? 'Filtered' : 'All Companies'}
            </ThemedText>
          </View>
          <ThemedText className="text-4xl font-bold text-green-500 dark:text-green-400 mt-2">
            {formatCurrency((Object.keys(filters).some(key => filters[key as keyof typeof filters]) ? filteredNetAmount : totalBalance).toString())}
          </ThemedText>

          <View className="flex-row justify-between mt-4 space-x-3">
            <View className="flex-1 rounded-xl p-3 bg-gradient-to-b from-blue-300 to-blue-600 dark:from-[#4C4AFF] dark:to-[#2B2A7C]">
              <ThemedText className="text-sm text-black dark:text-white">Income</ThemedText>
              <Text className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency((Object.keys(filters).some(key => filters[key as keyof typeof filters]) ? filteredTotalIncome : totalIncome).toString())}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                {Object.keys(filters).some(key => filters[key as keyof typeof filters]) ? 'filtered' : 'all time'}
              </Text>
            </View>
            <View className="flex-1 rounded-xl p-3 bg-gradient-to-b from-red-300 to-red-600 dark:from-[#FF4C4C] dark:to-[#7C2B2B]">
              <ThemedText className="text-sm text-black dark:text-white">Expenses</ThemedText>
              <Text className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency((Object.keys(filters).some(key => filters[key as keyof typeof filters]) ? filteredTotalExpenses : totalExpenses).toString())}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                {Object.keys(filters).some(key => filters[key as keyof typeof filters]) ? 'filtered' : 'all time'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row justify-around mt-6 px-6">
          {cashbooks.length && (
            <View className="items-center">
              <TouchableOpacity
              className="bg-gray-100 dark:bg-[#1A1E4A] rounded-xl p-4 w-lg"
              onPress={() => setShowCashbookSelector(true)}>
              <Ionicons name="add" size={28} color={theme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>
              <Text className="text-xs text-black dark:text-white mt-1">Add</Text>
            </View>
            )}

          {/* Share Action */}
          <View className="items-center">
            <TouchableOpacity
              className="bg-gray-100 dark:bg-[#1A1E4A] rounded-xl p-4 w-lg"
              onPress={() => setShowExportModal(true)}
            >
              <Ionicons name="share-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
            <Text className="text-xs text-black dark:text-white mt-1">Share</Text>
          </View>

          {/* Export Action */}
          {/* <View className="items-center">
            <TouchableOpacity
              className="bg-gray-100 dark:bg-[#1A1E4A] rounded-xl p-4 w-lg"
            >
              <Ionicons name="download-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
            <Text className="text-xs text-black dark:text-white mt-1">Export</Text>
          </View> */}

          {/* Transfer Action */}
          
          {/* {cashbooks.length > 1 && ( */}
            <View className="items-center">
              <TouchableOpacity
                className="bg-gray-100 dark:bg-[#1A1E4A] rounded-xl p-4 w-lg"
                onPress={() => setShowTransferModal(true)}
                >
                <Ionicons name="swap-horizontal" size={24} color={theme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>
              <Text className="text-xs text-black dark:text-white mt-1">Transfer</Text>
          </View>
          {/* )} */}

          {/* AI Reports Action */}
          {/* <View className="items-center">
            <TouchableOpacity
              className="bg-cyan-100 dark:bg-cyan-900 rounded-xl p-4 w-lg"
              onPress={() => setShowAIReportsModal(true)}
            >
              <Ionicons name="analytics" size={24} color={theme === 'dark' ? '#06B6D4' : '#0891B2'} />
            </TouchableOpacity>
            <Text className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 font-semibold">AI Reports</Text>
          </View> */}
        </View>

        {/* AI Insights Section */}
        {/* {cashbooks.length > 0 && (
          <AIInsightCard 
            transactions={[...income, ...expenses]} 
            categories={categories || []}
            cashbook={cashbooks[0]}
            onViewAllReports={() => {
              setShowAIReportsModal(true);
            }}
          />
        )} */}

        {/* Transactions */}
        <View className="bg-gray-100 dark:bg-[#1A1E4A] mx-4 mt-6 rounded-xl p-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <ThemedText className="text-sm text-black dark:text-white">Transactions</ThemedText>
              {(filters.startDate || filters.endDate || filters.category || filters.type || filters.company || filters.cashbook) && (
                <View className="ml-2 px-2 py-1 bg-cyan-100 dark:bg-cyan-800 rounded-full">
                  <Text className="text-xs text-cyan-600 dark:text-cyan-300 font-semibold">Filtered</Text>
                </View>
              )}
            </View>
            {recentTransactions.length && (
              <Link href={`/transactions/${recentTransactions[0].which_cashbook}`} className="text-xs text-green-500 dark:text-green-400">See All</Link>
            )}
          </View>

          {/* Current Balance Display for Filtered Transactions */}
          {filteredTransactions.length > 0 && (filters.startDate || filters.endDate || filters.category || filters.type || filters.company || filters.cashbook) && (
            <View className="mb-3 p-3 rounded-lg bg-white dark:bg-[#2C2F5D]">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Current Filtered Balance:
                </Text>
                <Text
                  className={`text-lg font-bold ${
                    currentFilteredBalance >= 0
                      ? "text-emerald-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(currentFilteredBalance.toString())}
                </Text>
              </View>
            </View>
          )}

          {recentTransactions.map((item: any, index) => (
            <View
              key={item.$id || index}
              className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-[#2C2F5D]"
            >
              <View className="flex-1">
                <ThemedText className="text-black dark:text-white">{item.description || item.memo}</ThemedText>
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.createdAt).toDateString()}
                </ThemedText>
              </View>
              <View className="items-end">
                <ThemedText
                  className={`font-semibold ${
                    item.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {formatCurrency(item.amount.toString())}
                </ThemedText>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Balance: {formatCurrency(item.balance?.toString() || '0')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Transaction Filter Modal */}
      <TransactionFilter
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleFilterApply}
        currentFilters={filters}
      />

      <NotificationDropdown
        visible={showNotificationDropdown}
        onClose={() => setShowNotificationDropdown(false)}
      />

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={filteredTransactions as any}
        filteredTransactions={filteredTransactions as any}
        filters={filters}
        totalIncome={filteredTotalIncome}
        totalExpenses={filteredTotalExpenses}
        netAmount={filteredNetAmount}
        companyName={companies.find((c: any) => c.name === filters.company)?.name || ''}
        cashbookName={cashbooks.find((c: any) => c.name === filters.cashbook)?.name || ''}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        visible={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />

      {/* Cashbook Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCashbookSelector}
        onRequestClose={() => setShowCashbookSelector(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white dark:bg-[#1A1E4A] rounded-2xl p-6 m-4 w-4/5 max-h-96">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-black dark:text-white">
                Select Cashbook
              </Text>
              <TouchableOpacity onPress={() => setShowCashbookSelector(false)}>
                <Ionicons name="close" size={24} color={theme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-64">
              {(cashbooks as { $id: string; name: string; which_company: string }[]).map((cashbook) => {
                const company = (companies as { $id: string; name: string }[]).find(
                  (comp) => comp.$id === cashbook.which_company
                );
                
                return (
                  <TouchableOpacity
                    key={cashbook.$id}
                    className="p-4 border-b border-gray-200 dark:border-[#2C2F5D]"
                    onPress={() => {
                      setShowCashbookSelector(false);
                      router.push(`/(companies)/transactions/${cashbook.$id}`);
                    }}
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-base font-medium text-black dark:text-white">
                          {cashbook.name}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                          {company?.name || 'Unknown Company'}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency((balances[cashbook.$id] || 0).toString())}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* AI Reports Modal */}
      <Modal
        visible={showAIReportsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAIReportsModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white dark:bg-[#1A1E4A] rounded-xl p-6 m-4 max-h-3/4 w-11/12">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText className="text-xl font-bold">AI Financial Reports</ThemedText>
              <TouchableOpacity onPress={() => setShowAIReportsModal(false)}>
                <Ionicons name="close" size={24} color={theme === 'dark' ? 'white' : 'black'} />
              </TouchableOpacity>
            </View>
            
            {cashbooks.length > 0 && (
              <AIReports
                transactions={[...income, ...expenses]}
                categories={categories || []}
                cashbook={cashbooks[0]}
              />
            )}
          </View>
        </View>
      </Modal>

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
