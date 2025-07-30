import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases } from "@/redux/appwrite/config";

export const updateExpenseItemThunk = createAsyncThunk(
    "income_source/expense/update_entry",
    async ({ documentId, data }, { rejectWithValue }) => {
      try {
        const response = await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // database ID
          "677bf45a003343d557a0", // collection ID
          documentId, // document ID to update
          data,
        );
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return rejectWithValue(errorMessage);
      }
    },
  );


export const updateExpenseItemThunkCashbook = createAsyncThunk(
    "cashbook/expense/update_entry",
    async ({ documentId, data }, { rejectWithValue }) => {
      try {
        const response = await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK, // database ID
          "687f9b5800270d018abc", // collection ID
          documentId, // document ID to update
          data,
        );
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return rejectWithValue(errorMessage);
      }
    },
  );