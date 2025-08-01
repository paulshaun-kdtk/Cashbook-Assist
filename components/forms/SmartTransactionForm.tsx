import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Category } from '../../types/category';
import { ThemedView } from '../ThemedView';
import { AICategorySuggestions } from '../ai/AICategorySuggestions';

interface SmartTransactionFormProps {
  categories: Category[];
  onSubmit: (transaction: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    memo: string;
  }) => void;
  onCancel: () => void;
  style?: object;
}

export const SmartTransactionForm: React.FC<SmartTransactionFormProps> = ({
  categories,
  onSubmit,
  onCancel,
  style
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = () => {
    if (!description.trim() || !amount || !selectedCategory) {
      return;
    }

    onSubmit({
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category: selectedCategory,
      memo: memo.trim()
    });

    // Reset form
    setDescription('');
    setAmount('');
    setSelectedCategory('');
    setMemo('');
  };

  const handleCategorySelect = (categoryName: string) => {
    // Check if it's an existing category
    const existingCategory = categories.find(cat => cat.name === categoryName);
    if (existingCategory) {
      setSelectedCategory(existingCategory.$id);
    } else {
      // For new categories, we'd need to create them first
      // For now, just use the name
      setSelectedCategory(categoryName);
    }
  };

  const selectedCategoryName = selectedCategory 
    ? categories.find(cat => cat.$id === selectedCategory)?.name || selectedCategory
    : '';

  return (
    <ThemedView style={[{
      flex: 1,
      backgroundColor: '#f8fafc',
    }, style]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' }}>
            Smart Transaction
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
            AI will suggest categories as you type
          </Text>
        </View>

        {/* Transaction Type Toggle */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 4,
          marginBottom: 20,
        }}>
          <TouchableOpacity
            onPress={() => setType('expense')}
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: type === 'expense' ? '#ef4444' : 'transparent',
              borderRadius: 6,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: type === 'expense' ? 'white' : '#6b7280',
              fontWeight: 'bold',
            }}>
              💸 Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setType('income')}
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: type === 'income' ? '#10b981' : 'transparent',
              borderRadius: 6,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: type === 'income' ? 'white' : '#6b7280',
              fontWeight: 'bold',
            }}>
              💰 Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What was this transaction for?"
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: '#1f2937',
            }}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Amount Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
            Amount
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              padding: 12,
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1f2937',
            }}
          />
        </View>

        {/* AI Category Suggestions */}
        {description.length > 0 && amount && (
          <AICategorySuggestions
            description={description}
            amount={parseFloat(amount) || 0}
            type={type}
            categories={categories}
            onCategorySelect={handleCategorySelect}
          />
        )}

        {/* Selected Category Display */}
        {selectedCategoryName && (
          <View style={{
            backgroundColor: 'white',
            padding: 12,
            borderRadius: 8,
            marginTop: 16,
            borderWidth: 2,
            borderColor: '#10b981',
          }}>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
              Selected Category:
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10b981' }}>
              ✅ {selectedCategoryName}
            </Text>
          </View>
        )}

        {/* Manual Category Selection */}
        {!selectedCategory && categories.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
              Or choose manually:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.$id}
                  onPress={() => setSelectedCategory(category.$id)}
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Memo Input */}
        <View style={{ marginTop: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 }}>
            Notes (Optional)
          </Text>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="Additional notes..."
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: '#1f2937',
              minHeight: 60,
            }}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
      }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={onCancel}
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#6b7280' }}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!description.trim() || !amount || !selectedCategory}
            style={{
              flex: 2,
              paddingVertical: 12,
              backgroundColor: (!description.trim() || !amount || !selectedCategory) 
                ? '#d1d5db' 
                : '#6366f1',
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: (!description.trim() || !amount || !selectedCategory) 
                ? '#9ca3af' 
                : 'white'
            }}>
              Add Transaction
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
};
