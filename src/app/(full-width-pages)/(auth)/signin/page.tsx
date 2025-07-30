import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cashbook Assist Auth",
  description: "Cashbook Assist Authentication Page",
};

export default function SignIn() {
  return <SignInForm />;
}
