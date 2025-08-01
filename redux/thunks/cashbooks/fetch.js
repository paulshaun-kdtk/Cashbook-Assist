import { createAsyncThunk } from "@reduxjs/toolkit";
import { sqliteService } from "../../../services/database/sqlite";
import { NetworkService } from "../../../services/network/NetworkService";
import { database, query } from "../../appwrite/config";
import { appwriteCreds } from "../../appwrite/credentials";

export const fetchCashbooksThunk = createAsyncThunk(
  "cashbooks/fetch_items/all",
  async (which_key, { rejectWithValue }) => {
    try {
      // Check if we're online
      const isOnline = NetworkService.isConnected();
      
      if (!isOnline) {
        // Fetch from local database
        const localCashbooks = await sqliteService.getCashbooks(which_key);
        return localCashbooks;
      }

      // Online: fetch from remote and sync to local
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
            appwriteCreds.cashbook_collection_id,
            queries,
        );

        lastBatchSize = response.documents.length;
        allDocuments.push(...response.documents);

        if (lastBatchSize > 0) {
          lastDocumentId = response.documents[lastBatchSize - 1].$id;
        }
      } while (lastBatchSize === limit);

      // Store in local database for offline access
      for (const cashbook of allDocuments) {
        await sqliteService.insertCashbook(cashbook);
      }
      
      await sqliteService.updateLastSync('cashbooks');

      return allDocuments;
    } catch (error) {
      // If online fetch fails, try to get local data as fallback
      try {
        const localCashbooks = await sqliteService.getCashbooks(which_key);
        if (localCashbooks.length > 0) {
          return localCashbooks;
        }
      } catch (localError) {
        console.error('Failed to fetch local cashbooks:', localError);
      }
      
      return rejectWithValue(error.message || JSON.stringify(error));
    }
  },
);