// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { checkSessionThunk, loginThunk, logoutThunk } from "../../thunks/auth/authThunk";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
reducers: {
  clearAuth: (state) => {
    state.user = null;
    state.loading = false;
    state.error = null;
  },
  restoreSession: (state, action) => {
    state.user = action.payload;
    state.loading = false;
    state.error = null;
  }
},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkSessionThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { clearAuth } = authSlice.actions;

export default authSlice.reducer;