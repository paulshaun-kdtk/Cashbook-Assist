// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { checkSessionThunk, completeOAuthThunk, googleLoginThunk, loginThunk, logoutThunk, webToMobileAuthThunk } from "../../thunks/auth/authThunk";

interface AuthState {
  user: any | null;
  loading: boolean;
  error: any | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
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
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload as any)?.message || 'Login failed';
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
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload as any)?.message || 'Google login failed';
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
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload as any)?.message || 'OAuth completion failed';
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
        state.error = typeof action.payload === 'string' ? action.payload : (action.payload as any)?.message || 'Web authentication failed';
      })
      .addCase(checkSessionThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkSessionThunk.rejected, (state, action) => {
        // Handle different types of session check errors
        const payload = action.payload as any;
        
        if (payload?.error === 'network_error') {
          // Network error - don't clear user if they have valid stored auth
          // Store only the error message for display
          state.error = payload?.message || 'Network error occurred';
        } else {
          // Authentication error - clear user
          state.user = null;
          state.error = payload?.message || 'Authentication error occurred';
        }
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearAuth } = authSlice.actions;

export default authSlice.reducer;