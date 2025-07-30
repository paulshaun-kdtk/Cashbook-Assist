import { createSlice } from '@reduxjs/toolkit';

// Define initial state
const initialState = {
  selected_source: null, 
  search_query: "",
};

// Create slice
const selectedSourceSlice = createSlice({
  name: 'selectedSource',
  initialState,
  reducers: {
    setSelectedSource(state, action) {
      state.selected_source = action.payload;
    },
  },
});

// Export actions and reducer
export const { setSelectedSource } = selectedSourceSlice.actions;
export default selectedSourceSlice.reducer;
