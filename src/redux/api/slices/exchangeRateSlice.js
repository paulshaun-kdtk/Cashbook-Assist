import { createSlice } from "@reduxjs/toolkit";
import { fetchExchangeRatesThunk } from "../thunks/exchangerates/fetch";
import { createExchangeRateThunk } from "../thunks/exchangerates/post";


const exchangeRateSlice = createSlice({
  name: "rates",
  initialState: {
    rates: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRatesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExchangeRatesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload;
      })
      .addCase(fetchExchangeRatesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })
      .addCase(createExchangeRateThunk.pending,  (state) => {
        state.loading = true  
      })
      .addCase(createExchangeRateThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.rates.push(action.payload)
      })
      .addCase(createExchangeRateThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })
  },
});

export default exchangeRateSlice.reducer;
