import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases } from "@/redux/appwrite/config";
import { ID } from "appwrite";

export const createAccountEntry = createAsyncThunk(
  "income_source/account/create_entry",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // database ID
        "6793fadd0018b09a485e", // collection ID
        ID.unique(), // unique ID
        data,
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteAccountEntry = createAsyncThunk(
  "income_source/account/delete_entry",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const response = await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // database ID
        "6793fadd0018b09a485e", // collection ID
        documentId, // document ID
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const createAccountEntryCashbook = createAsyncThunk(
  "cashbook/account/create_entry",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK, // database ID
        "6881462a0014df352b12", // collection ID
        ID.unique(), // unique ID
        data,
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteAccountEntryCashbook = createAsyncThunk(
  "cashbook/account/delete_entry",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const response = await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK, // database ID
        "6881462a0014df352b12", // collection ID
        documentId, // document ID
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);