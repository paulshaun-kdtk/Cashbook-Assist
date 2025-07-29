import { formatCurrency } from '@/assets/formatters/currency';
import { formatDate, formatDateShort } from '@/assets/formatters/dates';
import { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import * as XLSX from 'xlsx';
import { ThemedText } from '../ThemedText';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  filters: {
    startDate: string;
    endDate: string;
    category: string;
    type: string;
    company: string;
    cashbook: string;
  };
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  companyName?: string;
  cashbookName?: string;
}

export default function ExportModal({
  visible,
  onClose,
  transactions,
  filteredTransactions,
  filters,
  totalIncome,
  totalExpenses,
  netAmount,
  companyName = '',
  cashbookName = '',
}: ExportModalProps) {
  const theme = useColorScheme();
  const [isExporting, setIsExporting] = useState(false);

  const generateHTMLContent = () => {
    const reportTitle = `${companyName ? `${companyName} - ` : ''}${cashbookName || 'Cash Book'} Report`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
      <title>${reportTitle}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        margin: 20px; 
        color: #333;
        line-height: 1.6;
        }
        .header { 
        text-align: center; 
        margin-bottom: 20px; 
        border-bottom: 2px solid #3b82f6; 
        padding-bottom: 10px; 
        }
        .header h1 {
        color: #1e40af;
        margin-bottom: 5px;
        }
        .summary-simple {
        display: flex;
        gap: 25px;
        justify-content: center;
        margin-bottom: 15px;
        }
        .summary-item {
        font-size: 15px;
        color: #374151;
        background: #f3f4f6;
        border-radius: 8px;
        padding: 10px 18px;
        font-weight: 500;
        min-width: 120px;
        text-align: center;
        }
        .income { color: #059669; }
        .expense { color: #dc2626; }
        .net-positive { color: #059669; }
        .net-negative { color: #dc2626; }
        .filters-simple {
        display: flex;
        gap: 18px;
        justify-content: center;
        margin-bottom: 10px;
        font-size: 13px;
        color: #6b7280;
        }
        table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 20px;
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07);
        border-radius: 8px;
        overflow: hidden;
        }
        th, td { 
        padding: 10px 8px; 
        text-align: left; 
        border-bottom: 1px solid #e2e8f0; 
        }
        th { 
        background: #3b82f6;
        color: white;
        font-weight: 600;
        font-size: 13px;
        letter-spacing: 0.5px;
        }
        tr:hover {
        background-color: #f8fafc;
        }
        .amount-cell { 
        text-align: right; 
        font-weight: 600;
        }
        .date-cell { 
        color: #6b7280; 
        font-size: 13px;
        }
        .category-tag { 
        background: #e0e7ff;
        color: #3730a3; 
        padding: 3px 8px; 
        border-radius: 12px; 
        font-size: 12px; 
        font-weight: 500;
        display: inline-block;
        }
        .transaction-description {
        font-weight: 500;
        color: #374151;
        }
        .balance-cell {
        font-weight: 600;
        color: #1f2937;
        }
        .footer {
        margin-top: 25px;
        text-align: center;
        color: #6b7280;
        font-size: 12px;
        border-top: 1px solid #e2e8f0;
        padding-top: 10px;
        }
        @media print {
        body { margin: 0; }
        .no-print { display: none; }
        }
      </style>
      </head>
      <body>
      <div class="header">
        <h1>${reportTitle}</h1>
        <p style="color: #6b7280; margin: 0;">Generated on ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: '2-digit',
        minute: '2-digit'
        })}</p>
      </div>

      <div class="filters-simple">
        <span><strong>Date:</strong> ${filters.startDate ? formatDate(filters.startDate) : "All"}${filters.endDate ? ` to ${formatDate(filters.endDate)}` : ""}</span>
        <span><strong>Category:</strong> ${filters.category || "All"}</span>
        <span><strong>Type:</strong> ${!filters.type || filters.type === "all" ? "All" : filters.type === "income" ? "Income" : "Expense"}</span>
        ${filters.company ? `<span><strong>Company:</strong> ${filters.company}</span>` : ""}
        ${filters.cashbook ? `<span><strong>Cashbook:</strong> ${filters.cashbook}</span>` : ""}
      </div>

      <div class="summary-simple">
        <div class="summary-item income">Income<br>${formatCurrency(totalIncome.toString())}</div>
        <div class="summary-item expense">Expenses<br>${formatCurrency(Math.abs(totalExpenses).toString())}</div>
        <div class="summary-item ${netAmount >= 0 ? "net-positive" : "net-negative"}">Net<br>${formatCurrency(netAmount.toString())}</div>
        <div class="summary-item" style="color: #3b82f6;">Txns<br>${filteredTransactions.length}</div>
      </div>

      <table>
        <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Memo</th>
          <th>Amount</th>
          <th>Balance</th>
        </tr>
        </thead>
        <tbody> 
        ${filteredTransactions
          .map((transaction, index) => {
          const isIncome = transaction.amount >= 0;
          return `
          <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
            <td class="date-cell">${formatDateShort(transaction.createdAt || transaction.date)}</td>
            <td class="transaction-description">${transaction.description || transaction.memo || 'N/A'}</td>
            <td>
            <span class="category-tag">${transaction.category || 'Uncategorized'}</span>
            </td>
            <td style="color: #6b7280; font-size: 13px;">${transaction.memo || ''}</td>
            <td class="amount-cell ${isIncome ? "income" : "expense"}">
            ${isIncome ? "+" : ""}${formatCurrency(transaction.amount.toString())}
            </td>
            <td class="amount-cell balance-cell">
            ${formatCurrency((transaction.balance || 0).toString())}
            </td>
          </tr>
          `;
          })
          .join("")}
        </tbody>
      </table>

      <div class="footer">
        <p>📄 This report was automatically generated by the <a href="https://shsoftwares.com/cashbook-assist-new/">Cash Book Assist</a> app</p>
        <p>For support, contact your system administrator</p>
      </div>
      </body>
      </html>
    `;
  };

  const shareToPdf = async () => {
    try {
      setIsExporting(true);
      const htmlContent = generateHTMLContent();
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const fileName = `cashbook-report-${Date.now()}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Cash Book Report',
        });
      } else {
        Alert.alert('Success', `Report saved to: ${newUri}`);
      }
    } catch (error) {
      console.error('PDF Export Error:', error);
      Alert.alert('Export Error', 'Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const htmlContent = generateHTMLContent();

      // On Android, Print.printAsync will open the print dialog directly
      if (Platform.OS === 'android') {
        await Print.printAsync({ html: htmlContent });
      } else {
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save Cash Book Report',
          });
        } else {
          Alert.alert('Success', `Report saved to: ${uri}`);
        }
      }
    } catch (error) {
      console.error('PDF Export Error:', error);
      Alert.alert('Export Error', 'Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const shareToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Prepare data for Excel
      const excelData = filteredTransactions.map((transaction, index) => ({
        'Date': formatDateShort(transaction.createdAt || transaction.date),
        'Description': transaction.description || transaction.memo || 'N/A',
        'Category': transaction.category || 'Uncategorized',
        'Memo': transaction.memo || '',
        'Amount': transaction.amount,
        'Type': transaction.amount >= 0 ? 'Income' : 'Expense',
        'Running Balance': transaction.balance || 0,
      }));

      // Add summary data at the top
      const summaryData = [
        { 'Date': 'FINANCIAL SUMMARY', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Total Income', 'Description': formatCurrency(totalIncome.toString()), 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Total Expenses', 'Description': formatCurrency(Math.abs(totalExpenses).toString()), 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Net Amount', 'Description': formatCurrency(netAmount.toString()), 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Total Transactions', 'Description': filteredTransactions.length.toString(), 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': '', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'FILTERS APPLIED', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Date Range', 'Description': `${filters.startDate || 'All'} to ${filters.endDate || 'All'}`, 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Category', 'Description': filters.category || 'All Categories', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Type', 'Description': !filters.type || filters.type === "all" ? "All Types" : filters.type === "income" ? "Income Only" : "Expenses Only", 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': '', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'TRANSACTION DETAILS', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
      ];

      const finalData = [...summaryData, ...excelData];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(finalData);

      // Set column widths
      worksheet['!cols'] = [
        { width: 15 }, // Date
        { width: 30 }, // Description
        { width: 20 }, // Category
        { width: 25 }, // Memo
        { width: 15 }, // Amount
        { width: 12 }, // Type
        { width: 18 }, // Running Balance
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Cash Book Report");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      
      const fileName = `cashbook-report-${Date.now()}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Share Cash Book Report',
        });
      } else {
        Alert.alert('Success', `Report saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Excel Export Error:', error);
      Alert.alert('Export Error', 'Failed to export Excel file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      // Prepare data for Excel
      const excelData = filteredTransactions.map((transaction, index) => ({
        'Date': formatDateShort(transaction.createdAt || transaction.date),
        'Description': transaction.description || transaction.memo || 'N/A',
        'Category': transaction.category || 'Uncategorized',
        'Memo': transaction.memo || '',
        'Amount': transaction.amount,
        'Type': transaction.amount >= 0 ? 'Income' : 'Expense',
        'Running Balance': transaction.balance || 0,
      }));

      // Add summary data at the top
      const summaryData = [
        { 'Date': 'FINANCIAL SUMMARY', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Total Income', 'Description': formatCurrency(totalIncome.toString()), 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Total Expenses', 'Description': formatCurrency(Math.abs(totalExpenses).toString()), 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Net Amount', 'Description': formatCurrency(netAmount.toString()), 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Total Transactions', 'Description': filteredTransactions.length.toString(), 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': '', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'FILTERS APPLIED', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Date Range', 'Description': `${filters.startDate || 'All'} to ${filters.endDate || 'All'}`, 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Category', 'Description': filters.category || 'All Categories', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'Type', 'Description': !filters.type || filters.type === "all" ? "All Types" : filters.type === "income" ? "Income Only" : "Expenses Only", 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': '', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
        { 'Date': 'TRANSACTION DETAILS', 'Description': '', 'Category': '', 'Memo': '', 'Amount': '', 'Type': '', 'Running Balance': '' },
      ];

      const finalData = [...summaryData, ...excelData];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(finalData);

      // Set column widths
      worksheet['!cols'] = [
        { width: 15 }, // Date
        { width: 30 }, // Description
        { width: 20 }, // Category
        { width: 25 }, // Memo
        { width: 15 }, // Amount
        { width: 12 }, // Type
        { width: 18 }, // Running Balance
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Cash Book Report");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      const fileName = `cashbook-report-${Date.now()}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Save Cash Book Report',
        });
      } else {
        Alert.alert('Success', `Report saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Excel Export Error:', error);
      Alert.alert('Export Error', 'Failed to export Excel file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };



  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white dark:bg-[#1A1E4A] rounded-2xl p-6 w-full max-w-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <ThemedText className="text-xl font-bold text-gray-900 dark:text-white">
              Export Report
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
            >
              <Ionicons 
                name="close" 
                size={20} 
                color={theme === 'dark' ? 'white' : 'black'} 
              />
            </TouchableOpacity>
          </View>

          {/* Summary Info */}
          <View className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Export Summary
            </Text>
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {filteredTransactions.length} transactions
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              Net: {formatCurrency(netAmount.toString())}
            </Text>
          </View>

          {/* Export Options */}
            <View className="gap-3">
            <TouchableOpacity
              onPress={exportToPDF}
              disabled={isExporting}
              className="flex-row items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <View className="flex-row items-center">
              <View className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full items-center justify-center mr-3">
                <Ionicons name="document-text" size={20} color="#DC2626" />
              </View>
              <View>
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Download as PDF
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                Professional formatted report
                </Text>
              </View>
              </View>
              {isExporting && (
              <ActivityIndicator size="small" color="#DC2626" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={exportToExcel}
              disabled={isExporting}
              className="flex-row items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
            >
              <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full items-center justify-center mr-3">
                <Ionicons name="grid" size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Download as Excel
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                Spreadsheet for analysis
                </Text>
              </View>
              </View>
              {isExporting && (
              <ActivityIndicator size="small" color="#059669" />
              )}
            </TouchableOpacity>

            {Platform.OS !== 'ios' && (
              <>
              <TouchableOpacity
                onPress={shareToPdf}
                disabled={isExporting}
                className="flex-row items-center justify-between p-4 bg-red-50 dark:bg-red-600/20 border border-red-100 dark:border-red-800 rounded-xl"
              >
                <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full items-center justify-center mr-3">
                  <Ionicons name="document-text" size={20} color="#DC2626" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  Share as PDF
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-300">
                  Professional formatted report
                  </Text>
                </View>
                </View>
                {isExporting && (
                <ActivityIndicator size="small" color="#DC2626" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={shareToExcel}
                disabled={isExporting}
                className="flex-row items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
              >
                <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full items-center justify-center mr-3">
                  <Ionicons name="grid" size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  Share as Excel
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-300">
                  Spreadsheet for analysis
                  </Text>
                </View>
                </View>
                {isExporting && (
                <ActivityIndicator size="small" color="#059669" />
                )}
              </TouchableOpacity>
              </>
            )}
            </View>
          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl items-center"
          >
            <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
