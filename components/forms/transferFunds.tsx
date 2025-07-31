import { formatDate } from '@/assets/formatters/dates';
import { useStoredUsername } from '@/hooks/useStoredUsername';
import { RootState } from '@/redux/store';
import { fetchCashbooksThunk } from '@/redux/thunks/cashbooks/fetch';
import { fetchExpensesThunk } from '@/redux/thunks/expenses/fetch';
import { createExpenseThunk } from '@/redux/thunks/expenses/post';
import { fetchIncomeThunk } from '@/redux/thunks/income/fetch';
import { createIncomeThunk } from '@/redux/thunks/income/post';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useDispatch, useSelector } from 'react-redux';

interface TransferFundsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TransferFundsModal({ visible, onClose }: TransferFundsModalProps) {
  const theme = useColorScheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  const { username } = useStoredUsername();

  // Get cashbooks from Redux store
  const { cashbooks, loading: cashbooksLoading } = useSelector(
    (state: RootState) => state.cashbooks
  );

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Transfer between cashbooks');
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [fromCashbook, setFromCashbook] = useState('');
  const [toCashbook, setToCashbook] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Type definition for cashbook item
  interface Cashbook {
    $id: string;
    name: string;
    which_company: string;
    which_key: string;
  }

  // Fetch cashbooks on component mount
  useEffect(() => {
    if (username && visible) {
      dispatch(fetchCashbooksThunk(username));
    }
  }, [dispatch, username, visible]);

  const handleTransfer = async () => {
    // Validate form
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!fromCashbook) {
      setError('Please select a source cashbook');
      return;
    }
    
    if (!toCashbook) {
      setError('Please select a destination cashbook');
      return;
    }
    
    if (fromCashbook === toCashbook) {
      setError('Source and destination cashbooks must be different');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const transferAmount = parseFloat(amount);
      const timestamp = date.toISOString();
      
      // Cast cashbooks to the proper type for TypeScript
      const typedCashbooks = cashbooks as { $id: string; name: string }[];
      
      const fromCashbookName = typedCashbooks.find(cb => cb.$id === fromCashbook)?.name || 'Unknown';
      const toCashbookName = typedCashbooks.find(cb => cb.$id === toCashbook)?.name || 'Unknown';

      // Create expense in source cashbook
      await dispatch(createExpenseThunk({
        data: {
          which_cashbook: fromCashbook,
          which_key: username,
          amount: transferAmount,
          category: 'Transfer Out',
          description: `${description} (Transfer to ${toCashbookName})`,
          memo: `${description}`,
          createdAt: timestamp,
        }
      }) as any);

      // Create income in destination cashbook
      await dispatch(createIncomeThunk({
        data: {
          which_cashbook: toCashbook,
          which_key: username,
          amount: transferAmount,
          category: 'Transfer In',
          description: `${description} (Transfer from ${fromCashbookName})`,
          memo: `${description}`,
          createdAt: timestamp,
        }
      }) as any);

      // Refresh cashbooks, income and expenses data
      if (username) {
        await Promise.all([
          dispatch(fetchCashbooksThunk(username) as any),
          dispatch(fetchIncomeThunk(username) as any),
          dispatch(fetchExpensesThunk(username) as any)
        ]);
      }

      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Transfer error:', err);
      setError('Failed to process transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('Transfer between cashbooks');
    setDate(new Date());
    setFromCashbook('');
    setToCashbook('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centeredView}
      >
        <View style={[
          styles.modalView,
          { backgroundColor: isDark ? '#1A1E4A' : 'white' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDark ? 'white' : 'black' }]}>
              Transfer Funds
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={isDark ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {cashbooksLoading ? (
              <ActivityIndicator size="large" color={isDark ? '#4C4AFF' : '#3498db'} />
            ) : (
              <>
                {/* Amount Field */}
                <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>
                  Amount
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: isDark ? '#2C2F5D' : '#f0f0f0', color: isDark ? 'white' : 'black' }
                  ]}
                  placeholderTextColor={isDark ? '#8e8e93' : '#a9a9a9'}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                {/* From Cashbook Field */}
                <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>
                  From Cashbook
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.cashbookSelector}
                >
                  {(cashbooks as { $id: string; name: string }[]).map((cashbook) => (
                    <TouchableOpacity
                      key={cashbook.$id}
                      style={[
                        styles.cashbookChip,
                        {
                          backgroundColor: 
                            fromCashbook === cashbook.$id
                              ? isDark ? '#4C4AFF' : '#3498db'
                              : isDark ? '#2C2F5D' : '#f0f0f0'
                        }
                      ]}
                      onPress={() => setFromCashbook(cashbook.$id)}
                    >
                      <Text 
                        style={[
                          styles.cashbookChipText, 
                          { color: fromCashbook === cashbook.$id ? 'white' : isDark ? '#8e8e93' : '#555' }
                        ]}
                      >
                        {cashbook.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* To Cashbook Field */}
                <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>
                  To Cashbook
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.cashbookSelector}
                >
                  {(cashbooks as { $id: string; name: string }[]).map((cashbook) => (
                    <TouchableOpacity
                      key={cashbook.$id}
                      style={[
                        styles.cashbookChip,
                        {
                          backgroundColor: 
                            toCashbook === cashbook.$id
                              ? isDark ? '#4C4AFF' : '#3498db'
                              : isDark ? '#2C2F5D' : '#f0f0f0'
                        }
                      ]}
                      onPress={() => setToCashbook(cashbook.$id)}
                    >
                      <Text 
                        style={[
                          styles.cashbookChipText, 
                          { color: toCashbook === cashbook.$id ? 'white' : isDark ? '#8e8e93' : '#555' }
                        ]}
                      >
                        {cashbook.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Description Field */}
                <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>
                  Description (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: isDark ? '#2C2F5D' : '#f0f0f0', color: isDark ? 'white' : 'black' }
                  ]}
                  placeholderTextColor={isDark ? '#8e8e93' : '#a9a9a9'}
                  placeholder="Description for the transfer"
                  value={description}
                  onChangeText={setDescription}
                />

                {/* Date Field */}
                <Text style={[styles.label, { color: isDark ? 'white' : 'black' }]}>
                  Date
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.dateSelector,
                    { backgroundColor: isDark ? '#2C2F5D' : '#f0f0f0' }
                  ]}
                  onPress={() => setOpenDatePicker(true)}
                >
                  <Text style={{ color: isDark ? 'white' : 'black' }}>
                    {formatDate(date.toISOString())}
                  </Text>
                  <Ionicons name="calendar" size={20} color={isDark ? 'white' : 'black'} />
                </TouchableOpacity>

                <DatePicker
                  modal
                  open={openDatePicker}
                  date={date}
                  mode="date"
                  onConfirm={(selectedDate) => {
                    setOpenDatePicker(false);
                    setDate(selectedDate);
                  }}
                  onCancel={() => {
                    setOpenDatePicker(false);
                  }}
                  theme={isDark ? "dark" : "light"}
                />

                {/* Error Message */}
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                {/* Success Message */}
                {success ? (
                  <Text style={styles.successText}>Transfer completed successfully!</Text>
                ) : null}
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isSubmitting 
                  ? isDark ? '#2C2F5D' : '#a0a0a0' 
                  : isDark ? '#4C4AFF' : '#3498db'
              }
            ]}
            onPress={handleTransfer}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Transfer Funds</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    maxHeight: '80%',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    maxHeight: '80%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashbookSelector: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  cashbookChip: {
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cashbookChipText: {
    fontSize: 14,
  },
  submitButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    marginVertical: 10,
    textAlign: 'center',
  },
  successText: {
    color: '#00b894',
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
