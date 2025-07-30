import { createSlice } from "@reduxjs/toolkit";
import { loginThunk, checkSessionThunk, logoutThunk } from "./authThunks";

function loadUserFromStorage() {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
}

const user = loadUserFromStorage();

const initialState = {
  user: user,
  loading: false,
  authenticated: !!user,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.authenticated = false;
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // loginThunk
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = true;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.authenticated = false;
        state.error = action.payload;
      })

      // checkSessionThunk
      .addCase(checkSessionThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.authenticated = true;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
        state.error = null;
      })
      .addCase(checkSessionThunk.rejected, (state) => {
        state.loading = false;
        state.authenticated = false;
        state.user = null;
        localStorage.removeItem("user");
      })

      // logoutThunk
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.authenticated = false;
        localStorage.removeItem("user");
        localStorage.removeItem("unique_id");
        state.error = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
