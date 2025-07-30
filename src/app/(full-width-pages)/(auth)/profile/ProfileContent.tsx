"use client";

import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import DeleteAccountSection from "@/components/user-profile/DeleteAccountSection";
import React from "react";
import { useSelector } from "react-redux";

interface AuthState {
  auth: {
    user?: {
      email?: string;
      $id?: string;
      userId?: string;
    };
  };
}

export default function ProfileContent() {
  // Get user data from Redux auth state
  const { user } = useSelector((state: AuthState) => state.auth);
  
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
          
          {/* Delete Account Section */}
          <DeleteAccountSection
            userEmail={user?.email}
            userId={user?.$id || user?.userId}
          />
        </div>
      </div>
    </div>
  );
}
