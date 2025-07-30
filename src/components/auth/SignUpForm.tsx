"use client";
import React, { useEffect, useRef, useState } from "react";
import Checkbox from "@/components/form/components/input/Checkbox";
import Input from "@/components/form/components/input/InputField";
import Label from "@/components/form/components/Label";
import Button from "../ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import toast from "react-hot-toast";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { confirmUserName } from "@/redux/auth/confirmUser";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";


export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { authenticated } = useSelector((state) => state.auth);

  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: ""
  });
  
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan")
  const is_annual = plan === "annual"


  const disabled = !formData.fullName || !formData.username || !formData.email || !formData.password || checkingUsername || !usernameAvailable;

async function handleSubscriptionCreate() {
  setIsLoading(true);
  const loadingToast = toast.loading("Creating your account...");

  const fullName = formData.fullName;
  const username = formData.username;
  const email = formData.email;
  const password = formData.password;

  try {
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fullName,
        user_name: username,
        email: email,
        on_free_trial: true,
        subscriptionId: "to-be-generated",
        plan_id: 'to-be-generated',
        password: password,
        plan: plan
      })
    });

    const result = await res.json();

    if (result.code === '409') {
      toast.error("Looks your account already exists please sign in.", {
        duration: 5000,
      });
      router.push('/signin');
      return
    }

    if (result.success) {
      toast.success("Account created! Check your email to activate your account.",{
        duration: 5000,
      });
      router.push('/signin');
    } else {
      toast.error("Something went wrong creating your account please try again or contact suppport if you continue having problems.", {
        duration: 5000,
      });
    }
  } catch (error) {
    console.error("Error creating account:", error);
    toast.error("Unexpected error occurred.");
  } finally {
    toast.dismiss(loadingToast);
    setIsLoading(false);
  }
}

async function handleUsernameCheck() {
  if (!formData.username) {
    setUsernameAvailable(null);
    return;
  }
  setCheckingUsername(true);
  try {
    const result = await confirmUserName(formData.username);
    setUsernameAvailable(result.success);
  } catch (error) {
    console.error("Error checking username:", error);
    setUsernameAvailable(false);
  } finally {
    setCheckingUsername(false);
  }
}

  useEffect(() => {
    console.log("Authenticated:", authenticated);
    if (authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, router]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      
      <div className="w-full max-w-md sm:pt-10 mx-auto">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to signin
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up 
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill the form below to sign-up for the <strong>Book Assist</strong> {is_annual ? "annual" : "monthly"} plan!
            </p>
          </div>
          <div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Full Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Preferred username<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      success={usernameAvailable}
                      error={formData.username !== "" && usernameAvailable === false}
                      disabled={checkingUsername}
                      className="relative"
                      onChange={(e) => {
                        setFormData({ ...formData, username: e.target.value });
                        setUsernameAvailable(null);
                      }}

                      onBlur={handleUsernameCheck}
                      placeholder="Enter your preferred username"
                    />
                    {checkingUsername && (
                      <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
                    )}

                    {usernameAvailable === true && (
                      <p className="text-xs text-green-600 mt-1">Username is available ✅</p>
                    )}

                    {usernameAvailable === false && formData.username !== "" && (
                      <p className="text-xs text-red-600 mt-1">Username is taken, try another one ❌</p>
                    )}
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Preffered password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      type={showPassword ? "text" : "password"}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    disabled={disabled}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account it means you agree to the{" "}
                    <Link href={'/application/terms-of-use/'} className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </Link>{" "}
                    and our{" "}
                    <Link href={'/application/privacy-policy/'} className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  {isChecked ? (
                    <>
                    <Button
                      onClick={handleSubscriptionCreate}
                      disabled={isLoading}
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 mb-3 shadow-theme-xs hover:bg-brand-600"
                    >
                        Create account and pay later
                    </Button>

                    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, vault: true, intent: "subscription" }}>
                      <PayPalButtons
                        style={{ layout: "vertical" }}
                        createSubscription={(data, actions) => {
                          return actions.subscription.create({
                            plan_id: is_annual ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_ANNUAL : process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const fullName = formData.fullName;
                          const username = formData.username;
                          const email = formData.email;
                          const password = formData.password;

                          //  API route to create Appwrite user
                          const res = await fetch('/api/create-user', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              fullName,
                              username,
                              email,
                              password,
                              userAlreadyExists: false,
                              on_free_trial: false,
                              plan: plan,
                              plan_id: is_annual ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_ANNUAL : process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
                              subscriptionId: data.subscriptionID
                            })
                          });

                          const result = await res.json();

                          if (result.success) {
                            toast.success("Account created! Check your email to activate your account.",{
                              duration: 5000,
                            });
                            router.push('/signin');
                          } else {
                            toast.error("Something went wrong creating your account.");
                          }
                        }}
                      />
                    </PayPalScriptProvider>
                    </>
                  ) : (
                    <Button
                      disabled
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                    >
                      Accept terms & conditions to enable signup
                    </Button>
                  )}
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
