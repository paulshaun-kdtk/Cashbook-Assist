import { createSlice } from "@reduxjs/toolkit";
import { fetchExpensesThunk, fetchExpensesThunkCashbook } from "../thunks/expenses/fetch";
import { createExpenseEntry } from "../thunks/expenses/post";
import { fetchLastExpense } from "../thunks/expenses/fetch";
import { updateExpenseItemThunk } from "../thunks/expenses/update";

const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    expenses: [],
    last_entry: null,
    totalAnnualExpenditure: 0,
    quarterlyExpenditure: 0,
    previousQuarterExpenditure: 0,
    expenditureGrowth: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpensesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpensesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;

        const currentMonth = new Date().getMonth();
        const currentQuarter = Math.floor((currentMonth + 3) / 3);
        const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;

        let currentTotal = 0;
        let previousTotal = 0;

        action.payload.forEach((item) => {
          const itemQuarter = Math.floor((new Date(item?.createdAt).getMonth() + 3) / 3);
          if (itemQuarter === currentQuarter && !item.reversed) {
            currentTotal += item.amount;
          } else if (itemQuarter === previousQuarter && !item.reversed) {
            previousTotal += item.amount;
          }
        });

        const growth = previousTotal === 0 ? 0 : ((currentTotal - previousTotal) / previousTotal) * 100;

        const currentYear = new Date().getFullYear();

        const annualExpenditure = action.payload.reduce((acc, item) => {
          const itemYear = new Date(item?.createdAt).getFullYear();
          if (itemYear === currentYear && !item.reversed) {
            return acc + item.amount;
          }
          return acc;
        }
        , 0);
        
        state.totalAnnualExpenditure = annualExpenditure;
        state.quarterlyExpenditure = currentTotal;
        state.previousQuarterExpenditure = previousTotal;
        state.expenditureGrowth = growth;
      })
      .addCase(fetchExpensesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createExpenseEntry.pending, (state) => {
        state.loading = true;
      })
      .addCase(createExpenseEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.push(action.payload);
      })
      .addCase(createExpenseEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLastExpense.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLastExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.last_entry = action.payload;
      })
      .addCase(fetchLastExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateExpenseItemThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateExpenseItemThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex((item) => item.$id === action.payload.$id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(updateExpenseItemThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExpensesThunkCashbook.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpensesThunkCashbook.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpensesThunkCashbook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default expensesSlice.reducer;
