// redux/selectors/transactions.ts

import { RootState } from '@/redux/store';
import { Transaction } from '@/types/transaction';
import { createSelector } from '@reduxjs/toolkit';

export const selectCashbookBalances = createSelector(
  [(state: RootState) => state.income.income, (state: RootState) => state.expenses.expenses],
  (income, expenses) => {
    const totals: Record<string, number> = {};

    const allTransactions = [
      ...income.map((item: Transaction) => ({ ...item, amount: item.amount })),
      ...expenses.map((item: Transaction) => {
        const category = (item.category || '').toLowerCase();
        const isCOGS = category.includes('cost of goods') || category.includes('cost of sales');
        return isCOGS ? null : { ...item, amount: -Math.abs(item.amount) };
      }),
    ].filter(Boolean) as Transaction[];

    for (const tx of allTransactions) {
      const key = tx.which_cashbook;
      if (!totals[key]) totals[key] = 0;
      totals[key] += tx.amount;
    }

    return totals;
  }
);
