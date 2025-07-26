import { createSlice } from "@reduxjs/toolkit";
import { fetchIncomeThunk } from "../../thunks/income/fetch";
import { createIncomeThunk } from "../../thunks/income/post";
import { updateIncomeItemThunk } from "../../thunks/income/update";

const incomeSlice = createSlice({
  name: "income",
  initialState: {
    income: [],
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
      })
      .addCase(fetchIncomeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createIncomeThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createIncomeThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.income.push(action.payload);
      })
      .addCase(createIncomeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateIncomeItemThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateIncomeItemThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.income = state.income.map((item) => (item.$id === action.payload.$id ? action.payload : item));
      })
      .addCase(updateIncomeItemThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default incomeSlice.reducer;