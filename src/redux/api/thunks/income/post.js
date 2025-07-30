import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases } from "@/redux/appwrite/config";
import { ID } from "appwrite";

export const createIncomeEntry = createAsyncThunk(
  "income_source/income/create_entry",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // database ID
        "677bea990027b89debbc", // collection ID
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

export const deleteIncomeEntry = createAsyncThunk(
  "income_source/income/delete_entry",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const response = await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // database ID
        "677bea990027b89debbc", // collection ID
        documentId, // document ID
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

// cashbook

export const createIncomeEntryCashbook = createAsyncThunk(
  "cashbook/income/create_entry",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK, // database ID
        "687f8cd50025a58f0db0", // collection ID
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

export const deleteIncomeEntryCashbook = createAsyncThunk(
  "income_source/income/delete_entry",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const response = await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK, // database ID
        "687f8cd50025a58f0db0", // collection ID
        documentId, // document ID
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);