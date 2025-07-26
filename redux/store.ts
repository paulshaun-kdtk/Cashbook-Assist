import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/auth/authSlice';
import companiesSlice from './slices/companies/companySlice';

const rootReducer = combineReducers({
  auth: authSlice,
  companies: companiesSlice
});

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;