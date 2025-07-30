import { createAsyncThunk } from "@reduxjs/toolkit";
import { databases, query } from "../../../appwrite/config";

export const fetchExchangeRatesThunk = createAsyncThunk(
  "income_source/rates/fetch_entries",
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
          query.orderAsc("$createdAt"),
        ];

        if (lastDocumentId) {
          queries.push(query.cursorAfter(lastDocumentId));
        }

        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          "687c958e003b708c3fd0",
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

export const fetchLastExchangeRateThunk = createAsyncThunk(
  "income_source/rates/fetch_last_entry",
  async (which_key, { rejectWithValue }) => {
    try {
      const queries = [
        query.equal("which_key", which_key),
        query.limit(1),
        query.orderDesc("$createdAt"),
      ];

      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        "687c958e003b708c3fd0",
        queries,
      );
      return response.documents[0] || null;
    } catch (error) {
      return rejectWithValue(error.message || JSON.stringify(error));
    }
  },
);
