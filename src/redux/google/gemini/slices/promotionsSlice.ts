import { createSlice } from '@reduxjs/toolkit';

// Define initial state
const initialState = {
  promotion_result: null, 
  search_query: "",
};

// Create slice
const stockPromotionSlice = createSlice({
  name: 'promotionsResult',
  initialState,
  reducers: {
    setPromotions(state, action) {
      state.promotion_result = action.payload;
    },
  },
});

// Export actions and reducer
export const { setPromotions } = stockPromotionSlice.actions;
export default stockPromotionSlice.reducer;
