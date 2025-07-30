import { createSlice } from "@reduxjs/toolkit";
import { fetchIncomeThunk, fetchLastIncomeThunk, fetchIncomeThunkCashbook } from "../thunks/income/fetch";
import { createIncomeEntry } from "../thunks/income/post";
import { updateIncomeItemThunk } from "../thunks/income/update";


const incomeSlice = createSlice({
  name: "income",
  initialState: {
    income: [],
    last_entry: null,
    totalAnnualIncome: 0,
    quarterlyIncome: 0,
    previousQuarterIncome: 0,
    incomeGrowth: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIncomeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.income = action.payload;

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

        const annualIncome = action.payload.reduce((acc, item) => {
          const itemYear = new Date(item?.createdAt).getFullYear();
          if (itemYear === currentYear && !item.reversed) {
            return acc + item.amount;
          }
          return acc;
        }, 0);

        state.totalAnnualIncome = annualIncome;
        state.quarterlyIncome = currentTotal;
        state.previousQuarterIncome = previousTotal;
        state.incomeGrowth = growth;
      })
      .addCase(fetchIncomeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createIncomeEntry.pending, (state) => {
        state.loading = true;
      })
      .addCase(createIncomeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.income.push(action.payload);
      })
      .addCase(createIncomeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLastIncomeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLastIncomeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.last_entry = action.payload;
      })  
      .addCase(fetchLastIncomeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateIncomeItemThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateIncomeItemThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.income.findIndex((item) => item.$id === action.payload.$id);
        if (index !== -1) {
          state.income[index] = action.payload;
        }
      })
      .addCase(updateIncomeItemThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIncomeThunkCashbook.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIncomeThunkCashbook.fulfilled, (state, action) => {
        state.loading = false;
        state.income = action.payload;
      })
      .addCase(fetchIncomeThunkCashbook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default incomeSlice.reducer;
