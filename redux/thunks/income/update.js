import { createAsyncThunk } from "@reduxjs/toolkit";
import { database } from "../../appwrite/config";
import { appwriteCreds } from "../../appwrite/credentials";

export const updateIncomeItemThunk = createAsyncThunk(
    "cashbook/income/update_entry",
    async ({ documentId, data }, { rejectWithValue }) => {
      try {
        const response = await database.updateDocument(
          appwriteCreds.databaseId,
          appwriteCreds.income_collection_id,// collection ID
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