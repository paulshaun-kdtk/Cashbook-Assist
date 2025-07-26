import { createSlice } from "@reduxjs/toolkit";
import { fetchCashbooksThunk } from "../../thunks/cashbooks/fetch";
import { createCashbookThunk } from "../../thunks/cashbooks/post";

const cashbooksSlice = createSlice({
  name: "cashbooks",
  initialState: {
    cashbooks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCashbooksThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCashbooksThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cashbooks = action.payload;
      })
      .addCase(fetchCashbooksThunk.rejected, (state, action) => {
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

export default cashbooksSlice.reducer;