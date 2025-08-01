import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAIService } from '../../hooks/useAIService';
import { BudgetSuggestion, ForecastData, SpendingInsight } from '../../services/ai/GeminiAIService';
import { Cashbook } from '../../types/cashbook';
import { Category } from '../../types/category';
import { Transaction } from '../../types/transaction';
import { ThemedView } from '../ThemedView';

interface AIReportsProps {
  transactions: Transaction[];
  categories: Category[];
  cashbook: Cashbook;
  style?: object;
}

type ReportType = 'forecast' | 'insights' | 'budget' | 'health';

export const AIReports: React.FC<AIReportsProps> = ({
  transactions,
  categories,
  cashbook,
  style
}) => {
  const { 
    generateForecast, 
    analyzeSpending, 
    generateBudgetSuggestions, 
    generateHealthReport,
    error 
  } = useAIService();

  const [activeReport, setActiveReport] = useState<ReportType>('forecast');
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [spendingInsights, setSpendingInsights] = useState<SpendingInsight[]>([]);
  const [budgetSuggestions, setBudgetSuggestions] = useState<BudgetSuggestion[]>([]);
  const [healthReport, setHealthReport] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadReportData = useCallback(async () => {
    if (transactions.length === 0) return;

    switch (activeReport) {
      case 'forecast':
        if (!forecastData) {
          const forecast = await generateForecast(transactions, cashbook, 'monthly');
          setForecastData(forecast);
        }
        break;
      case 'insights':
        if (spendingInsights.length === 0) {
          const insights = await analyzeSpending(transactions, categories);
          setSpendingInsights(insights);
        }
        break;
      case 'budget':
        if (budgetSuggestions.length === 0) {
          const suggestions = await generateBudgetSuggestions(transactions, categories);
          setBudgetSuggestions(suggestions);
        }
        break;
      case 'health':
        if (!healthReport) {
          const report = await generateHealthReport(transactions, cashbook, categories);
          setHealthReport(report);
        }
        break;
    }
  }, [activeReport, transactions, categories, cashbook, generateForecast, analyzeSpending, generateBudgetSuggestions, generateHealthReport, forecastData, spendingInsights, budgetSuggestions, healthReport]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Clear existing data
    setForecastData(null);
    setSpendingInsights([]);
    setBudgetSuggestions([]);
    setHealthReport(null);
    
    await loadReportData();
    setRefreshing(false);
  };

  const renderTabBar = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#f8fafc',
      borderRadius: 8,
      padding: 4,
      marginBottom: 16,
    }}>
      {[
        { key: 'forecast', label: '📈 Forecast', icon: '📈' },
        { key: 'insights', label: '💡 Insights', icon: '💡' },
        { key: 'budget', label: '💰 Budget', icon: '💰' },
        { key: 'health', label: '📊 Health', icon: '📊' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveReport(tab.key as ReportType)}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 4,
            backgroundColor: activeReport === tab.key ? '#6366f1' : 'transparent',
            borderRadius: 6,
            alignItems: 'center',
          }}
        >
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: activeReport === tab.key ? 'white' : '#6b7280',
            textAlign: 'center',
          }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderForecastReport = () => {
    if (!forecastData) return <LoadingState />;

    return (
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' }}>
          📈 Financial Forecast
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ backgroundColor: '#10b981', padding: 12, borderRadius: 8 }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Projected Income</Text>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                {cashbook.currency_symbol}{forecastData.projectedIncome.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <View style={{ backgroundColor: '#ef4444', padding: 12, borderRadius: 8 }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Projected Expenses</Text>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                {cashbook.currency_symbol}{forecastData.projectedExpenses.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: forecastData.netCashFlow >= 0 ? '#10b981' : '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>
            Net Cash Flow: {cashbook.currency_symbol}{forecastData.netCashFlow.toFixed(2)}
          </Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
          💡 Key Insights
        </Text>
        {forecastData.insights.map((insight, index) => (
          <Text key={index} style={{ fontSize: 14, color: '#6b7280', marginBottom: 4, lineHeight: 20 }}>
            • {insight}
          </Text>
        ))}

        <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#1f2937' }}>
          🎯 Recommendations
        </Text>
        {forecastData.recommendations.map((rec, index) => (
          <Text key={index} style={{ fontSize: 14, color: '#6b7280', marginBottom: 4, lineHeight: 20 }}>
            • {rec}
          </Text>
        ))}
      </View>
    );
  };

  const renderInsightsReport = () => {
    if (spendingInsights.length === 0) return <LoadingState />;

    return (
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' }}>
          💡 Spending Insights
        </Text>
        
        {spendingInsights.map((insight, index) => (
          <View key={index} style={{
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor: insight.type === 'warning' ? '#ef4444' : insight.type === 'positive' ? '#10b981' : '#6366f1',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#1f2937' }}>
              {insight.title}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, lineHeight: 20 }}>
              {insight.description}
            </Text>
            {insight.recommendation && (
              <Text style={{ fontSize: 12, color: '#6366f1', fontStyle: 'italic' }}>
                💡 {insight.recommendation}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderBudgetReport = () => {
    if (budgetSuggestions.length === 0) return <LoadingState />;

    return (
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' }}>
          💰 Budget Suggestions
        </Text>
        
        {budgetSuggestions.map((suggestion, index) => (
          <View key={index} style={{
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>
                {suggestion.category}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: 'bold',
                color: suggestion.variance >= 0 ? '#10b981' : '#ef4444'
              }}>
                {suggestion.variance >= 0 ? '+' : ''}{cashbook.currency_symbol}{suggestion.variance.toFixed(2)}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                Current: {cashbook.currency_symbol}{suggestion.currentSpending.toFixed(2)}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                Suggested: {cashbook.currency_symbol}{suggestion.suggestedAmount.toFixed(2)}
              </Text>
            </View>
            
            <Text style={{ fontSize: 12, color: '#6366f1', fontStyle: 'italic' }}>
              {suggestion.reasoning}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderHealthReport = () => {
    if (!healthReport) return <LoadingState />;

    const getGradeColor = (grade: string) => {
      switch (grade) {
        case 'A': return '#10b981';
        case 'B': return '#84cc16';
        case 'C': return '#f59e0b';
        case 'D': return '#f97316';
        case 'F': return '#ef4444';
        default: return '#6b7280';
      }
    };

    return (
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' }}>
          📊 Financial Health Report
        </Text>
        
        <View style={{ 
          backgroundColor: getGradeColor(healthReport.grade), 
          padding: 20, 
          borderRadius: 12, 
          alignItems: 'center',
          marginBottom: 20 
        }}>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>
            {healthReport.grade}
          </Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Score: {healthReport.score}/100
          </Text>
        </View>

        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20, textAlign: 'center' }}>
          {healthReport.summary}
        </Text>

        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#10b981' }}>
          ✅ Strengths
        </Text>
        {healthReport.strengths.map((strength: string, index: number) => (
          <Text key={index} style={{ fontSize: 14, color: '#6b7280', marginBottom: 4, lineHeight: 20 }}>
            • {strength}
          </Text>
        ))}

        <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#f59e0b' }}>
          ⚠️ Areas for Improvement
        </Text>
        {healthReport.improvements.map((improvement: string, index: number) => (
          <Text key={index} style={{ fontSize: 14, color: '#6b7280', marginBottom: 4, lineHeight: 20 }}>
            • {improvement}
          </Text>
        ))}

        <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#6366f1' }}>
          🎯 Recommendations
        </Text>
        {healthReport.recommendations.map((rec: string, index: number) => (
          <Text key={index} style={{ fontSize: 14, color: '#6b7280', marginBottom: 4, lineHeight: 20 }}>
            • {rec}
          </Text>
        ))}
      </View>
    );
  };

  const LoadingState = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
        AI is analyzing your data...
      </Text>
    </View>
  );

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'forecast': return renderForecastReport();
      case 'insights': return renderInsightsReport();
      case 'budget': return renderBudgetReport();
      case 'health': return renderHealthReport();
      default: return <LoadingState />;
    }
  };

  if (transactions.length === 0) {
    return (
      <ThemedView style={[{ padding: 20, alignItems: 'center' }, style]}>
        <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center' }}>
          📊 No transaction data available for AI analysis.
          Add some transactions to get AI-powered insights!
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[{ flex: 1, padding: 16 }, style]}>
      {renderTabBar()}
      
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={{ 
            backgroundColor: '#fef2f2', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#fecaca'
          }}>
            <Text style={{ color: '#dc2626', fontSize: 14 }}>
              ❌ AI Analysis Error: {error}
            </Text>
          </View>
        )}
        
        {renderActiveReport()}
      </ScrollView>
    </ThemedView>
  );
};
