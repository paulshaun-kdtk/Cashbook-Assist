import { createSlice } from "@reduxjs/toolkit";
import { fetchCashbookThunk } from "../thunks/cashbooks/fetch";
import { createCashbookThunk } from "../thunks/cashbooks/post";

const cashbookSlice = createSlice({
  name: "cashbooks",
  initialState: {
    cashbooks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCashbookThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCashbookThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cashbooks = action.payload;
      })
      .addCase(fetchCashbookThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCashbookThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCashbookThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cashbooks.push(action.payload);
      })
      .addCase(createCashbookThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cashbookSlice.reducer;
