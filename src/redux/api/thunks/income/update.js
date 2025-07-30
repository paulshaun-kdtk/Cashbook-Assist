import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases } from "@/redux/appwrite/config";

export const updateIncomeItemThunk = createAsyncThunk(
    "income_source/income/update_entry",
    async ({ documentId, data }, { rejectWithValue }) => {
      try {
        const response = await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // database ID
          "677bea990027b89debbc", // collection ID
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

export const updateIncomeItemThunkCashbook = createAsyncThunk(
    "cashbook/income/update_entry",
    async ({ documentId, data }, { rejectWithValue }) => {
      try {
        const response = await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK, // database ID
          "687f8cd50025a58f0db0", // collection ID
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