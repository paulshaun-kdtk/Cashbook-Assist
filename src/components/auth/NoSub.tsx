"use client"
import React, { useState } from 'react';
import ThemeTogglerTwo from '../common/ThemeTogglerTwo';
import { CheckIcon } from './Landing';
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
            plan: selectedPlan,
            plan_id: selectedPlan === 'annually' ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_ANNUAL : process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
            subscriptionId: data,
            userAlreadyExists: true,
            subAlreadyExists: updateSub,
            on_free_trial: free_trial,
        })
        });

        const result = await res.json();

        if (result.success) {
        toast.success("Account created! Check your email to activate your account.");
        router.push('/dashboard') 
    } else {
        toast.error("Something went wrong creating your account.");
        }
        setLoading(false);
  }

  const features = [
    "Comprehensive Stock Management",
    "Effortless Invoice & Quotation Generation",
    "Detailed Expense Tracking",
    "Real-time Sales Performance Analytics",
    "Secure & Accessible Data Anytime"
  ];

  return (
    // Outer container for the entire page, providing dark mode styling and centering
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full mx-auto p-6 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
            Thank you for choosing Book Assist!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You need an active subscription to access the Book Assist features.
            <br />
            Please select a plan below to continue.
          </p>
        </div>

        {/* Plan Selection Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Monthly Plan Card */}
          <div
            className={`
              relative p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-300 ease-in-out
              ${selectedPlan === 'monthly'
                ? 'bg-teal-50 dark:bg-teal-900 ring-2 ring-teal-500 dark:ring-teal-400'
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }
              border border-gray-200 dark:border-gray-700
            `}
            onClick={() => setSelectedPlan('monthly')}
          >
            {selectedPlan === 'monthly' && (
              <span className="absolute top-3 right-3 text-teal-600 dark:text-teal-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Monthly Plan</h3>
              <p className="text-gray-500 dark:text-gray-400">Ideal for flexible management</p>
              <div className="mt-4">
                <span className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">$4.99</span>
                <span className="text-xl font-medium text-gray-600 dark:text-gray-300">/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700 dark:text-gray-200">
                  <CheckIcon className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                <span className="bg-emerald-100 dark:bg-emerald-900 px-3 py-1 rounded-full">
                  Enjoy a 1-Week Free Trial!
                </span>
              </p>
            </div>

          </div>

          {/* Annually Plan Card */}
          <div
            className={`
              relative p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-300 ease-in-out
              ${selectedPlan === 'annually'
                ? 'bg-teal-50 dark:bg-teal-900 ring-2 ring-teal-500 dark:ring-teal-400'
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }
              border border-gray-200 dark:border-gray-700
            `}
            onClick={() => setSelectedPlan('annual')}
          >
            {selectedPlan === 'annual' && (
              <span className="absolute top-3 right-3 text-teal-600 dark:text-teal-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Annual Plan</h3>
              <p className="text-gray-500 dark:text-gray-400">Best value for complete sales control</p>
              <div className="mt-4">
                <span className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">$49.99</span>
                <span className="text-xl font-medium text-gray-600 dark:text-gray-300">/year</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700 dark:text-gray-200">
                  <CheckIcon className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              <li className="flex items-center text-gray-700 dark:text-gray-200 font-bold">
                <CheckIcon className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                <span>Save 20% compared to monthly</span>
              </li>
            </ul>
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                <span className="bg-emerald-100 dark:bg-emerald-900 px-3 py-1 rounded-full">
                  Enjoy a 1-Week Free Trial!
                </span>
              </p>
            </div>
          </div>
        </div>
          {loading && (
              <div className='w-full'>
                <span className='text-gray-400 text-base text-center'>Processing....</span>
              </div>
              )}

        {/* Subscribe Button */}
        {!planExpired && (
          <div className="text-center">
                <button
                    onClick={() => handleSubCreation({data: 'to-be-updated',free_trial: true})}
                    disabled={loading}
                    className="
                    px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-lg
                    shadow-lg transition-all duration-300 ease-in-out
                    dark:bg-teal-500 dark:hover:bg-teal-600
                    focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-700
                    transform hover:scale-105">
                    Set up payment information for {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} later
                </button>
            </div>
          )}
            <div className="mt-3 m-auto max-w-md">
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, vault: true, intent: "subscription" }}>
                <PayPalButtons
                style={{ layout: "vertical" }}
                createSubscription={(data, actions) => {
                    return actions.subscription.create({
                        plan_id: selectedPlan === 'annually' ? process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_ANNUAL : process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
                    });
                }}
                onApprove={async (data, actions) => {
                  handleSubCreation({data: data.id, free_trial: false, updateSub: planExpired});  
                }}
                />
            </PayPalScriptProvider>
            </div>
            </div>
            
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block flex-row gap-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
            width="24"
            height="24"
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