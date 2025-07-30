import { appwriteCreds } from "@/redux/appwrite/appwriteCreds";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Use your Appwrite Project config
    const projectId = appwriteCreds.projectId;
    const apiEndpoint = appwriteCreds.apiUrl;
    const apiKey = appwriteCreds.apiKey;
    const teamId = "6788e80e002d1a60eef7";
    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

    const response = await fetch(`${apiEndpoint}/teams/${teamId}/memberships`, {
      method: "POST",
      headers: {
        "X-Appwrite-Project": projectId!,
        "X-Appwrite-Key": apiKey!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        roles: ["member"],
        url: redirectUrl,
        name
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.message }, { status: response.status });
    }

    return NextResponse.json({ message: "Invite sent successfully.", result });
  } catch (error: any) {
    console.error("Error sending team invite:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
