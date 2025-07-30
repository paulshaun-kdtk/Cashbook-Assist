import { createAsyncThunk } from '@reduxjs/toolkit';
import { appwriteCreds } from '@/redux/appwrite/appwriteCreds';

export const confirmRemoteUserThunk = createAsyncThunk(
  'subscription/confirmRemoteUser',
  async (email: string, { rejectWithValue }) => {
    try {
      const queries = [
        { method: "equal", attribute: "email", values: [email] },
        { method: "limit", values: [1] },
      ];

      const queryString = queries
        .map((q, i) => `queries[${i}]=${encodeURIComponent(JSON.stringify(q))}`)
        .join("&");

      const url = `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.user_collection_id}/documents?${queryString}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Appwrite-Project": appwriteCreds.projectId,
          "X-Appwrite-Key": appwriteCreds.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Appwrite API error: ${errText}`);
      }

      const data = await response.json();
      
      if (data.documents.length) {
        const user = data.documents[0];
        console.log("User data:", user);

        if (user) {
            return {
                success: true,
                message: "User confirmed successfully.",
                user,
            };
        }
        else {
            return {
                success: false,
                message: "User not found or does not match the provided details.",
            };
        }
        }
    } catch (error: any) {
      console.log("Error confirming user subscription:", error);
      return rejectWithValue(
        error.message ||
          "An error occurred while confirming user subscription. Check your network or contact support."
      );
    }
  }
);
