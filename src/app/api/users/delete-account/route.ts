import { appwriteCreds } from "@/redux/appwrite/appwriteCreds";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { email, userId, unique_id } = await req.json();

    if (!email && !userId && !unique_id) {
      return NextResponse.json(
        { error: "Either email, userId, or unique_id is required" },
        { status: 400 }
      );
    }

    let userDocuments = [];
    if (!userId && email) {
      const userQuery = [
        { method: "equal", attribute: "email", values: [email] },
      ];

      const userQueryString = userQuery
        .map((q, i) => `queries[${i}]=${encodeURIComponent(JSON.stringify(q))}`)
        .join("&");

      const userResponse = await fetch(
        `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.user_collection_id}/documents?${userQueryString}`,
        {
          method: "GET",
          headers: {
            "X-Appwrite-Project": appwriteCreds.projectId || "",
            "X-Appwrite-Key": appwriteCreds.apiKey || "",
            "Content-Type": "application/json",
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        userDocuments = userData.documents;
      }
    }

    // Step 2: Delete all user data from collections
    const collections = [
      { id: appwriteCreds.account_collection_id, name: "accounts" },
      { id: appwriteCreds.company_collection_id, name: "companies" },
      { id: appwriteCreds.user_collection_id, name: "users" },
      { id: appwriteCreds.income_source_collection_id, name: "income_sources" },
      { id: appwriteCreds.income_collection_id, name: "income" },
      { id: appwriteCreds.expense_collection_id, name: "expenses" },
      { id: appwriteCreds.cashbook_collection_id, name: "cashbooks" },
      { id: appwriteCreds.subscription_collection_id, name: "subscriptions" },
    ];

    const deletionResults = [];

    for (const collection of collections) {
      try {
        // Query for user's documents in this collection
        const queries = unique_id 
          ? [{ method: "equal", attribute: "which_key", values: [unique_id] }]
          : email 
          ? [{ method: "equal", attribute: "user", values: [email] }]
          : [{ method: "equal", attribute: "userId", values: [userId] }];

        const queryString = queries
          .map((q, i) => `queries[${i}]=${encodeURIComponent(JSON.stringify(q))}`)
          .join("&");

        const documentsResponse = await fetch(
          `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${collection.id}/documents?${queryString}`,
          {
            method: "GET",
            headers: {
              "X-Appwrite-Project": appwriteCreds.projectId || "",
              "X-Appwrite-Key": appwriteCreds.apiKey || "",
              "Content-Type": "application/json",
            },
          }
        );

        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json();
          const documents = documentsData.documents;

          // Delete each document
          for (const doc of documents) {
            try {
              const deleteResponse = await fetch(
                `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${collection.id}/documents/${doc.$id}`,
                {
                  method: "DELETE",
                  headers: {
                    "X-Appwrite-Project": appwriteCreds.projectId || "",
                    "X-Appwrite-Key": appwriteCreds.apiKey || "",
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!deleteResponse.ok) {
                console.error(`Failed to delete document ${doc.$id} from ${collection.name}`);
              }
            } catch (error) {
              console.error(`Error deleting document ${doc.$id} from ${collection.name}:`, error);
            }
          }

          deletionResults.push({
            collection: collection.name,
            deletedCount: documents.length,
            success: true,
          });
        } else {
          console.error(`Failed to fetch documents from ${collection.name}`);
          deletionResults.push({
            collection: collection.name,
            deletedCount: 0,
            success: false,
            error: "Failed to fetch documents",
          });
        }
      } catch (error) {
        console.error(`Error processing collection ${collection.name}:`, error);
        deletionResults.push({
          collection: collection.name,
          deletedCount: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Step 3: Delete the Appwrite user account
    let userDeletionResult = null;
    
    if (userId) {
      try {
        const deleteUserResponse = await fetch(
          `${appwriteCreds.apiUrl}/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              "X-Appwrite-Project": appwriteCreds.projectId || "",
              "X-Appwrite-Key": appwriteCreds.apiKey || "",
              "Content-Type": "application/json",
            },
          }
        );

        userDeletionResult = {
          success: deleteUserResponse.ok,
          status: deleteUserResponse.status,
          message: deleteUserResponse.ok 
            ? "Appwrite user account deleted successfully" 
            : "Failed to delete Appwrite user account",
          error: undefined as string | undefined,
        };

        if (!deleteUserResponse.ok) {
          const errorText = await deleteUserResponse.text();
          userDeletionResult.error = errorText;
        }
      } catch (error) {
        userDeletionResult = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          message: "Error deleting Appwrite user account",
        };
      }
    } else if (userDocuments.length > 0) {
      // If we found user documents but don't have userId, we can't delete the auth account
      userDeletionResult = {
        success: false,
        message: "Cannot delete Appwrite auth account without userId",
      };
    }

    // Step 4: Return comprehensive results
    const totalDeleted = deletionResults.reduce((sum, result) => sum + result.deletedCount, 0);
    const failedCollections = deletionResults.filter(result => !result.success);

    return NextResponse.json({
      success: true,
      message: "Account deletion process completed",
      results: {
        totalDocumentsDeleted: totalDeleted,
        collectionsProcessed: deletionResults.length,
        failedCollections: failedCollections.length,
        userAccountDeletion: userDeletionResult,
        detailedResults: deletionResults,
      },
    });

  } catch (error) {
    console.error("Error in delete account API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what would be deleted (for confirmation)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");
    const unique_id = searchParams.get("unique_id");

    if (!email && !userId && !unique_id) {
      return NextResponse.json(
        { error: "Either email, userId, or unique_id parameter is required" },
        { status: 400 }
      );
    }

    const collections = [
      { id: appwriteCreds.account_collection_id, name: "accounts" },
      { id: appwriteCreds.company_collection_id, name: "companies" },
      { id: appwriteCreds.user_collection_id, name: "users" },
      { id: appwriteCreds.income_source_collection_id, name: "income_sources" },
      { id: appwriteCreds.income_collection_id, name: "income" },
      { id: appwriteCreds.expense_collection_id, name: "expenses" },
      { id: appwriteCreds.cashbook_collection_id, name: "cashbooks" },
      { id: appwriteCreds.subscription_collection_id, name: "subscriptions" },
    ];


    const preview = [];

    for (const collection of collections) {
      try {
        const queries = unique_id 
          ? [{ method: "equal", attribute: "which_key", values: [unique_id] }]
          : email 
          ? [{ method: "equal", attribute: "user", values: [email] }]
          : [{ method: "equal", attribute: "userId", values: [userId] }];

        const queryString = queries
          .map((q, i) => `queries[${i}]=${encodeURIComponent(JSON.stringify(q))}`)
          .join("&");

        const response = await fetch(
          `${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${collection.id}/documents?${queryString}`,
          {
            method: "GET",
            headers: {
              "X-Appwrite-Project": appwriteCreds.projectId || "",
              "X-Appwrite-Key": appwriteCreds.apiKey || "",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          preview.push({
            collection: collection.name,
            documentCount: data.documents.length,
            documents: data.documents.map((doc: { $id: string; $createdAt: string; [key: string]: unknown }) => ({
              id: doc.$id,
              createdAt: doc.$createdAt,
              // Add other relevant preview fields
            })),
          });
        } else {
          preview.push({
            collection: collection.name,
            documentCount: 0,
            error: "Failed to fetch",
          });
        }
      } catch (error) {
        preview.push({
          collection: collection.name,
          documentCount: 0,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const totalDocuments = preview.reduce((sum, item) => sum + (item.documentCount || 0), 0);

    return NextResponse.json({
      success: true,
      message: "Preview of data to be deleted",
      totalDocuments,
      preview,
    });

  } catch (error) {
    console.error("Error in delete account preview API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
