import { useCallback, useState } from 'react';
import { BudgetSuggestion, CategorySuggestion, ForecastData, geminiAIService, SpendingInsight } from '../services/ai/GeminiAIService';
import { Cashbook } from '../types/cashbook';
import { Category } from '../types/category';
import { Transaction } from '../types/transaction';

export const useAIService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const suggestCategories = useCallback(async (
    description: string,
    amount: number,
    type: 'income' | 'expense',
    existingCategories: Category[]
  ): Promise<CategorySuggestion[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const suggestions = await geminiAIService.suggestCategories(
        description,
        amount,
        type,
        existingCategories
      );
      return suggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get category suggestions';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateForecast = useCallback(async (
    transactions: Transaction[],
    cashbook: Cashbook,
    period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<ForecastData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const forecast = await geminiAIService.generateForecast(transactions, cashbook, period);
      return forecast;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate forecast';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeSpending = useCallback(async (
    transactions: Transaction[],
    categories: Category[]
  ): Promise<SpendingInsight[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const insights = await geminiAIService.analyzeSpendingPatterns(transactions, categories);
      return insights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze spending patterns';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateBudgetSuggestions = useCallback(async (
    transactions: Transaction[],
    categories: Category[]
  ): Promise<BudgetSuggestion[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const suggestions = await geminiAIService.generateBudgetSuggestions(transactions, categories);
      return suggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate budget suggestions';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateHealthReport = useCallback(async (
    transactions: Transaction[],
    cashbook: Cashbook,
    categories: Category[]
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const report = await geminiAIService.generateFinancialHealthReport(
        transactions,
        cashbook,
        categories
      );
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate health report';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    suggestCategories,
    generateForecast,
    analyzeSpending,
    generateBudgetSuggestions,
    generateHealthReport
  };
};
