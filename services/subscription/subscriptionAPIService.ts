import { appwriteCreds } from '@/redux/appwrite/credentials';
import { Platform } from 'react-native';

export interface SubscriptionUpdateData {
  subscription_status: 'active' | 'pending' | 'cancelled' | 'expired';
  subscription_type?: 'premium' | 'basic' | 'trial';
  subscription_plan_id?: string;
  subscription_id?: string;
  payment_platform?: 'revenue_cat';
  subscription_platform?: string;
}

export const subscriptionAPIService = {
  /**
   * Update existing subscription status in Appwrite
   */
  updateSubscription: async (
    userEmail: string,
    updateData: SubscriptionUpdateData
  ): Promise<{ success: boolean; message: string; subscription?: any }> => {
    try {
      // First, find the existing subscription document
      const queries = [
        { method: "equal", attribute: "user", values: [userEmail.toLowerCase().trim()] },
        { method: "limit", values: [1] },
      ];

      const queryString = queries
        .map((q, i) => `queries[${i}]=${encodeURIComponent(JSON.stringify(q))}`)
        .join("&");

      const findUrl = `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.subscription_collection_id}/documents?${queryString}`;

      const findResponse = await fetch(findUrl, {
        method: "GET",
        headers: {
          "X-Appwrite-Project": appwriteCreds.projectId!,
          "X-Appwrite-Key": appwriteCreds.apiKey!,
          "Content-Type": "application/json",
        },
      });

      if (!findResponse.ok) {
        const errText = await findResponse.text();
        throw new Error(`Failed to find subscription: ${errText}`);
      }

      const findData = await findResponse.json();

      if (findData.documents.length === 0) {
        throw new Error('No subscription found for this user');
      }

      const existingSubscription = findData.documents[0];

      // Update the subscription document
      const updateUrl = `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.subscription_collection_id}/documents/${existingSubscription.$id}`;

      const updatePayload = {
        subscription_status: updateData.subscription_status,
        subscription_type: updateData.subscription_type || existingSubscription.subscription_type,
        subscription_platform: updateData.subscription_platform || Platform.OS,
        payment_platform: updateData.payment_platform || 'revenue_cat',
        subscription_plan_id: updateData.subscription_plan_id || existingSubscription.subscription_plan_id,
        subscription_id: updateData.subscription_id || existingSubscription.subscription_id,
        updated_at: new Date().toISOString(),
      };

      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'X-Appwrite-Project': appwriteCreds.projectId!,
          'X-Appwrite-Key': appwriteCreds.apiKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || 'Failed to update subscription');
      }

      const updatedSubscription = await updateResponse.json();

      console.log('Subscription updated successfully:', updatedSubscription);

      return {
        success: true,
        message: 'Subscription updated successfully',
        subscription: updatedSubscription
      };

    } catch (error: any) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        message: error.message || 'Failed to update subscription'
      };
    }
  },

  /**
   * Create a new subscription document
   */
  createSubscription: async (
    userEmail: string,
    username: string,
    subscriptionData: SubscriptionUpdateData & {
      subscription_plan_id: string;
    }
  ): Promise<{ success: boolean; message: string; subscription?: any }> => {
    try {
      const subscriptionPayload = {
        documentId: 'unique()',
        data: {
          user: userEmail.toLowerCase().trim(),
          has_user_created: true,
          subscription_status: subscriptionData.subscription_status,
          subscription_type: subscriptionData.subscription_type || 'premium',
          subscription_platform: subscriptionData.subscription_platform || Platform.OS,
          payment_platform: subscriptionData.payment_platform || 'revenue_cat',
          subscription_plan_id: subscriptionData.subscription_plan_id,
          subscription_id: subscriptionData.subscription_id || 'to-be-set',
          which_key: username.toLowerCase().trim(),
        },
      };

      const response = await fetch(
        `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.subscription_collection_id}/documents`,
        {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': appwriteCreds.projectId!,
            'X-Appwrite-Key': appwriteCreds.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionPayload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }

      const newSubscription = await response.json();

      console.log('Subscription created successfully:', newSubscription);

      return {
        success: true,
        message: 'Subscription created successfully',
        subscription: newSubscription
      };

    } catch (error: any) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        message: error.message || 'Failed to create subscription'
      };
    }
  },

  /**
   * Update or create subscription (upsert)
   */
  upsertSubscription: async (
    userEmail: string,
    username: string,
    subscriptionData: SubscriptionUpdateData & {
      subscription_plan_id: string;
    }
  ): Promise<{ success: boolean; message: string; subscription?: any }> => {
    try {
      // First try to update existing subscription
      const updateResult = await subscriptionAPIService.updateSubscription(userEmail, subscriptionData);
      
      if (updateResult.success) {
        return updateResult;
      }

      // If update failed because no subscription exists, create a new one
      if (updateResult.message.includes('No subscription found')) {
        console.log('No existing subscription found, creating new one...');
        return await subscriptionAPIService.createSubscription(userEmail, username, subscriptionData);
      }

      // If update failed for other reasons, return the error
      return updateResult;

    } catch (error: any) {
      console.error('Error upserting subscription:', error);
      return {
        success: false,
        message: error.message || 'Failed to update subscription'
      };
    }
  }
};
