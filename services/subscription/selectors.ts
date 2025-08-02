import { RootState } from '@/redux/store';

export const getCounts = {
  companies: (state: RootState): number => {
    return state.companies?.companies?.length || 0;
  },

  cashbooks: (state: RootState): number => {
    return state.cashbooks?.cashbooks?.length || 0;
  },

  transactions: (state: RootState): number => {
    const incomeCount = state.income?.income?.length || 0;
    const expenseCount = state.expenses?.expenses?.length || 0;
    return incomeCount + expenseCount;
  }
};
