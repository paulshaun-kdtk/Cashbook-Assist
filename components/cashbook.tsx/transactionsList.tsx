import { formatCurrency } from '@/assets/formatters/currency';
import { formatDateShort } from '@/assets/formatters/dates';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { fetchCashbooksThunk } from '@/redux/thunks/cashbooks/fetch';
import { fetchExpensesThunk } from '@/redux/thunks/expenses/fetch';
import { fetchIncomeThunk } from '@/redux/thunks/income/fetch';
import { Cashbook } from '@/types/cashbook';
import { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedText } from '../ThemedText';
import AddTransactionForm from '../forms/addTransaction';
import Loader from '../ui/loading';

export default function TransactionsListScreen() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const dispatch = useDispatch();
  const { cashbooks } = useSelector((state: RootState) => state.cashbooks);
  const { income, loading: IncomeLoading, error: IncomeError } = useSelector((state: RootState) => state.income);
  const { expenses, loading: ExpensesLoading, error: ExpensesError } = useSelector((state: RootState) => state.expenses);
  const cashbookId = useLocalSearchParams()?.id;
  const [whichCashbook, setWhichCashbook] = useState<Cashbook | null>(null); // Explicitly type as Cashbook or null
  const { username } = useStoredUsername();
  const modalizeRef = React.useRef<Modalize>(null);

  // Fetch data only when `username` is available
  React.useEffect(() => {
    if (username) {
      dispatch(fetchCashbooksThunk(username));
      dispatch(fetchIncomeThunk(username));
      dispatch(fetchExpensesThunk(username));
    }
  }, [dispatch, username]);

  // Set whichCashbook once cashbooks are fetched
  React.useEffect(() => {
    if (!whichCashbook && cashbooks.length && cashbookId) {
      const book = cashbooks.find((item: Cashbook) => item.$id === cashbookId);
      if (book) {
        setWhichCashbook(book);
      }
    }
  }, [cashbooks, cashbookId, whichCashbook]);

  const rawTransactions = [
    ...income
      .filter((item: Transaction) => !cashbookId || item.which_cashbook === cashbookId)
      .map((item: Transaction) => ({
        $id: item.$id,
        $sequence: item.$sequence,
        which_company: item.which_cashbook,
        date: item.createdAt,
        description: item.description || 'Income',
        memo: item.memo || '',
        amount: item.amount,
        type: 'income',
        category: item.category || 'Income',
      })),
    ...expenses
      .filter((item: Transaction) => {
        const category = (item.category || '').toLowerCase().replace(/_/g, ' ');
        return (
          (!cashbookId || item.which_cashbook === cashbookId) &&
          !category.includes('cost of sales') &&
          !category.includes('cost of goods sold')
        );
      })
      .map((item: Transaction) => ({
        $id: item.$id,
        $sequence: item.$sequence,
        which_company: item.which_cashbook,
        date: item.createdAt,
        description: item.description || 'Expense',
        memo: item.memo || '',
        amount: -Math.abs(item.amount), // Ensure expenses are negative
        type: 'expense',
        category: item.category || 'Other',
      })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

  // Calculate running balance
  let runningBalance = 0;
  const transactions = rawTransactions.map((item) => {
    runningBalance += item.amount;
    return {
      ...item,
      balance: runningBalance,
      id: item.$id, // Use $id for uniqueness if $sequence isn't guaranteed unique across types
    };
  });

  const currentBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;

  const handleAddTransaction = () => {
    modalizeRef.current?.open();
  };

  const handleCloseModal = () => {
    modalizeRef.current?.close();
    // Re-fetch data to update the transaction list after adding a new one
    if (username) {
      dispatch(fetchIncomeThunk(username));
      dispatch(fetchExpensesThunk(username));
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Header Section */}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText type="title" className="text-xl font-bold">
          {whichCashbook?.name || 'All Transactions'}
        </ThemedText>
      </View>

      {/* Loading and Error Indicators */}
      {(IncomeLoading || ExpensesLoading) && <Loader />}
      {IncomeError && (
        <Text className="text-red-500 text-center mx-2">Income Error: {IncomeError}</Text>
      )}
      {ExpensesError && (
        <Text className="text-red-500 text-center mx-2">Expenses Error: {ExpensesError}</Text>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Balance Display */}
        <View className="px-4 mb-4 justify-between flex-row items-start">
          <ThemedText className="text-base font-semibold text-black dark:text-white">
            Transactions
          </ThemedText>
          <View
            className={`px-4 py-2 rounded-full ${
              currentBalance >= 0
                ? 'bg-green-100 dark:bg-green-200'
                : 'bg-red-100 dark:bg-red-200'
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                currentBalance >= 0
                  ? 'text-emerald-600 dark:text-green-900'
                  : 'text-red-800 dark:text-red-900'
              }`}
            >
              Balance: {formatCurrency(currentBalance)}
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
          {transactions.length === 0 ? (
            <View className="p-4 items-center justify-center">
              <ThemedText className="text-gray-500 dark:text-gray-400">
                No transactions yet. Add one to get started!
              </ThemedText>
            </View>
          ) : (
            transactions.map((transaction, index) => (
              <TouchableOpacity
                key={transaction.id}
                className={`flex-row items-center py-3 px-4 ${
                  index < transactions.length - 1
                    ? 'border-b border-gray-200 dark:border-[#2C2F5D]'
                    : ''
                }`}
              >
                {/* Icon for transaction type */}
                <Ionicons
                  name={
                    transaction.type === 'income'
                      ? 'arrow-up-circle-outline'
                      : 'arrow-down-circle-outline'
                  }
                  size={28}
                  color={
                    transaction.type === 'income'
                      ? theme === 'dark'
                        ? '#4ADE80'
                        : '#22C55E' // Green for income
                      : theme === 'dark'
                      ? '#F87171'
                      : '#EF4444' // Red for expense
                  }
                  className="mr-4"
                />
                <View className="flex-1">
                  <ThemedText className="text-base font-semibold">
                    {transaction.description}
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDateShort(transaction.date)}
                  </ThemedText>
                </View>
                <View className="items-end">
                  <ThemedText
                    className={`text-base font-bold ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Balance: {formatCurrency(transaction.balance)}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Add New Transaction Button */}
        <TouchableOpacity
          className="mx-4 mt-6 p-4 rounded-xl bg-cyan-600 dark:bg-cyan-500 items-center justify-center shadow-md"
          onPress={handleAddTransaction}
        >
          <Text className="text-white text-lg font-bold">Add New Transaction</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modalize
        rootStyle={{ backgroundColor: 'transparent' }}
        modalStyle={{ backgroundColor: 'transparent' }}
        ref={modalizeRef}
      >
        <AddTransactionForm onFormSubmit={handleCloseModal} />
      </Modalize>
    </View>
  );
}