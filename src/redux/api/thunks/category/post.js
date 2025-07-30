import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases } from "@/redux/appwrite/config";
import { ID } from "appwrite";

export const createCategoryThunk = createAsyncThunk(
  "category/create_entry",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK, // database ID
        "6883676f0002f986a763", // collection ID
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

export const deleteCategoryThunk = createAsyncThunk(
  "category/delete_entry",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const response = await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK, // database ID
        "6883676f0002f986a763", // collection I/D
        documentId, // document ID
      );
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);
