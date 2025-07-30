import { createSelector } from "@reduxjs/toolkit";

// individual selectors
const selectIncome = (state) => state.income.income;
const selectExpenses = (state) => state.expenses.expenses;

export const selectDuplicates = createSelector(
  [
    selectIncome,
    selectExpenses,
  ],
  (
    income,
    expenses,
  ) => {
    const modules = [
      { data: income, module: "income" },
      { data: expenses, module: "expenses" },

    ];

    const duplicates = [];

    modules.forEach(({ data, module }) => {
      const hashMap = {};

      data.forEach((item) => {
        const hash = `${item.id_on_device}-${item.createdAt}-${item.income_source}`;
        if (!item.id_on_device || !item.createdAt) return;

        if (!hashMap[hash]) {
          hashMap[hash] = [];
        }

        hashMap[hash].push({ ...item, which_module: module });
      });

      Object.values(hashMap).forEach((items) => {
        if (items.length > 1) {
          items.forEach((item) => {
            duplicates.push({
              $id: item.$id,
              createdAt: item.createdAt,
              duplication_count: String(items.length),
              which_module: item.which_module,
              items: items,
            });
          });
        }
      });
    });
    return duplicates;
  }
);
