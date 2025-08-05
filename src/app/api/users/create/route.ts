import { appwriteCreds } from "@/redux/appwrite/appwriteCreds";
import { NextResponse } from "next/server";
import { account } from "@/redux/appwrite/config";

export async function POST(req: Request) {
  const { name, email, password, plan, plan_id, user_name, userAlreadyExists, subscriptionId, on_free_trial } = await req.json();
  
    const handleSendTeamInvite = async () => {
      try {
        const user = await account.get();
        const res = await fetch("/api/users/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name
          })
        });
        if (res.ok) {
          console.error("You have been verified. An email will be sent to you in the next five working days, for now you can continue using the system.", 
            {
              duration: 5000
            }
          );
        }
        else {
          const errorData = await res.json();
          console.error("Error sending team invite:", errorData);
        }
      } catch (error) {
        console.error("Failed to send team invite", error);
      }
    };

  if (!userAlreadyExists) {
    if (!name || !email || !password || !plan) {
      console.error("Missing required fields");
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
      // 1️⃣ Create User
      const userRes = await fetch(`${appwriteCreds.apiUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": appwriteCreds.projectId || "",
          "X-Appwrite-Key": appwriteCreds.apiKey || "",
        },
        body: JSON.stringify({
          userId: "unique()",
          email,
          password,
          name,
        }),
      });

      if (!userRes.ok) {
        const error = await userRes.json();
        console.error("Appwrite user creation error", error);
        return NextResponse.json({ error }, { status: userRes.status });
      }

      const createdUser = await userRes.json();

      const teamId = process.env.APPWRITE_TEAM_ID || "your-team-id";
      try {
        const teamInviteRes = await fetch(`${appwriteCreds.apiUrl}/teams/${teamId}/memberships`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Appwrite-Project": appwriteCreds.projectId || "",
            "X-Appwrite-Key": appwriteCreds.apiKey || "",
          },
          body: JSON.stringify({
            email: createdUser.email,
            roles: ["member"],
            url: process.env.NEXT_PUBLIC_REDIRECT_URL || "https://shsoftwares.com/verify-team-invite"
          }),
        });
        if (!teamInviteRes.ok) {
          const err = await teamInviteRes.json();
          console.error("Appwrite team invite error", err);
        }
      } catch (err) {
        console.error("Failed to add user to team", err);
      }
       
    const subRes = await fetch(`${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.subscription_collection_id}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": appwriteCreds.projectId || "",
        "X-Appwrite-Key": appwriteCreds.apiKey || "",
      },
      body: JSON.stringify({
        documentId: "unique()",
        data: {
          user: createdUser.email,
          has_user_created: true,
          subscription_status: on_free_trial ? "pending" : "active",
          subscription_type: plan,
          subscription_platform: "web",
          payment_platform: "paypal",
          subscription_plan_id: plan_id,
          which_key: user_name,
          subscription_id: subscriptionId || "to-be-set",
        },
        permissions: [],
      }),
    });

    if (!subRes.ok) {
      const error = await subRes.json();
      console.error("Appwrite subscription creation error", error);
      return NextResponse.json({ error }, { status: subRes.status });
    }

    const subscription = await subRes.json();

      const userDbRes = await fetch(`${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.user_collection_id}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": appwriteCreds.projectId || "",
        "X-Appwrite-Key": appwriteCreds.apiKey || "",
      },
      body: JSON.stringify({
        documentId: "unique()",
        data: {
          full_name: name,
          email: email,
          identifier: `${email}-${createdUser.$id}`,
          which_key: user_name,
          expoNotificationId: "not-set",
          createdAt: new Date().toISOString(),
        },
        permissions: [],
      }),
    });

    if (!userDbRes.ok) {
      const error = await userDbRes.json();
      console.error("Appwrite user database creation error", error);
      return NextResponse.json({ error }, { status: userDbRes.status });
    }
    return NextResponse.json({
      message: "User and Subscription created successfully",
      user: createdUser,
      subscription,
      success: true,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Server error", error);
    return NextResponse.json({ error }, { status: 500 });
  }
  }

  if (userAlreadyExists) {
    try {
    const subRes = await fetch(`${appwriteCreds.apiUrl}/databases/${appwriteCreds.databaseId}/collections/${appwriteCreds.subscription_collection_id}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": appwriteCreds.projectId || "",
        "X-Appwrite-Key": appwriteCreds.apiKey || "",
      },
      body: JSON.stringify({
        documentId: "unique()",
        data: {
          user: email,
          has_user_created: true,
          subscription_status: on_free_trial ? "pending" : "active",
          subscription_type: plan,
          subscription_platform: "web",
          payment_platform: "paypal",
          subscription_plan_id: plan_id,
          which_key: user_name,
          subscription_id: subscriptionId || "to-be-set",
        },
        permissions: [],
      }),
    });

    if (!subRes.ok) {
      const error = await subRes.json();
      console.error("Appwrite subscription creation error", error);
      return NextResponse.json({ error }, { status: subRes.status });
    }

    const subscription = await subRes.json();
    return NextResponse.json({
      message: "Subscription created successfully",
      subscription,
      success: true,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Server error", error);
    return NextResponse.json({ error }, { status: 500 });
  }
  } 
}
