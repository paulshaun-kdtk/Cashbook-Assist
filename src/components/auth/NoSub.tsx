"use client"
import React, { useState } from 'react';
import ThemeTogglerTwo from '../common/ThemeTogglerTwo';
import { FaCheck } from 'react-icons/fa6';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { logoutThunk } from '@/redux/auth/authThunks';

export const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly'); 
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const router = useRouter()
  const email = useSearchParams().get('email') || '';
  const params = useSearchParams()

  const planExpired = params.get('message')?.toLocaleLowerCase().includes('expired')

   const handleLogout = () => {
      dispatch(logoutThunk())
        .unwrap()
        .then(() => {
          localStorage.clear();
          sessionStorage.clear();
          router.push("/signin");
        })
        .catch((error) => {
          console.error("Failed to log out:", error);
        })
    };

  const handleSubCreation = async ({data = null, free_trial=false, updateSub=false}) => {
        setLoading(true);
        console.log("Creating subscription for email:", email, "with data:", data);
        const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email,
            plan_id: selectedPlan === 'annually' ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_ANNUAL : process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
            subscriptionId: data,
            userAlreadyExists: true,
            plan: selectedPlan === 'annually' ? 'annual' : 'monthly',
            subAlreadyExists: updateSub,
            on_free_trial: free_trial,
        })
        });

        const result = await res.json();

        if (result.success) {
        toast.success("Account created! Check your email to activate your account.");
        router.push('/cashbook-assist/dashboard') 
    } else {
        toast.error("Something went wrong creating your account.");
        }
        setLoading(false);
  }

  const features = [
    "Unlimited transactions",
    "Advanced reporting", 
    "Multiple device sync",
    "Priority support"
  ];

  return (
    // Outer container matching landing page styling
    <div className="font-sans antialiased text-gray-800 dark:text-gray-100 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full mx-auto p-6 md:p-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Thank you for choosing Cashbook Assist!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You need an active subscription to access the Cashbook Assist features.
            <br />
            Please select a plan below to continue.
          </p>
        </div>

        {/* Plan Selection Section - matching landing page grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {/* Monthly Plan Card */}
          <div
            className={`
              bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md border cursor-pointer transition duration-300 hover:shadow-xl flex flex-col justify-between
              ${selectedPlan === 'monthly'
                ? 'border-2 border-cyan-500 dark:border-cyan-400'
                : 'border-gray-200 dark:border-gray-700'
              }
            `}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Cashbook Assist Monthly</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Full access to all features.</p>
              <div className="text-5xl font-bold text-cyan-700 dark:text-cyan-400 mb-2">$4.99</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Billed monthly</p>

              <ul className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <FaCheck className="text-cyan-600 dark:text-cyan-400 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
                  <span className="bg-cyan-100 dark:bg-cyan-900 px-3 py-1 rounded-full">
                    Enjoy a 1-Week Free Trial!
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Annual Plan Card */}
          <div
            className={`
              bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md border cursor-pointer transition duration-300 hover:shadow-xl flex flex-col justify-between relative
              ${selectedPlan === 'annually'
                ? 'border-2 border-cyan-500 dark:border-cyan-400'
                : 'border-2 border-cyan-500 dark:border-cyan-400'
              }
            `}
            onClick={() => setSelectedPlan('annually')}
          >
            {/* Badge - always visible for annual plan like landing page */}
            <span className="absolute top-0 right-0 mt-4 mr-4 bg-cyan-600 text-white text-xs px-3 py-1 rounded-full shadow-sm">
              Best Value
            </span>

            <div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Cashbook Assist Annual</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Full access to all features.</p>
              <div className="text-5xl font-bold text-cyan-700 dark:text-cyan-400 mb-2">$49.99</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Billed annually</p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700 dark:text-gray-300 font-bold">
                  <FaCheck className="text-cyan-600 dark:text-cyan-400 mr-2" />
                  <span>Save 20% compared to monthly</span>
                </li>
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                    <FaCheck className="text-cyan-600 dark:text-cyan-400 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
                  <span className="bg-cyan-100 dark:bg-cyan-900 px-3 py-1 rounded-full">
                    Enjoy a 1-Week Free Trial!
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
          {loading && (
              <div className='w-full text-center'>
                <span className='text-gray-400 text-base'>Processing....</span>
              </div>
              )}

        {/* Subscribe Button */}
        {!planExpired && (
          <div className="text-center mb-6">
                <button
                    onClick={() => handleSubCreation({data: "to-be-set",free_trial: true})}
                    disabled={loading}
                    className="
                    w-full max-w-md py-3 bg-cyan-700 dark:bg-cyan-600 text-white font-bold text-lg rounded-lg
                    shadow-lg transition-colors duration-300
                    hover:bg-cyan-800 dark:hover:bg-cyan-500
                    focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-700
                    disabled:opacity-50 disabled:cursor-not-allowed">
                    Start Free Trial - {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Plan
                </button>
            </div>
          )}
            <div className="max-w-md mx-auto">
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', vault: true, intent: "subscription" }}>
                <PayPalButtons
                style={{ layout: "vertical" }}
                createSubscription={(data, actions) => {
                    return actions.subscription.create({
                        plan_id: selectedPlan === 'annually' ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_ANNUAL || '' : process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || '',
                    });
                }}
                onApprove={async (data) => {
                  handleSubCreation({data: data.subscriptionID || null, free_trial: false, updateSub: planExpired});  
                }}
                />
            </PayPalScriptProvider>
            </div>
            </div>
            
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 font-medium text-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
        >
          <svg
            className="fill-current w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill=""
            />
          </svg>
          Sign out
        </button>

            <ThemeTogglerTwo />
        </div>
    </div>
  );
};