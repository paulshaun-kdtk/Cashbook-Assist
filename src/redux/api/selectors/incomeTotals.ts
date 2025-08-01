// selectors/incomeSelectors.js
import { Income } from "@/components/tables/income";
import { createSelector } from "@reduxjs/toolkit";

export const selectIncome = (state) => state.income.income;
export const selectSelectedSource = (state) => state.selectedSource.selected_source;

// Filtered income based on selectedSource
export const selectFilteredIncome = createSelector(
  [selectIncome, selectSelectedSource],
  (income, selectedSource) => {
    if (!selectedSource?.id_on_device) return income;
    return income.filter(item => item.income_source === selectedSource.id_on_device);
  }
);

// Compute derived totals based on filtered income
export const selectIncomeStats = createSelector(
  [selectFilteredIncome],
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
      totalAnnualIncome: annualIncome,
      quarterlyIncome: currentTotal,
      previousQuarterIncome: previousTotal,
      incomeGrowth: growth,
    };
  }
);


export const selectFilteredIncomeCashbook = createSelector(
  [selectIncome, selectSelectedSource],
  (income, selectedSource) => {
    if (!selectedSource?.$id) return income;
    return income.filter((item: Income) => item.which_cashbook === selectedSource.$id);
  }
);


export const selectIncomeStatsCashbook = createSelector(
  [selectFilteredIncomeCashbook],
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
      totalAnnualIncome: annualIncome,
      quarterlyIncome: currentTotal,
      previousQuarterIncome: previousTotal,
      incomeGrowth: growth,
    };
  }
);
