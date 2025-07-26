import { createAsyncThunk } from "@reduxjs/toolkit";
import { database, query } from "../../appwrite/config";
import { appwriteCreds } from "../../appwrite/credentials";

export const fetchCompaniesThunk = createAsyncThunk(
  "companies/fetch_items/all",
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

        const response = await database.listDocuments(
            appwriteCreds.databaseId,
            appwriteCreds.company_collection_id,
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