import { SubscriptionPage } from "@/components/auth/NoSub";
import { Suspense } from "react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Assist Plans",
  description: "Book Assist Authentication Page",
};

export default function SignIn() {
  return(
    <Suspense fallback={<div>Loading subscription page...</div>}>
        <SubscriptionPage />;
    </Suspense>
  ) 
}
