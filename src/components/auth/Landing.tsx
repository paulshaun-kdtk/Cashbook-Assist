"use client"
import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa6';
import ThemeTogglerTwo from '../common/ThemeTogglerTwo';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

// Inline SVG for a checkmark icon
export const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M19.952 1.343a.75.75 0 01.027 1.06l-13.5 14.25a.75.75 0 01-1.091.027L3.027 12.72a.75.75 0 011.06-1.06l4.272 4.272 12.973-13.682a.75.75 0 011.06.027z"
      clipRule="evenodd"
    />
  </svg>
);


export function SignUpLanding(){
  const [activePlan, setActivePlan] = useState('monthly'); // 'monthly' or 'annual'
  const router = useRouter()
  const {authenticated} = useSelector((state: any) => state.auth); 


  useEffect(() => {
    if (authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, router])



 return (
    <div className="font-sans antialiased text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md rounded-b-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="#">
            <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">Book Assist</span>
          </Link>
          <div className="space-x-6">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400">Home</Link>
            <Link href="/cashbook-assist-new" className="text-gray-600 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400">Cashbook Assist</Link>
            <Link href="/invoice-assist-new" className="text-gray-600 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400">Invoice Assist</Link>
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400">Features</a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400">Pricing</a>
            <Link href="/signin?redirect=bookassist">
              <button className="px-4 py-2 text-cyan-700 dark:text-cyan-300 border border-cyan-700 dark:border-cyan-300 rounded-lg hover:bg-cyan-50 dark:hover:bg-gray-700 transition-colors duration-300">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-cyan-700 to-teal-800 dark:from-cyan-800 dark:to-teal-900 text-white rounded-b-3xl shadow-xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Simplify Your Business Finances
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Record transactions, track performance, and get insights — all from your phone.
          </p>
          <Link href="/dashboard">
            <button className="px-6 py-2 bg-white text-cyan-700 dark:bg-cyan-600 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-cyan-500 transition-colors duration-300 shadow-lg">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900 rounded-t-3xl shadow-inner">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Track Income & Expenses", desc: "Easily log and categorize all your transactions." },
              { title: "Offline Ready", desc: "Works even without internet. Syncs when you’re online." },
              { title: "Smart Reports", desc: "See cash flow, profits, and financial summaries instantly." },
              { title: "Stock Tracking", desc: "Monitor item-level stock and sales effortlessly." },
              { title: "Credit Sales", desc: "Track who owes you, and when they last paid." },
              { title: "Mobile First", desc: "Fully optimized for use on mobile devices." },
            ].map((f, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
<section id="pricing" className="py-20 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 rounded-t-3xl shadow-inner">
  <div className="container mx-auto px-6">
    <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Simple & Transparent Pricing
    </h2>

    <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
      {/* Monthly Plan */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between transition duration-300 hover:shadow-xl">
        <div>
          <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Book Assist Monthly</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Full access to all features.</p>
          <div className="text-5xl font-bold text-cyan-700 dark:text-cyan-400 mb-2">$4.99</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Billed monthly</p>

          <ul className="space-y-3 mb-6">
            {[
              "Unlimited transactions",
              "Advanced reporting",
              "Multiple device sync",
              "Priority support",
            ].map((point, i) => (
              <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                <FaCheck className="text-cyan-600 dark:text-cyan-400 mr-2" /> {point}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/signup?plan=monthly&sys=main">
          <button className="w-full py-3 bg-cyan-700 dark:bg-cyan-600 text-white rounded-lg hover:bg-cyan-800 dark:hover:bg-cyan-500 transition-colors duration-300">
            Start Free Trial
          </button>
        </Link>
      </div>

      {/* Annual Plan */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md border-2 border-cyan-500 dark:border-cyan-400 flex flex-col justify-between relative transition duration-300 hover:shadow-xl">
        {/* Badge */}
        <span className="absolute top-0 right-0 mt-4 mr-4 bg-cyan-600 text-white text-xs px-3 py-1 rounded-full shadow-sm">
          Best Value
        </span>

        <div>
          <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Book Assist Annual</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Full access to all features.</p>
          <div className="text-5xl font-bold text-cyan-700 dark:text-cyan-400 mb-2">$49.99</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Billed annually</p>

          <ul className="space-y-3 mb-6">
            {[
              "Save 20% compared to monthly",
              "Unlimited transactions",
              "Advanced reporting",
              "Multiple device sync",
              "Priority support",
            ].map((point, i) => (
              <li key={i} className="flex items-center text-gray-700 dark:text-gray-300">
                <FaCheck className="text-cyan-600 dark:text-cyan-400 mr-2" /> {point}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/signup?plan=annual&sys=main">
          <button className="w-full py-3 bg-cyan-700 dark:bg-cyan-600 text-white rounded-lg hover:bg-cyan-800 dark:hover:bg-cyan-500 transition-colors duration-300">
            Start Free Trial
          </button>
        </Link>
      </div>
    </div>
  </div>
  
</section>


      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-10 rounded-t-lg mt-10">
        <div className="container mx-auto px-6 text-center">
          <p className="mb-4">&copy; {new Date().getFullYear()} Silverhouse softwares. All rights reserved.</p>
          <div className="space-x-4">
            <a href="/application/privacy-policy" className="text-gray-400 hover:text-white dark:hover:text-cyan-400">
              Privacy Policy
            </a>
            <a href="/application/terms" className="text-gray-400 hover:text-white dark:hover:text-cyan-400">
              Terms of Service
            </a>
                        <a
              href="mailto:support@shsoftwares.com?subject=Support request for cashbook assist"
              className="text-gray-400 hover:text-white dark:hover:text-cyan-400 transition-colors duration-300"
            >
              Support
            </a>
          </div>
        </div>
          <div className="fixed bottom-6 right-6 z-50">
              <ThemeTogglerTwo />
          </div>
      </footer>
    </div>
  );
}