import {createAsyncThunk} from "@reduxjs/toolkit"
import { account } from "../appwrite/config";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
        await account.createEmailPasswordSession(email, password);
      const user = await account.get();
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
      console.error(`error checking session: ${error.message}`);
      return thunkAPI.rejectWithValue(null); // Return null if no session
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await account.deleteSession("current");
      return null; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
