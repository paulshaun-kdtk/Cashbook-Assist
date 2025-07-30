import { createSlice } from '@reduxjs/toolkit';

// Define initial state
const initialState = {
  forecast_result: null, 
  search_query: "",
};

// Create slice
const financialForecastSlice = createSlice({
  name: 'forecastResult',
  initialState,
  reducers: {
    setForecast(state, action) {
      state.forecast_result = action.payload;
    },
  },
});

// Export actions and reducer
export const { setForecast } = financialForecastSlice.actions;
export default financialForecastSlice.reducer;
