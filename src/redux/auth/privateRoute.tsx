"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RootState } from "@/redux/store";
import toast from "react-hot-toast";
import { confirmHasSubscription } from "./confirmUser";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.authenticated);
  const userEmail = useSelector((state: RootState) => state.auth.user?.email || "");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated) {
        toast.error("Please sign in to continue.");
        router.replace("/signin");
        return;
      }

      const sessionKey = `hasValidSubscription_${userEmail}`;
      const hasValidSession = sessionStorage.getItem(sessionKey);

      if (hasValidSession === "true") {
        setChecking(false);
        return;
      }

      const hasSubscription = await confirmHasSubscription(userEmail);
     
      if (!hasSubscription.success) {
        console.error("Subscription check failed:", hasSubscription);
        toast.error(hasSubscription.message || "You need an active subscription to access this page.");
        router.replace("/no-sub?email=" + userEmail + "&message=" + encodeURIComponent(hasSubscription.message || "No subscription found"));
        return;
      }

      sessionStorage.setItem(sessionKey, "true");
      setChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, userEmail, router]);

  if (checking) return null;

  return <>{children}</>;
}
