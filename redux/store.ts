import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/auth/authSlice';
import cashbooksSlice from './slices/cashbooks/cashbookSlice';
import companiesSlice from './slices/companies/companySlice';
import expensesSlice from './slices/expenses/expensesSlice';
import incomeSlice from './slices/income/incomeSlice';

const rootReducer = combineReducers({
  auth: authSlice,
  companies: companiesSlice,
  cashbooks: cashbooksSlice,
  income: incomeSlice,
  expenses: expensesSlice
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;