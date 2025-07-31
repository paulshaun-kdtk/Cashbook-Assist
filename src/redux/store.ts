import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authSlice from './auth/authSlice';
import accountsSlice from './api/slices/accountsSlice';
import expensesSlice from './api/slices/expensesSlice';
import incomeSlice from './api/slices/incomeSlice';
import financialForecastSlice from './google/gemini/slices/forecastSlice';
import stockPromotionSlice from './google/gemini/slices/promotionsSlice';
import userSubSlice from './api/slices/usersubSlice';
import selectedSourceSlice from "./api/slices/selectedSourceSlice"
import exchangeRateSlice from "./api/slices/exchangeRateSlice"
import categoriesSlice from "./api/slices/categorySlice"
import cashbookSlice from "./api/slices/cashbookSlice";

const rootReducer = combineReducers({
  auth: authSlice,
  accounts: accountsSlice,
  income: incomeSlice,
  expenses: expensesSlice,
  financial_forecast: financialForecastSlice,
  stock_promotions: stockPromotionSlice,
  subscription: userSubSlice,
  rates: exchangeRateSlice,
  selectedSource: selectedSourceSlice,
  categories: categoriesSlice,
  cashbooks: cashbookSlice,
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
