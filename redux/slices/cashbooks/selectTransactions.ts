import { RootState } from '@/redux/store';
import { Transaction } from '@/types/transaction';
import { createSelector } from '@reduxjs/toolkit';

export const selectTransactionsByCashbookId = (cashbookId: string | string[] | undefined) =>
  createSelector(
    [(state: RootState) => state.income.income, (state: RootState) => state.expenses.expenses],
    (income, expenses) => {
      const rawTransactions = [
        ...income
          .filter((item: Transaction) => !cashbookId || item.which_cashbook === cashbookId)
          .map((item: Transaction) => ({
            $id: item.$id,
            $sequence: item.$sequence,
            which_cashbook: item.which_cashbook,
            date: item.createdAt,
            description: item.description || 'Income',
            memo: item.memo || '',
            amount: item.amount,
            type: 'income',
            category: item.category || 'Income',
          })),
        ...expenses
          .filter((item: Transaction) => {
            const category = (item.category || '').toLowerCase().replace(/_/g, ' ');
            return (
              (!cashbookId || item.which_cashbook === cashbookId) &&
              !category.includes('cost of sales') &&
              !category.includes('cost of goods sold')
            );
          })
          .map((item: Transaction) => ({
            $id: item.$id,
            $sequence: item.$sequence,
            which_cashbook: item.which_cashbook,
            date: item.createdAt,
            description: item.description || 'Expense',
            memo: item.memo || '',
            amount: -Math.abs(item.amount),
            type: 'expense',
            category: item.category || 'Other',
          })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Running balance from all-time
      let runningBalance = 0;

      const allProcessed = rawTransactions.map((item) => {
        runningBalance += item.amount;
        return {
          ...item,
          balance: runningBalance,
          id: item.$sequence,
        };
      });

      const last50 = allProcessed.slice(-50);

      return {
        balance: runningBalance,
        transactions: last50,
        incomeBalance: income.reduce((acc, item: Transaction) => acc + item.amount, 0),
        expenseBalance: expenses.reduce((acc, item: Transaction) => acc + item.amount, 0),
      };
    }
  );
