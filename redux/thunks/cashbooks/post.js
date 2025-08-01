import { createAsyncThunk } from "@reduxjs/toolkit";
import { ID } from "react-native-appwrite";
import { sqliteService } from "../../../services/database/sqlite";
import { NetworkService } from "../../../services/network/NetworkService";
import { database } from "../../appwrite/config";
import { appwriteCreds } from "../../appwrite/credentials";

export const createCashbookThunk = createAsyncThunk(
  "cashbook/create_entry",
  async ({ data }, { rejectWithValue }) => {
    try {
      const isOnline = NetworkService.isConnected();
      const newCashbook = {
        $id: ID.unique(),
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $sequence: Date.now().toString(),
        ...data
      };

      if (isOnline) {
        // Create in remote database
        const response = await database.createDocument(
          appwriteCreds.databaseId,
          appwriteCreds.cashbook_collection_id,
          newCashbook.$id,
          newCashbook,
        );
        
        // Store in local database
        await sqliteService.insertCashbook(response);
        return response;
      } else {
        // Store locally and queue for sync
        await sqliteService.insertCashbook(newCashbook);
        await sqliteService.addOfflineOperation(
          'create',
          'cashbooks',
          newCashbook.$id,
          newCashbook
        );
        
        return newCashbook;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteCashbookThunk = createAsyncThunk(
  "cashbook/delete_entry",
  async ({ documentId }, { rejectWithValue }) => {
    try {
      const isOnline = NetworkService.isConnected();

      if (isOnline) {
        // Delete from remote database
        const response = await database.deleteDocument(
          appwriteCreds.databaseId,
          appwriteCreds.cashbook_collection_id,
          documentId,
        );
        
        // Mark as deleted in local database
        await sqliteService.deleteCashbook(documentId);
        return response;
      } else {
        // Mark as deleted locally and queue for sync
        await sqliteService.deleteCashbook(documentId);
        await sqliteService.addOfflineOperation(
          'delete',
          'cashbooks',
          documentId
        );
        
        return { $id: documentId };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);
