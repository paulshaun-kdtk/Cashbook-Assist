import { createSlice } from "@reduxjs/toolkit";
import { fetchCompaniesThunk } from "../../thunks/companies/fetch";
import { createCompanyThunk } from "../../thunks/companies/post";


const companiesSlice = createSlice({
  name: "companies",
  initialState: {
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompaniesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompaniesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompaniesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCompanyThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCompanyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.push(action.payload);
      })
      .addCase(createCompanyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default companiesSlice.reducer;