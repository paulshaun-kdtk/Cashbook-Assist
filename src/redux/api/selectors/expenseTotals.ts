import { Expense } from "@/components/tables/expenses";
import { createSelector } from "@reduxjs/toolkit";

// Base selectors
export const selectExpenses = (state) => state.expenses.expenses;
export const selectSelectedSource = (state) => state.selectedSource.selected_source;

// Filtered expenses based on selected source
export const selectFilteredExpenses = createSelector(
  [selectExpenses, selectSelectedSource],
  (expenses, selectedSource) => {
    if (!selectedSource) return expenses;
    return expenses.filter(item => item.income_source === selectedSource.id_on_device) ?? [];
  }
);

// Derived expenditure statistics
export const selectExpenditureStats = createSelector(
  [selectFilteredExpenses],
  (filteredExpenses) => {
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor((currentMonth + 3) / 3);
    const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const currentYear = new Date().getFullYear();

    let currentTotal = 0;
    let previousTotal = 0;
    let annualExpenditure = 0;

    filteredExpenses.forEach((item) => {
      const itemDate = new Date(item?.createdAt);
      const itemQuarter = Math.floor((itemDate.getMonth() + 3) / 3);
      const itemYear = itemDate.getFullYear();

      if (!item.reversed) {
        if (itemYear === currentYear) annualExpenditure += item.amount;
        if (itemQuarter === currentQuarter) currentTotal += item.amount;
        if (itemQuarter === previousQuarter) previousTotal += item.amount;
      }
    });

    const growth = previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100;

    return {
      totalAnnualExpenditure: annualExpenditure,
      quarterlyExpenditure: currentTotal,
      previousQuarterExpenditure: previousTotal,
      expenditureGrowth: growth,
    };
  }
);

 // cashbook

export const selectFilteredExpensesCashbook = createSelector(
  [selectExpenses, selectSelectedSource],
  (income, selectedSource) => {
    if (!selectedSource?.$id) return income;
    return income.filter((item: Expense) => item.which_cashbook === selectedSource.$id);
  }
);


export const selectExpenditureStatsCashbook = createSelector(
  [selectFilteredExpensesCashbook],
  (filteredIncome) => {
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor((currentMonth + 3) / 3);
    const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const currentYear = new Date().getFullYear();

    let currentTotal = 0;
    let previousTotal = 0;
    let annualIncome = 0;

    filteredIncome.forEach((item) => {
      const itemDate = new Date(item?.createdAt);
      const itemQuarter = Math.floor((itemDate.getMonth() + 3) / 3);
      const itemYear = itemDate.getFullYear();

      if (!item.reversed) {
        if (itemYear === currentYear) annualIncome += item.amount;
        if (itemQuarter === currentQuarter) currentTotal += item.amount;
        if (itemQuarter === previousQuarter) previousTotal += item.amount;
      }
    });

    const growth = previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100;

    return {
      totalAnnualExpenditure: annualIncome,
      quarterlyExpenditure: currentTotal,
      previousQuarterExpenditure: previousTotal,
      expenditureGrowth: growth,
    };
  }
);
