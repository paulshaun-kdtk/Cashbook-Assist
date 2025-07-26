import { clearAuth } from "@/redux/slices/auth/authSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import Storage from 'expo-sqlite/kv-store';
import { account } from "../../appwrite/config";

export const initAuth = () => async (dispatch) => {
  try {
    const authDataString = await Storage.getItem('auth');
    if (!authDataString) return;

    const authData = JSON.parse(authDataString);

    // If it looks like it's authenticated, verify it with Appwrite
    if (authData?.authenticated && authData?.user) {
      try {
        const currentUser = await account.get(); // Check Appwrite session
        dispatch({
          type: 'auth/restoreSession',
          payload: currentUser, // safer than trusting stale storage
        });
      } catch (error) {
        console.log('Invalid or expired session. Clearing stored auth.');
        await Storage.removeItem('auth');
        dispatch(clearAuth());
      }
    }
  } catch (error) {
    console.log('Error restoring auth:', error);
    dispatch(clearAuth());
  }
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password, username }, thunkAPI) => {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      // Save to Storage
      const authData = {
        user,
        unique_id: username,
        authenticated: true,
      };
      await Storage.setItem('auth', JSON.stringify(authData));

      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const checkSessionThunk = createAsyncThunk(
  "auth/checkSession",
  async (_, thunkAPI) => {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
        console.error(error)
      return thunkAPI.rejectWithValue(null); // Return null if no session
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await account.deleteSession("current");
      await Storage.removeItem('auth');
      return null;
    } catch (error) {
      console.error("Logout error:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
