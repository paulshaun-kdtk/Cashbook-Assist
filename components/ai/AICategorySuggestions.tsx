import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useAIService } from '../../hooks/useAIService';
import { CategorySuggestion } from '../../services/ai/GeminiAIService';
import { Category } from '../../types/category';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface AICategorySuggestionsProps {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categories: Category[];
  onCategorySelect: (category: string) => void;
  style?: object;
}

export const AICategorySuggestions: React.FC<AICategorySuggestionsProps> = ({
  description,
  amount,
  type,
  categories,
  onCategorySelect,
  style
}) => {
  const { suggestCategories, isLoading, error } = useAIService();
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const activeRequestRef = useRef<boolean>(false);

  const getSuggestions = useCallback(async () => {
    if (!description || amount <= 0) return;
    
    // Cancel any ongoing request
    activeRequestRef.current = false;
    
    // Mark new request as active
    activeRequestRef.current = true;
    
    try {
      const aiSuggestions = await suggestCategories(description, amount, type, categories);
      
      // Only update state if this request is still active (component hasn't changed)
      if (activeRequestRef.current) {
        setSuggestions(aiSuggestions);
        setShowSuggestions(aiSuggestions.length > 0);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      // Only update state if this request is still active
      if (activeRequestRef.current) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  }, [description, amount, type, categories, suggestCategories]);

  useEffect(() => {
    if (description && description.length > 3 && amount > 0) {
      getSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [description, amount, type, getSuggestions]);

  // Clear suggestions immediately when transaction type changes and cancel ongoing requests
  useEffect(() => {
    // Cancel any active requests
    activeRequestRef.current = false;
    
    // Clear suggestions
    setSuggestions([]);
    setShowSuggestions(false);
  }, [type]);

  const handleCategorySelect = (suggestion: CategorySuggestion) => {
    onCategorySelect(suggestion.name);
    setShowSuggestions(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981'; // Green
    if (confidence >= 0.6) return '#f59e0b'; // Yellow
    return '#6b7280'; // Gray
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (!showSuggestions && !isLoading) return null;

  return (
    <ThemedView style={[{
      marginTop: 8,
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#f8fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
    }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>
          🤖 AI Category Suggestions
        </Text>
        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color="#6366f1" 
            style={{ marginLeft: 8 }} 
          />
        )}
      </View>

      {error && (
        <ThemedText style={{ color: '#dc2626', fontSize: 12, marginBottom: 8 }}>
          Failed to get AI suggestions: {error}
        </ThemedText>
      )}

      {isLoading && suggestions.length === 0 && (
        <ThemedText style={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
          AI is analyzing your transaction...
        </ThemedText>
      )}

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCategorySelect(item)}
              style={{
                padding: 12,
                marginVertical: 4,
                backgroundColor: 'white',
                borderRadius: 6,
                borderLeftWidth: 4,
                borderLeftColor: getConfidenceColor(item.confidence),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {item.reason}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', marginLeft: 8 }}>
                  <Text style={{
                    fontSize: 10,
                    color: getConfidenceColor(item.confidence),
                    fontWeight: 'bold'
                  }}>
                    {getConfidenceText(item.confidence)}
                  </Text>
                  <Text style={{
                    fontSize: 9,
                    color: '#9ca3af'
                  }}>
                    {Math.round(item.confidence * 100)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}

      {!isLoading && suggestions.length === 0 && description.length > 3 && (
        <TouchableOpacity
          onPress={getSuggestions}
          style={{
            padding: 8,
            backgroundColor: '#6366f1',
            borderRadius: 4,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            Get AI Suggestions
          </Text>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};
