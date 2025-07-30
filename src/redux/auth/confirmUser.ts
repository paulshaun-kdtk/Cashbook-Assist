import { appwriteCreds } from "../appwrite/appwriteCreds";

export const confirmUserAndKey = async (
  email: string
) => {
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
      return {
        success: true,
        message: "User and key confirmed successfully.",
        user: data.documents[0],
      };
    } else {
      return {
        success: false,
        message: "User name or user_name not found, please confirm your details.",
      };
    }
  } catch (error) {
    console.log("Error confirming user and key:", error);
    return {
      success: false,
      message:
        error.message || "An error occurred while confirming user and key.",
    };
  }
};

export const confirmUserName = async (
  email: string
) => {
  try {
    const queries = [
      { method: "equal", attribute: "which_key", values: [email] },
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
      return {
        success: false,
        message: "User_name already exists.",
        user: data.documents[0],
      };
    } else {
      return {
        success: true,
        message: "This user_name is okay to use. Make sure not to forget it.",
      };
    }
  } catch (error) {
    console.log("Error confirming user and key:", error);
    return {
      success: false,
      message:
        error.message || "An error occurred while confirming checking user_name availability please check your network or contact support.",
    };
  }
}

export const confirmUserNameBelongsToUser = async (
  email: string,
  user_name: string
) => {
  try {
    const queries = [
      { method: "equal", attribute: "email", values: [email] },
      { method: "equal", attribute: "which_key", values: [user_name] },
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
      return {
        success: true,
        message: "User_name matches.",
        user: data.documents[0],
      };
    } else {
      return {
        success: false,
        message: "Username does not match.",
      };
    }
  } catch (error) {
    console.log("Error confirming user and key:", error);
    return {
      success: false,
      message:
        error.message || "An error occurred while confirming checking user_name availability please check your network or contact support.",
    };
  }
}

export const confirmHasSubscription = async (
  email: string
) => {
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
  const subscription = data.documents[0];
  console.log("Subscription data:", subscription);

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (subscription.subscription_status === "pending" && new Date(subscription.$createdAt) > oneWeekAgo) {
    return {
      success: true,
      free_trial: true,
      time_remaining: Math.ceil(
        (new Date(subscription.$createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) /
          (1000 * 60 * 60 * 24)
      ),
      message: "User is on a free trial.",
      subscription,
      other_subscriptions: data.documents
    };
  }

  if (subscription.subscription_status === "active") {
    return {
      success: true,
      message: "User has an active subscription.",
      subscription,
      other_subscriptions: data.documents
    };
  }

  return {
    success: false,
    message: "Sub cancelled or expired.",
  };
}

return {
  success: false,
  message: "User does not have a subscription.",
};
  } catch (error) {
    console.log("Error confirming user subscription:", error);
    return {
      success: false,
      message:
        error.message || "An error occurred while confirming checking user_name availability please check your network or contact support.",
    };
  }
}