import { formatCurrency } from '@/assets/formatters/currency';
import { formatDateShort } from '@/assets/formatters/dates';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { fetchCashbooksThunk } from '@/redux/thunks/cashbooks/fetch';
import { fetchExpensesThunk } from '@/redux/thunks/expenses/fetch';
import { deleteExpenseThunk } from '@/redux/thunks/expenses/post';
import { fetchIncomeThunk } from '@/redux/thunks/income/fetch';
import { deleteIncomeThunk } from '@/redux/thunks/income/post';
import { Cashbook } from '@/types/cashbook';
import { Transaction } from '@/types/transaction';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Modalize } from 'react-native-modalize';
import { useDispatch, useSelector } from 'react-redux';
import AddTransactionForm from '../forms/addTransaction';
import { ThemedText } from '../ThemedText';

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

  const rawTransactions = useMemo(() => {
    return [
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
  }, [cashbookId, expenses, income]);
  
  const transactions = useMemo(() => {
    let runningBalance = 0;
    return rawTransactions.map((item) => {
      runningBalance += item.amount;
      return {
        ...item,
        balance: runningBalance,
        id: item.$id,
      };
    });
  }, [rawTransactions]);

  const currentBalance = transactions.at(-1)?.balance ?? 0;

  const handleAddTransaction = useCallback(() => {
    modalizeRef.current?.open();
  }, []);

  const handleCloseModal = useCallback(() => {
    modalizeRef.current?.close();
    if (username) {
      dispatch(fetchIncomeThunk(username));
      dispatch(fetchExpensesThunk(username));
    }
  }, [dispatch, username]);

  const handleTransactionDeletion = (documentId: string, transactionType) => {
    if (!username) return
    if (transactionType === 'income') {
      dispatch(deleteIncomeThunk({documentId})).then(() => {
        dispatch(fetchIncomeThunk(username));
      });
    } else {
      dispatch(deleteExpenseThunk({documentId})).then(() => {
        dispatch(fetchExpensesThunk(username));
      });
    }
  }
      const renderRightActions = (documentId: string, transactionType: string) => (
      <TouchableOpacity
        onPress={() => {
          handleTransactionDeletion(documentId, transactionType);  
        }}
        className="bg-red-600 justify-center items-center w-20 h-full"
      >
        <MaterialIcons name="delete" size={24} color="white" />
      </TouchableOpacity>
    );
  


  return (
    <View className="flex-1 bg-white dark:bg-[#0B0D2A] pt-12">
      {/* Header Section */}
      <View className="px-4 flex-row items-center justify-center relative mb-6">
        <ThemedText type="title" className="text-xl font-bold">
          {whichCashbook?.name || 'All Transactions'}
        </ThemedText>
      </View>

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
                            <View key={transaction.$id}>
                                <Swipeable
                                  renderRightActions={() => renderRightActions(transaction.$id, transaction.type)}
                                >

              <TouchableOpacity
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
                  <Text className="text-base dark:text-white font-semibold">
                    {transaction.description}
                  </Text>
                  <Text className='text-xs text-gray-700 dark:text-white'>{transaction.category}</Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDateShort(transaction.date)}
                  </Text>
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
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Balance: {formatCurrency(transaction.balance)}
                  </Text>
                </View>
              </TouchableOpacity>
                    </Swipeable>
                </View>
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