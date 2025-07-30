import { createSlice } from "@reduxjs/toolkit";
import { confirmHasSubscriptionThunk } from "../thunks/users/subFetch";

const userSubSlice = createSlice({
  name: "subscription",
  initialState: {
    subscription: {},
    other_subscriptions: [],
    is_on_free_trial: false,
    time_remaining: 0,
    success: false,
    loading: false,
    error: null,
  }, 
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(confirmHasSubscriptionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmHasSubscriptionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload.subscription;
        state.other_subscriptions = action.payload.other_subscriptions;
        state.is_on_free_trial = action.payload.free_trial;
        state.success = action.payload.success;
        state.time_remaining = action.payload.time_remaining; 
      })
      .addCase(confirmHasSubscriptionThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export default userSubSlice.reducer;
