import { createAsyncThunk } from "@reduxjs/toolkit";
import { ID } from "react-native-appwrite";
import { database } from "../../appwrite/config";
import { appwriteCreds } from "../../appwrite/credentials";

export const createIncomeThunk = createAsyncThunk(
  "cashbook/income/create_entry",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await database.createDocument(
        appwriteCreds.databaseId,
        appwriteCreds.income_collection_id, // collection ID
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

export const deleteExpenseThunk = createAsyncThunk(
  "cashbook/income/delete_entry",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const response = await database.deleteDocument(
        appwriteCreds.databaseId, // database ID
        appwriteCreds.income_collection_id, // collection ID
        documentId, // document ID
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);
