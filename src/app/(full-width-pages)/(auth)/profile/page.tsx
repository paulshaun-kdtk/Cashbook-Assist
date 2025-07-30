import ProfileContent from "./ProfileContent";
import { Metadata } from "next";
import React from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "User Profile",
  description:
    "This is the book assist personal user details page",
};

export default function Profile() {
  return <ProfileContent />;
}
