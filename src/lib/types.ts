export interface FinancialData {
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface Subscription {
  subscription_status: string;
  subscription_system: string;
  subscription_plan: string;
  platform: string;
}