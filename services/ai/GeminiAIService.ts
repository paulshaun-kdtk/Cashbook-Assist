import { GoogleGenerativeAI } from '@google/generative-ai';
import { Cashbook } from '../../types/cashbook';
import { Category } from '../../types/category';
import { Transaction } from '../../types/transaction';

export interface CategorySuggestion {
  name: string;
  confidence: number;
  reason: string;
}

export interface ForecastData {
  period: 'monthly' | 'quarterly' | 'yearly';
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
  insights: string[];
  recommendations: string[];
}

export interface SpendingInsight {
  type: 'warning' | 'info' | 'positive';
  title: string;
  description: string;
  actionable: boolean;
  recommendation?: string;
}

export interface BudgetSuggestion {
  category: string;
  suggestedAmount: number;
  currentSpending: number;
  variance: number;
  reasoning: string;
}

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Suggest categories for a transaction based on description and amount
   */
  async suggestCategories(
    description: string, 
    amount: number, 
    type: 'income' | 'expense',
    existingCategories: Category[]
  ): Promise<CategorySuggestion[]> {
    try {
      const categoryNames = existingCategories.map(cat => cat.name).join(', ');
      
      const prompt = `
        As a financial AI assistant, suggest the most appropriate category for this transaction:
        
        Description: "${description}"
        Amount: $${amount}
        Type: ${type}
        
        Existing categories: ${categoryNames}
        
        Please suggest up to 3 categories from the existing list that best match this transaction.
        If no existing categories are perfect, suggest new category names.
        
        Respond in JSON format:
        {
          "suggestions": [
            {
              "name": "category_name",
              "confidence": 0.95,
              "reason": "explanation of why this category fits"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return parsed.suggestions || [];
      } catch {
        // Fallback if JSON parsing fails
        return this.fallbackCategorySuggestion(description, type, existingCategories);
      }
    } catch (error) {
      console.error('Error getting category suggestions:', error);
      return this.fallbackCategorySuggestion(description, type, existingCategories);
    }
  }

  /**
   * Generate financial forecast based on historical data
   */
  async generateForecast(
    transactions: Transaction[],
    cashbook: Cashbook,
    period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<ForecastData> {
    try {
      const recentTransactions = this.getRecentTransactions(transactions, period);
      const summary = this.summarizeTransactions(recentTransactions);
      
      const prompt = `
        As a financial forecasting AI, analyze this transaction data and provide predictions:
        
        Cashbook: ${cashbook.name} (${cashbook.currency})
        Period: ${period}
        
        Historical Data Summary:
        - Total Income: $${summary.totalIncome}
        - Total Expenses: $${summary.totalExpenses}
        - Net Cash Flow: $${summary.netCashFlow}
        - Transaction Count: ${summary.transactionCount}
        - Top Expense Categories: ${summary.topExpenseCategories.join(', ')}
        
        Recent Transactions (last 10):
        ${recentTransactions.slice(0, 10).map(t => `- ${t.description}: $${t.amount} (${t.type})`).join('\n')}
        
        Please provide a ${period} forecast with:
        1. Projected income and expenses
        2. Financial insights
        3. Actionable recommendations
        
        Respond in JSON format:
        {
          "projectedIncome": 0,
          "projectedExpenses": 0,
          "netCashFlow": 0,
          "insights": ["insight1", "insight2"],
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return {
          period,
          projectedIncome: parsed.projectedIncome || summary.totalIncome,
          projectedExpenses: parsed.projectedExpenses || summary.totalExpenses,
          netCashFlow: parsed.netCashFlow || summary.netCashFlow,
          insights: parsed.insights || [],
          recommendations: parsed.recommendations || []
        };
      } catch {
        return this.fallbackForecast(summary, period);
      }
    } catch (error) {
      console.error('Error generating forecast:', error);
      const summary = this.summarizeTransactions(transactions);
      return this.fallbackForecast(summary, period);
    }
  }

  /**
   * Analyze spending patterns and provide insights
   */
  async analyzeSpendingPatterns(
    transactions: Transaction[],
    categories: Category[]
  ): Promise<SpendingInsight[]> {
    try {
      const categoryMap = new Map(categories.map(cat => [cat.$id, cat.name]));
      const analysis = this.analyzeTransactionPatterns(transactions, categoryMap);
      
      const prompt = `
        As a personal finance AI advisor, analyze these spending patterns and provide insights:
        
        Spending Analysis:
        - Total Expenses: $${analysis.totalExpenses}
        - Average Daily Spending: $${analysis.avgDailySpending}
        - Most Expensive Category: ${analysis.topCategory}
        - Spending Trend: ${analysis.trend}
        
        Category Breakdown:
        ${Object.entries(analysis.categoryTotals).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}
        
        Please identify:
        1. Potential overspending areas
        2. Positive spending habits
        3. Areas for improvement
        4. Budget optimization opportunities
        
        Respond in JSON format:
        {
          "insights": [
            {
              "type": "warning|info|positive",
              "title": "insight title",
              "description": "detailed description",
              "actionable": true,
              "recommendation": "specific action to take"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return parsed.insights || [];
      } catch {
        return this.fallbackSpendingInsights(analysis);
      }
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      return [];
    }
  }

  /**
   * Generate budget suggestions based on spending history
   */
  async generateBudgetSuggestions(
    transactions: Transaction[],
    categories: Category[]
  ): Promise<BudgetSuggestion[]> {
    try {
      const categoryMap = new Map(categories.map(cat => [cat.$id, cat.name]));
      const monthlySpending = this.calculateMonthlySpending(transactions, categoryMap);
      
      const prompt = `
        As a budgeting AI expert, create budget suggestions based on spending history:
        
        Monthly Spending by Category:
        ${Object.entries(monthlySpending).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}
        
        Please suggest realistic budget amounts for each category considering:
        1. Historical spending patterns
        2. Potential for optimization
        3. Emergency fund allocation
        4. Savings goals
        
        Respond in JSON format:
        {
          "suggestions": [
            {
              "category": "category_name",
              "suggestedAmount": 0,
              "currentSpending": 0,
              "variance": 0,
              "reasoning": "explanation for the suggestion"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return parsed.suggestions || [];
      } catch {
        return this.fallbackBudgetSuggestions(monthlySpending);
      }
    } catch (error) {
      console.error('Error generating budget suggestions:', error);
      return [];
    }
  }

  /**
   * Generate a comprehensive financial health report
   */
  async generateFinancialHealthReport(
    transactions: Transaction[],
    cashbook: Cashbook,
    categories: Category[]
  ): Promise<{
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  }> {
    try {
      const analysis = this.calculateFinancialMetrics(transactions);
      
      const prompt = `
        As a financial health AI advisor, evaluate this financial profile:
        
        Financial Metrics:
        - Income/Expense Ratio: ${analysis.incomeExpenseRatio}
        - Savings Rate: ${analysis.savingsRate}%
        - Expense Variance: ${analysis.expenseVariance}
        - Transaction Frequency: ${analysis.transactionFrequency}
        - Emergency Fund Months: ${analysis.emergencyFundMonths}
        
        Cashbook: ${cashbook.name} (${cashbook.currency})
        Total Transactions: ${transactions.length}
        
        Provide a financial health assessment with:
        1. Overall score (0-100)
        2. Letter grade (A-F)
        3. Summary assessment
        4. Key strengths
        5. Areas needing improvement
        6. Specific recommendations
        
        Respond in JSON format:
        {
          "score": 0,
          "grade": "A",
          "summary": "overall assessment",
          "strengths": ["strength1", "strength2"],
          "improvements": ["area1", "area2"],
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        return {
          score: parsed.score || 70,
          grade: parsed.grade || 'C',
          summary: parsed.summary || 'Financial health assessment completed.',
          strengths: parsed.strengths || [],
          improvements: parsed.improvements || [],
          recommendations: parsed.recommendations || []
        };
      } catch {
        return this.fallbackHealthReport(analysis);
      }
    } catch (error) {
      console.error('Error generating financial health report:', error);
      return this.fallbackHealthReport({ incomeExpenseRatio: 1, savingsRate: 0, expenseVariance: 0, transactionFrequency: 0, emergencyFundMonths: 0 });
    }
  }

  // Utility methods
  private getRecentTransactions(transactions: Transaction[], period: string): Transaction[] {
    const days = period === 'monthly' ? 30 : period === 'quarterly' ? 90 : 365;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  }

  private summarizeTransactions(transactions: Transaction[]) {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryCount = new Map();
    expenses.forEach(t => {
      const count = categoryCount.get(t.category) || 0;
      categoryCount.set(t.category, count + 1);
    });
    
    const topExpenseCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
    
    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      topExpenseCategories
    };
  }

  private analyzeTransactionPatterns(transactions: Transaction[], categoryMap: Map<string, string>) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(t => {
      const categoryName = categoryMap.get(t.category) || 'Unknown';
      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + t.amount;
    });
    
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    
    const dailySpending = expenses.reduce((acc, t) => {
      const date = new Date(t.date).toDateString();
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });
    
    const avgDailySpending = Object.values(dailySpending).reduce((a, b) => a + b, 0) / Object.keys(dailySpending).length || 0;
    
    return {
      totalExpenses,
      avgDailySpending,
      topCategory,
      categoryTotals,
      trend: 'stable' // Simplified for now
    };
  }

  private calculateMonthlySpending(transactions: Transaction[], categoryMap: Map<string, string>) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentExpenses = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
    );
    
    const monthlySpending: { [key: string]: number } = {};
    recentExpenses.forEach(t => {
      const categoryName = categoryMap.get(t.category) || 'Unknown';
      monthlySpending[categoryName] = (monthlySpending[categoryName] || 0) + t.amount;
    });
    
    return monthlySpending;
  }

  private calculateFinancialMetrics(transactions: Transaction[]) {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      incomeExpenseRatio: totalIncome > 0 ? totalIncome / totalExpenses : 0,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      expenseVariance: 0, // Simplified
      transactionFrequency: transactions.length / 30, // Per day average
      emergencyFundMonths: 0 // Would need additional data
    };
  }

  // Fallback methods for when AI calls fail
  private fallbackCategorySuggestion(description: string, type: string, categories: Category[]): CategorySuggestion[] {
    const keywords = description.toLowerCase().split(' ');
    const suggestions: CategorySuggestion[] = [];
    
    categories.forEach(cat => {
      const categoryWords = cat.name.toLowerCase().split(' ');
      const matches = keywords.filter(word => categoryWords.some(catWord => catWord.includes(word)));
      
      if (matches.length > 0) {
        suggestions.push({
          name: cat.name,
          confidence: matches.length / keywords.length,
          reason: `Matched keywords: ${matches.join(', ')}`
        });
      }
    });
    
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  private fallbackForecast(summary: any, period: string): ForecastData {
    const multiplier = period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 12;
    
    return {
      period: period as any,
      projectedIncome: summary.totalIncome * multiplier,
      projectedExpenses: summary.totalExpenses * multiplier,
      netCashFlow: summary.netCashFlow * multiplier,
      insights: ['Historical trend analysis shows consistent spending patterns'],
      recommendations: ['Continue monitoring expenses', 'Consider setting up automated savings']
    };
  }

  private fallbackSpendingInsights(analysis: any): SpendingInsight[] {
    return [
      {
        type: 'info',
        title: 'Spending Summary',
        description: `Your total expenses are $${analysis.totalExpenses}`,
        actionable: false
      }
    ];
  }

  private fallbackBudgetSuggestions(monthlySpending: { [key: string]: number }): BudgetSuggestion[] {
    return Object.entries(monthlySpending).map(([category, amount]) => ({
      category,
      suggestedAmount: Math.round(amount * 0.9), // Suggest 10% reduction
      currentSpending: amount,
      variance: -amount * 0.1,
      reasoning: 'Based on historical spending with 10% optimization'
    }));
  }

  private fallbackHealthReport(metrics: any) {
    return {
      score: 70,
      grade: 'C' as const,
      summary: 'Your financial health is average with room for improvement.',
      strengths: ['Regular transaction tracking'],
      improvements: ['Increase savings rate', 'Optimize spending'],
      recommendations: ['Set up a budget', 'Track expenses more closely']
    };
  }
}

export const geminiAIService = new GeminiAIService();
