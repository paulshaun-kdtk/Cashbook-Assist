import { formatCurrency } from '@/assets/formatters/currency';
import { formatDateShortWords } from '@/assets/formatters/dates';
import { Cashbook } from '@/types/cashbook';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { ThemedText } from '../ThemedText';

interface CashbookExportModalProps {
  visible: boolean;
  onClose: () => void;
  cashbooks: Cashbook[];
  balances: { [key: string]: number };
  companyName: string;
  appliedFilters: {
    searchTerm: string;
    sortBy: string;
    sortOrder: string;
    balanceFilter: string;
  };
}

export default function CashbookExportModal({
  visible,
  onClose,
  cashbooks,
  balances,
  companyName,
  appliedFilters
}: CashbookExportModalProps) {
  const theme = useColorScheme();
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = () => {
    const headers = ['Cashbook Name', 'Current Balance', 'Date Created', 'Currency'];
    const rows = cashbooks.map(cashbook => [
      `"${cashbook.name}"`,
      formatCurrency(balances[cashbook.$id] || 0).toString().replace(',', ''), // Remove commas for CSV
      formatDateShortWords(cashbook.$createdAt),
      cashbook.currency || 'USD'
    ]);

    // Add summary row
    const totalBalance = Object.values(balances).reduce((sum, balance) => sum + balance, 0);
    rows.push(['', '', '', '']); // Empty row
    rows.push(['TOTAL', formatCurrency(totalBalance).toString().replace(',', ''), '', '']);

    // Add filter information
    rows.push(['', '', '', '']);
    rows.push(['FILTERS APPLIED:', '', '', '']);
    if (appliedFilters.searchTerm) {
      rows.push([`Search: "${appliedFilters.searchTerm}"`, '', '', '']);
    }
    rows.push([`Sort: ${appliedFilters.sortBy} (${appliedFilters.sortOrder})`, '', '', '']);
    rows.push([`Balance Filter: ${appliedFilters.balanceFilter}`, '', '', '']);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  const generateJSON = () => {
    const exportData = {
      company: companyName,
      exportDate: new Date().toISOString(),
      appliedFilters,
      summary: {
        totalCashbooks: cashbooks.length,
        totalBalance: Object.values(balances).reduce((sum, balance) => sum + balance, 0),
        positiveCashbooks: cashbooks.filter(cb => (balances[cb.$id] || 0) > 0).length,
        negativeCashbooks: cashbooks.filter(cb => (balances[cb.$id] || 0) < 0).length,
        zeroCashbooks: cashbooks.filter(cb => (balances[cb.$id] || 0) === 0).length,
      },
      cashbooks: cashbooks.map(cashbook => ({
        id: cashbook.$id,
        name: cashbook.name,
        description: cashbook.description,
        balance: balances[cashbook.$id] || 0,
        currency: cashbook.currency,
        currencySymbol: cashbook.currency_symbol,
        dateCreated: cashbook.$createdAt,
        lastUpdated: cashbook.$updatedAt,
      }))
    };

    return JSON.stringify(exportData, null, 2);
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `cashbooks-${companyName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${format}`;
      const fileUri = FileSystem.documentDirectory + fileName;

      let content: string;
      if (format === 'csv') {
        content = generateCSV();
      } else {
        content = generateJSON();
      }

      await FileSystem.writeAsStringAsync(fileUri, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/json',
          dialogTitle: `Export ${companyName} Cashbooks`
        });
      } else {
        Alert.alert(
          'Export Complete',
          `File saved to: ${fileUri}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        'There was an error exporting your data. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const ExportOption = ({ 
    title, 
    description, 
    icon, 
    onPress,
    format
  }: { 
    title: string; 
    description: string; 
    icon: string; 
    onPress: () => void;
    format: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isExporting}
      className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 ${
        isExporting ? 'opacity-50' : 'bg-gray-50 dark:bg-gray-800'
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={theme === 'dark' ? '#60A5FA' : '#2563EB'} 
        />
        <View className="ml-4 flex-1">
          <ThemedText className="text-base font-semibold">{title}</ThemedText>
          <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </ThemedText>
        </View>
        <ThemedText className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {format}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const totalBalance = Object.values(balances).reduce((sum, balance) => sum + balance, 0);
  const positiveCashbooks = cashbooks.filter(cb => (balances[cb.$id] || 0) > 0).length;
  const negativeCashbooks = cashbooks.filter(cb => (balances[cb.$id] || 0) < 0).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-[#0B0D2A]">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={onClose}>
            <Ionicons 
              name="close" 
              size={24} 
              color={theme === 'dark' ? 'white' : 'black'} 
            />
          </TouchableOpacity>
          <ThemedText className="text-lg font-bold">Export Cashbooks</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Summary */}
          <View className="bg-cyan-50 dark:bg-cyan-900/30 p-4 rounded-xl mb-6">
            <ThemedText className="text-lg font-bold mb-2">Export Summary</ThemedText>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <ThemedText className="text-gray-600 dark:text-gray-400">Company:</ThemedText>
                <ThemedText className="font-medium">{companyName}</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText className="text-gray-600 dark:text-gray-400">Total Cashbooks:</ThemedText>
                <ThemedText className="font-medium">{cashbooks.length}</ThemedText>
              </View>
              <View className="flex-row justify-between">
                <ThemedText className="text-gray-600 dark:text-gray-400">Combined Balance:</ThemedText>
                <Text className={`font-bold ${
                  totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(totalBalance).toString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <ThemedText className="text-gray-600 dark:text-gray-400">Positive/Negative:</ThemedText>
                <ThemedText className="font-medium">{positiveCashbooks}/{negativeCashbooks}</ThemedText>
              </View>
            </View>
          </View>

          {/* Applied Filters */}
          {(appliedFilters.searchTerm || appliedFilters.balanceFilter !== 'all') && (
            <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6">
              <ThemedText className="text-base font-bold mb-2">Applied Filters</ThemedText>
              {appliedFilters.searchTerm && (
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                  Search: &quot;{appliedFilters.searchTerm}&quot;
                </ThemedText>
              )}
              <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                Sort: {appliedFilters.sortBy} ({appliedFilters.sortOrder})
              </ThemedText>
              {appliedFilters.balanceFilter !== 'all' && (
                <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                  Balance: {appliedFilters.balanceFilter}
                </ThemedText>
              )}
            </View>
          )}

          {/* Export Options */}
          <View className="mb-6">
            <ThemedText className="text-lg font-bold mb-4">Export Format</ThemedText>
            
            <ExportOption
              title="CSV Spreadsheet"
              description="Compatible with Excel, Google Sheets, and other spreadsheet applications"
              icon="document-text-outline"
              format="CSV"
              onPress={() => exportData('csv')}
            />
            
            <ExportOption
              title="JSON Data"
              description="Structured data format with complete information including metadata"
              icon="code-outline"
              format="JSON"
              onPress={() => exportData('json')}
            />
          </View>

          {/* Disclaimer */}
          <View className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
            <View className="flex-row items-start">
              <Ionicons 
                name="information-circle-outline" 
                size={20} 
                color={theme === 'dark' ? '#FCD34D' : '#D97706'} 
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View className="flex-1">
                <ThemedText className="text-sm text-yellow-700 dark:text-yellow-300">
                  Exported data reflects current balances and applied filters. 
                  Transaction details are not included in cashbook exports.
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        {isExporting && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View className="bg-white dark:bg-gray-800 p-6 rounded-xl items-center">
              <ThemedText className="text-lg font-medium mb-2">Exporting...</ThemedText>
              <ThemedText className="text-gray-600 dark:text-gray-400">Preparing your data</ThemedText>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
