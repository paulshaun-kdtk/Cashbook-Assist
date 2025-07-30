import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases, query } from "../../../appwrite/config";

export const fetchAccountsThunk = createAsyncThunk(
  "accounts/fetch_items",
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
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          "6793fadd0018b09a485e",
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


export const fetchLastAccountEntry = createAsyncThunk(
  "income_source/account/fetch_last_entry",
  async (which_key, { rejectWithValue }) => {
    try {
      const queries = [
        query.equal("which_key", which_key),
        query.limit(1),
        query.orderDesc("$createdAt"),
      ];

      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        "6793fadd0018b09a485e",
        queries,
      );
      return response.documents[0] || null;
    } catch (error) {
      return rejectWithValue(error.message || JSON.stringify(error));
    }
  },
);

export const fetchCashbookAccountsThunk = createAsyncThunk(
  "cashbook/accounts/fetch_items/all",
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
          "6881462a0014df352b12",
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
