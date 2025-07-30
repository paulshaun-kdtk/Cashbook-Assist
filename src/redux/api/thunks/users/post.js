import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases } from "@/redux/appwrite/config";
import { ID } from "appwrite";

export const createUserEntry = createAsyncThunk(
  "company/user/create_entry",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // database ID
        "6772a8a7003524b8cce5", // collection ID
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

export const deleteUserEntry = createAsyncThunk(
  "company/user/delete_entry",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const response = await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, // database ID
        "6772a8a7003524b8cce5", // collection ID
        documentId, // document ID
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);