import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases, query } from "../../../appwrite/config";

export const fetchIncomeThunk = createAsyncThunk(
  "income_source/income/fetch_entries",
  async (which_key, { rejectWithValue }) => {
    try {
      const allDocuments = [];
      let lastBatchSize;
      let lastDocumentId = null;
      const limit = 100;

      do {
        const queries = [
          query.equal("which_key", which_key),
          query.limit(limit),
          query.orderDesc("createdAt"),
        ];

        if (lastDocumentId) {
          queries.push(query.cursorAfter(lastDocumentId));
        }

        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          "677bea990027b89debbc",
          queries,
        );

        lastBatchSize = response.documents.length;
        allDocuments.push(...response.documents);

        if (lastBatchSize > 0) {
          lastDocumentId = response.documents[lastBatchSize - 1].$id;
        }
      } while (lastBatchSize === limit);

      return allDocuments;
    } catch (error) {
      return rejectWithValue(error.message || JSON.stringify(error));
    }
  },
);

export const fetchLastIncomeThunk = createAsyncThunk(
  "income_source/income/fetch_last_entry",
  async (which_key, { rejectWithValue }) => {
    try {
      const queries = [
        query.equal("which_key", which_key),
        query.limit(1),
        query.orderDesc("$createdAt"),
      ];

      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        "677bea990027b89debbc",
        queries,
      );
      return response.documents[0] || null;
    } catch (error) {
      return rejectWithValue(error.message || JSON.stringify(error));
    }
  },
);


export const fetchIncomeThunkCashbook = createAsyncThunk(
  "cashbook/income/fetch_entries",
  async (which_key, { rejectWithValue }) => {
    try {
      const allDocuments = [];
      let lastBatchSize;
      let lastDocumentId = null;
      const limit = 100;

      do {
        const queries = [
          query.equal("which_key", which_key),
          query.limit(limit),
          query.orderDesc("$createdAt"),
        ];

        if (lastDocumentId) {
          queries.push(query.cursorAfter(lastDocumentId));
        }

        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK,
          "687f8cd50025a58f0db0",
          queries,
        );

        lastBatchSize = response.documents.length;
        allDocuments.push(...response.documents);

        if (lastBatchSize > 0) {
          lastDocumentId = response.documents[lastBatchSize - 1].$id;
        }
      } while (lastBatchSize === limit);

      return allDocuments;
    } catch (error) {
      return rejectWithValue(error.message || JSON.stringify(error));
    }
  },
);

export const fetchLastIncomeThunkCashbook = createAsyncThunk(
  "cashbook/income/fetch_last_entry",
  async (which_key, { rejectWithValue }) => {
    try {
      const queries = [
        query.equal("which_key", which_key),
        query.limit(1),
        query.orderDesc("$createdAt"),
      ];

      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID_CASHBOOK,
        "687f8cd50025a58f0db0",
        queries,
      );
      return response.documents[0] || null;
    } catch (error) {
      return rejectWithValue(error.message || JSON.stringify(error));
    }
  },
);