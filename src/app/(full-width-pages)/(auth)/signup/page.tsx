import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Cashbook Assist | SignUp Page ",
  description: "This is a SignUp Page for the Cashbook Assist application.",
  // other metadata
};

export default function SignUp() {
return (
    <Suspense fallback={<div>Loading signup form...</div>}>
      <SignUpForm />
    </Suspense>
  )
}
