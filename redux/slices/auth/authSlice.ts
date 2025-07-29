// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { checkSessionThunk, completeOAuthThunk, googleLoginThunk, loginThunk, logoutThunk, webToMobileAuthThunk } from "../../thunks/auth/authThunk";

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
      .addCase(googleLoginThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLoginThunk.fulfilled, (state, action) => {
        // OAuth flow started successfully - stop loading
        state.loading = false;
        state.error = null;
      })
      .addCase(googleLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeOAuthThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeOAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(completeOAuthThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(webToMobileAuthThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(webToMobileAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(webToMobileAuthThunk.rejected, (state, action) => {
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