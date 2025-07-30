import { createSlice } from "@reduxjs/toolkit";
import { fetchAccountsThunk, fetchCashbookAccountsThunk } from "../thunks/accounts/fetch";

const accountSlice = createSlice({
  name: "accounts",
  initialState: {
    accounts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccountsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCashbookAccountsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCashbookAccountsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchCashbookAccountsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default accountSlice.reducer;
