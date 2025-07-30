import { createAsyncThunk } from '@reduxjs/toolkit';
import { appwriteCreds } from '@/redux/appwrite/appwriteCreds';
import { Subscription } from '@/lib/types';

export const confirmHasSubscriptionThunk = createAsyncThunk(
  'subscription/confirmHasSubscription',
  async ({ email, which_key = "main" }: { email: string; which_key?: string }, { rejectWithValue }) => {
    try {
      const queries = [
        { method: "equal", attribute: "user", values: [email] },
        { method: "limit", values: [1] },
      ];

      const queryString = queries
        .map((q, i) => `queries[${i}]=${encodeURIComponent(JSON.stringify(q))}`)
        .join("&");

      const url = `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.subscription_collection_id}/documents?${queryString}`;

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
        const subscription = data.documents.find((doc: Subscription) => doc.subscription_system === which_key) || data.documents[0];
        
        console.log("Subscription data:", subscription);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        if (
          subscription.subscription_status === "pending" &&
          new Date(subscription.$createdAt) > oneWeekAgo
        ) {
            const msRemaining =
            new Date(subscription.$createdAt).getTime() +
            7 * 24 * 60 * 60 * 1000 -
            Date.now();

            const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const timeRemaining = parseFloat(`${days}.${hours.toString().padStart(2, '0')}`);

          return {
            success: true,
            free_trial: true,
            time_remaining: timeRemaining,
            message: "User is on a free trial.",
            subscription,
            other_subscriptions: data.documents,
          };
        }

        if (subscription.subscription_status === "active") {
          return {
            success: true,
            message: "User has an active subscription.",
            free_trial: false,
            time_remaining: 0,
            subscription,
            other_subscriptions: data.documents,
          };
        }

        return {
            success: false,
            free_trial: false,
            time_remaining: 0,
            message: "Sub cancelled or expired.",
        };
      }

      return {
        success: false,
        message: "User does not have a subscription.",
      };
    } catch (error: any) {
      console.log("Error confirming user subscription:", error);
      return rejectWithValue(
        error.message ||
          "An error occurred while confirming user subscription. Check your network or contact support."
      );
    }
  }
);
