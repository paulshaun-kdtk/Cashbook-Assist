import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAIService } from '../../hooks/useAIService';
import { SpendingInsight } from '../../services/ai/GeminiAIService';
import { Cashbook } from '../../types/cashbook';
import { Category } from '../../types/category';
import { Transaction } from '../../types/transaction';
import { ThemedView } from '../ThemedView';

interface AIInsightCardProps {
  transactions: Transaction[];
  categories: Category[];
  cashbook: Cashbook;
  onViewAllReports?: () => void;
  style?: object;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  transactions,
  categories,
  cashbook,
  onViewAllReports,
  style
}) => {
  const { analyzeSpending, isLoading, error } = useAIService();
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [showInsight, setShowInsight] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    if (transactions.length === 0) {
      console.log('AIInsightCard: No transactions available');
      return;
    }
    
    console.log('AIInsightCard: Loading insights for', transactions.length, 'transactions and', categories.length, 'categories');
    
    try {
      const aiInsights = await analyzeSpending(transactions, categories);
      console.log('AIInsightCard: Got insights:', aiInsights);
      setInsights(aiInsights);
      setShowInsight(aiInsights.length > 0);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to load insights');
    }
  }, [analyzeSpending, transactions, categories]);

  useEffect(() => {
    if (transactions.length > 0) {
      loadInsights();
    }
  }, [transactions, categories, loadInsights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'positive': return '✅';
      default: return '💡';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return '#ef4444';
      case 'positive': return '#10b981';
      default: return '#6366f1';
    }
  };

  if (transactions.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <ThemedView style={[{
        padding: 16,
        margin: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
      }, style]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color="#6366f1" style={{ marginRight: 8 }} />
          <Text style={{ color: '#6b7280', fontSize: 14 }}>
            AI is analyzing your spending...
          </Text>
        </View>
      </ThemedView>
    );
  }

  if (error || localError || !showInsight || insights.length === 0) {
    const errorMessage = error || localError;
    return (
      <ThemedView style={[{
        padding: 16,
        margin: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
      }, style]}>
        <TouchableOpacity onPress={loadInsights}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>🤖</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 }}>
              {errorMessage ? 'AI Insights Error' : 'Get AI Insights'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
              {errorMessage || 'Tap to analyze your spending patterns'}
            </Text>
          </View>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Show the first (most important) insight
  const primaryInsight = insights[0];

  return (
    <ThemedView style={[{
      margin: 16,
      borderRadius: 12,
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    }, style]}>
      {/* Header */}
      <View style={{
        backgroundColor: getInsightColor(primaryInsight.type),
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>
            {getInsightIcon(primaryInsight.type)}
          </Text>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', flex: 1 }}>
            AI Insight
          </Text>
        </View>
        {insights.length > 1 && (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              +{insights.length - 1} more
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: 8,
        }}>
          {primaryInsight.title}
        </Text>
        
        <Text style={{
          fontSize: 14,
          color: '#6b7280',
          lineHeight: 20,
          marginBottom: 12,
        }}>
          {primaryInsight.description}
        </Text>

        {primaryInsight.recommendation && (
          <View style={{
            backgroundColor: '#f0f9ff',
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: '#0ea5e9',
            marginBottom: 12,
          }}>
            <Text style={{
              fontSize: 12,
              color: '#0369a1',
              fontWeight: '600',
            }}>
              💡 Recommendation: {primaryInsight.recommendation}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={loadInsights}
            style={{
              backgroundColor: '#f3f4f6',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6,
              flex: 1,
              marginRight: 8,
            }}
          >
            <Text style={{
              color: '#6b7280',
              fontSize: 12,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              Refresh
            </Text>
          </TouchableOpacity>

          {onViewAllReports && (
            <TouchableOpacity
              onPress={onViewAllReports}
              style={{
                backgroundColor: '#6366f1',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
                flex: 1,
                marginLeft: 8,
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
                View All Reports
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ThemedView>
  );
};
