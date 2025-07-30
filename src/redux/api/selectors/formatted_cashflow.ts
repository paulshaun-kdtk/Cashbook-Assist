import { createSelector } from "@reduxjs/toolkit";
import { getWeekOfMonth } from "@/utils/formatters/date_formatter";

export const GroupedWeekMonthAnnualIncomeVsExpenses = createSelector(
  [
    (state) => state.income.income,
    (state) => state.expenses.expenses,
  ],
  (income, expenses) => {
    const groupedData = {};

    const processItems = (items, type) => {
      items.forEach((item) => {
        const date = new Date(item.createdAt);
        const year = date.getFullYear();
        const monthName = date.toLocaleString("default", { month: "long" });
        const week = `week${getWeekOfMonth(date)}`;

        if (!groupedData[year]) groupedData[year] = {};

        // Initialize month if not exists
        if (!groupedData[year][monthName]) {
          groupedData[year][monthName] = {
            totalIncome: 0,
            totalExpenses: 0,
            weeks: {},
          };
        }

        // Initialize week if not exists
        if (!groupedData[year][monthName].weeks[week]) {
          groupedData[year][monthName].weeks[week] = {
            income: 0,
            expenses: 0,
          };
        }

        // Add amounts to respective slots
        if (type === "income") {
          groupedData[year][monthName].totalIncome += item.amount;
          groupedData[year][monthName].weeks[week].income += item.amount;
        } else {
          groupedData[year][monthName].totalExpenses += item.amount;
          groupedData[year][monthName].weeks[week].expenses += item.amount;
        }
      });
    };

    processItems(income, "income");
    processItems(expenses, "expenses");

    return groupedData;
  }
);
