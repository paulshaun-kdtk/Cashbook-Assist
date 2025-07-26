import { createSlice } from "@reduxjs/toolkit";
import { fetchExpensesThunk } from "../../thunks/expenses/fetch";
import { createExpenseThunk } from "../../thunks/expenses/post";
import { updateExpenseItemThunk } from "../../thunks/expenses/update";

const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    expenses: [],
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
      })
      .addCase(fetchExpensesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createExpenseThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createExpenseThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.push(action.payload);
      })
      .addCase(createExpenseThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateExpenseItemThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateExpenseItemThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.map((expense) => (expense.$id === action.payload.$id ? action.payload : expense));
      })
      .addCase(updateExpenseItemThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default expensesSlice.reducer;