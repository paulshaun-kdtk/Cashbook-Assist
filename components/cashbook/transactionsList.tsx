import { formatCurrency } from "@/assets/formatters/currency";
import { formatDateShort } from "@/assets/formatters/dates";
import { useStoredUsername } from "@/hooks/useStoredUsername";
import { useToast } from "@/hooks/useToast";
import { RootState } from "@/redux/store";
import { fetchCashbooksThunk } from "@/redux/thunks/cashbooks/fetch";
import { fetchExpensesThunk } from "@/redux/thunks/expenses/fetch";
import { deleteExpenseThunk } from "@/redux/thunks/expenses/post";
import { fetchIncomeThunk } from "@/redux/thunks/income/fetch";
import { deleteIncomeThunk } from "@/redux/thunks/income/post";
import { Cashbook } from "@/types/cashbook";
import { Transaction } from "@/types/transaction";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Modalize } from "react-native-modalize";
import { useDispatch, useSelector } from "react-redux";
import AddTransactionForm from "../forms/addTransaction";
import UpdateTransactionForm from "../forms/updateTransaction";
import { ThemedText } from "../ThemedText";
import ExportModal from "../ui/exportModal";
import Loader from "../ui/loading";

export default function TransactionsListScreen() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const dispatch = useDispatch();
  const toast = useToast();
  const { cashbooks } = useSelector((state: RootState) => state.cashbooks);
  const {
    income,
    error: IncomeError,
  } = useSelector((state: RootState) => state.income);
  const {
    expenses,
    error: ExpensesError,
  } = useSelector((state: RootState) => state.expenses);
  const cashbookId = useLocalSearchParams()?.id;
  const [whichCashbook, setWhichCashbook] = useState<Cashbook | null>(null); // Explicitly type as Cashbook or null
  const { username } = useStoredUsername();
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Pagination state
  const [displayedTransactions, setDisplayedTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 30;

  const updateModalizeRef = React.useRef<Modalize>(null);
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
        .filter(
          (item: Transaction) =>
            !cashbookId || item.which_cashbook === cashbookId
        )
        .map((item: Transaction) => ({
          $id: item.$id,
          $sequence: item.$sequence,
          which_company: item.which_cashbook,
          date: item.createdAt,
          description: item.description || "Income",
          memo: item.memo || "",
          amount: item.amount,
          type: "income",
          category: item.category || "Income",
        })),
      ...expenses
        .filter((item: Transaction) => {
          const category = (item.category || "")
            .toLowerCase()
            .replace(/_/g, " ");
          return (
            (!cashbookId || item.which_cashbook === cashbookId) &&
            !category.includes("cost of sales") &&
            !category.includes("cost of goods sold")
          );
        })
        .map((item: Transaction) => ({
          $id: item.$id,
          $sequence: item.$sequence,
          which_company: item.which_cashbook,
          date: item.createdAt,
          description: item.description || "Expense",
          memo: item.memo || "",
          amount: -Math.abs(item.amount), // Ensure expenses are negative
          type: "expense",
          category: item.category || "Other",
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

  // Load initial transactions
  React.useEffect(() => {
    if (transactions.length > 0) {
      const initialTransactions = transactions.slice(0, ITEMS_PER_PAGE);
      setDisplayedTransactions(initialTransactions);
      setCurrentPage(0);
    }
  }, [transactions]);

  // Load more transactions function
  const loadMoreTransactions = useCallback(() => {
    if (isLoadingMore) return;
    
    const nextPage = currentPage + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    if (startIndex >= transactions.length) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const newTransactions = transactions.slice(startIndex, endIndex);
      setDisplayedTransactions(prev => [...prev, ...newTransactions]);
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    }, 500);
  }, [currentPage, transactions, isLoadingMore]);

  const hasMoreTransactions = (currentPage + 1) * ITEMS_PER_PAGE < transactions.length;

  const currentBalance = transactions.at(-1)?.balance ?? 0;

  // Calculate totals for export
  const totalIncome = income.reduce((sum, item: Transaction) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item: Transaction) => sum + item.amount, 0);
  const netAmount = totalIncome + totalExpenses; // expenses are already negative

  const handleCloseModal = useCallback(() => {
    modalizeRef.current?.close();
    updateModalizeRef.current?.close();
    setSelectedTransaction(null);

    if (username) {
      dispatch(fetchIncomeThunk(username) as any);
      dispatch(fetchExpensesThunk(username) as any);
    }
  }, [dispatch, username]);

  const handleAddTransaction = useCallback(() => {
    modalizeRef.current?.open();
  }, []);

  const handleUpdateModal = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    updateModalizeRef.current?.open();
  }, []);

  const handleTransactionDeletion = useCallback((documentId: string, transactionType: any, description: string) => {
    if (!username) return;
    
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete this ${transactionType}?\n\n"${description}"`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (transactionType === "income") {
              dispatch(deleteIncomeThunk({ documentId }) as any)
                .then(() => {
                  toast.showToast({
                    type: 'success',
                    text1: 'Transaction Deleted',
                    text2: 'Income transaction has been successfully deleted'
                  });
                  dispatch(fetchIncomeThunk(username) as any);
                })
                .catch((error: any) => {
                  toast.showToast({
                    type: 'error',
                    text1: 'Delete Failed',
                    text2: 'Failed to delete income transaction'
                  });
                });
            } else {
              dispatch(deleteExpenseThunk({ documentId }) as any)
                .then(() => {
                  toast.showToast({
                    type: 'success',
                    text1: 'Transaction Deleted',
                    text2: 'Expense transaction has been successfully deleted'
                  });
                  dispatch(fetchExpensesThunk(username) as any);
                })
                .catch((error: any) => {
                  toast.showToast({
                    type: 'error',
                    text1: 'Delete Failed',
                    text2: 'Failed to delete expense transaction'
                  });
                });
            }
          }
        }
      ]
    );
  }, [username, dispatch, toast]);

  const renderRightActions = useCallback((
    transaction: any,
    transactionType: string
  ) => (
    <View className="flex-row items-center justify-end pr-2">
      <TouchableOpacity
        onPress={() => handleUpdateModal(transaction)}
        className="bg-blue-600 justify-center items-center w-[24%] h-full"
      >
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          handleTransactionDeletion(transaction.$id, transactionType, transaction.description);
        }}
        className="bg-red-600 justify-center items-center w-[24%] h-full"
      >
        <MaterialIcons name="delete" size={24} color="white" />
      </TouchableOpacity>
    </View>
  ), [handleUpdateModal, handleTransactionDeletion]);

  const renderTransaction = useCallback(({ item: transaction, index }: { item: any, index: number }) => (
    <View key={transaction.$id}>
      <Swipeable
        renderRightActions={() =>
          renderRightActions(transaction, transaction.type)
        }
      >
        <TouchableOpacity
        onPress={() => handleUpdateModal(transaction)}
          className={`flex-row items-center py-3 px-4 ${
            index < displayedTransactions.length - 1
              ? "border-b border-gray-200 dark:border-[#2C2F5D]"
              : ""
          }`}
        >
          {/* Icon for transaction type */}
          <Ionicons
            name={
              transaction.type === "income"
                ? "arrow-up-circle-outline"
                : "arrow-down-circle-outline"
            }
            size={28}
            color={
              transaction.type === "income"
                ? theme === "dark"
                  ? "#4ADE80"
                  : "#22C55E" // Green for income
                : theme === "dark"
                ? "#F87171"
                : "#EF4444" // Red for expense
            }
            className="mr-4"
          />
          <View className="flex-1">
            <Text className="text-base dark:text-white font-semibold">
              {transaction.description}
            </Text>
            <Text className="text-xs text-gray-700 dark:text-white">
              {transaction.category}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {formatDateShort(transaction.date)}
            </Text>
          </View>
          <View className="items-end">
            <ThemedText
              className={`text-base font-bold ${
                transaction.type === "income"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(transaction.amount.toString())}
            </ThemedText>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Balance: {formatCurrency(transaction.balance.toString())}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  ), [displayedTransactions.length, theme, renderRightActions, handleUpdateModal]);

  const renderFooter = useCallback(() => (
    <View className="px-4">
      {hasMoreTransactions && (
        <View className="py-4 items-center">
          {isLoadingMore ? (
            <Loader />
          ) : (
            <TouchableOpacity
              onPress={loadMoreTransactions}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-full"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                Load More ({transactions.length - displayedTransactions.length} remaining)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Add New Transaction Button */}
      <TouchableOpacity
        className="mt-6 p-4 rounded-xl bg-cyan-600 dark:bg-cyan-500 items-center justify-center shadow-md mb-4"
        onPress={handleAddTransaction}
      >
        <Text className="text-white text-lg font-bold">
          Add New Transaction
        </Text>
      </TouchableOpacity>
    </View>
  ), [hasMoreTransactions, isLoadingMore, loadMoreTransactions, transactions.length, displayedTransactions.length, handleAddTransaction]);

  const ListHeaderComponent = useCallback(() => (
    <View>
      {/* Balance Display */}
      <View className="px-4 mb-4 justify-between flex-row items-start">
        <ThemedText className="text-base font-semibold text-black dark:text-white">
          Transactions
        </ThemedText>
        <View
          className={`px-4 py-2 rounded-full ${
            currentBalance >= 0
              ? "bg-green-100 dark:bg-green-200"
              : "bg-red-100 dark:bg-red-200"
          }`}
        >
          <Text
            className={`text-lg font-semibold ${
              currentBalance >= 0
                ? "text-emerald-600 dark:text-green-900"
                : "text-red-800 dark:text-red-900"
            }`}
          >
            Balance: {formatCurrency(currentBalance.toString())}
          </Text>
        </View>
      </View>
    </View>
  ), [currentBalance]);

  const ListEmptyComponent = useCallback(() => (
    <View className="p-4 items-center justify-center">
      <ThemedText className="text-gray-500 dark:text-gray-400">
        No transactions yet. Add one to get started!
      </ThemedText>
    </View>
  ), []);

  return (
    <View className="bg-white dark:bg-[#0B0D2A] pt-12" style={{ position: 'relative' }}>
      {/* Header Section */}
      <View className="px-4 flex-row items-center justify-between relative mb-6">
      <View className="flex-row justify-between items-start" />
        <ThemedText type="title" style={{ maxWidth: '70%' }}>
          {whichCashbook?.name || "All Transactions"}
        </ThemedText>

        <TouchableOpacity
          onPress={() => setShowExportModal(true)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
        >
          <Ionicons 
            name="download-outline" 
            size={20} 
            color={theme === 'dark' ? 'white' : 'black'} 
          />
        </TouchableOpacity>
      </View>

      {IncomeError && (
        <Text className="text-red-500 text-center mx-2">
          Income Error: {IncomeError}
        </Text>
      )}
      {ExpensesError && (
        <Text className="text-red-500 text-center mx-2">
          Expenses Error: {ExpensesError}
        </Text>
      )}

      <View className="mx-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1A1E4A] shadow-lg">
        <FlatList
          data={displayedTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.$id}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={renderFooter}
          onEndReached={loadMoreTransactions}
          contentContainerStyle={{ paddingBottom: 490 }}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View />}
        />
      </View>

      <Modalize
        rootStyle={{ 
          backgroundColor: "rgba(0, 0, 0, 0.5)", 
          // zIndex: 9999,
          // elevation: 1000 
        }}
        modalStyle={{ 
          backgroundColor: "transparent",
          // zIndex: 10000,
          // elevation: 1001
        }}
        ref={updateModalizeRef}
        >
        <UpdateTransactionForm transactionData={selectedTransaction} onFormSubmit={handleCloseModal} />
      </Modalize>

      <Modalize
        rootStyle={{ 
          backgroundColor: "rgba(0, 0, 0, 0.5)", 
          // flex: 1,
          // zIndex: 9999,
          // elevation: 1000 
        }}
        modalStyle={{ 
          backgroundColor: "transparent",
          // zIndex: 10000,
          // elevation: 1001
        }}
        ref={modalizeRef}
      >
        <AddTransactionForm onFormSubmit={handleCloseModal} />
      </Modalize>

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={transactions}
        filteredTransactions={displayedTransactions}
        filters={{
          startDate: "",
          endDate: "",
          category: "",
          type: "",
          company: "",
          cashbook: whichCashbook?.name || "",
        }}
        totalIncome={totalIncome}
        totalExpenses={Math.abs(totalExpenses)}
        netAmount={netAmount}
        companyName=""
        cashbookName={whichCashbook?.name || ""}
      />
    </View>
  );
}
