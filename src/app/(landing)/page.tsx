"use client"
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';
import Link from 'next/link';
import React from 'react';


const CheckCircle = ({ size, className }: { size?: number; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-check-circle ${className || ''}`}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
const DollarSign = ({ size }: { size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const BarChart = ({ size }: { size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
const CreditCard = ({ size }: { size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const ShieldCheck = ({ size }: { size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
const Zap = ({ size }: { size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><path d="M4 14a1 1 0 0 1-.37-1.92L17 3l-5 10h5.5l-13 9Z"/></svg>;


export default function CashbookLanding() {
  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md rounded-b-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a
            href="#"
            className="text-2xl font-bold text-cyan-700 dark:text-cyan-400"
          >
            Cashbook Assist
          </a>
          <div className="space-x-6">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400">Home</Link>
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400">Features</a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400">Pricing</a>
            <Link href="/cashbook-assist/dashboard/">
              <button className="px-4 py-2 text-cyan-700 dark:text-cyan-300 border border-cyan-700 dark:border-cyan-300 rounded-lg hover:bg-cyan-50 dark:hover:bg-gray-700 transition-colors duration-300">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-cyan-700 to-teal-800 dark:from-cyan-800 dark:to-teal-900 text-white overflow-hidden rounded-b-3xl shadow-xl">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Effortless Cashbook Management for Your Business
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto animate-fade-in-up delay-100">
            Track your income and expenses with ease, gain clear financial
            insights, and simplify your bookkeeping.
          </p>
          <div className="flex justify-center space-x-4 animate-fade-in-up delay-200">
            <button className="px-8 py-4 bg-white text-cyan-700 font-bold rounded-full text-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
              Start Your Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-full text-lg shadow-lg hover:bg-white hover:text-cyan-700 transform hover:scale-105 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
        {/* Visual blobs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-64 h-64 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob top-10 left-20"></div>
          <div className="absolute w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 bottom-20 right-20"></div>
          <div className="absolute w-56 h-56 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 top-40 right-10"></div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-white dark:bg-gray-900 rounded-t-3xl shadow-inner"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...[
              {
                icon: <DollarSign size={48} />,
                title: "Simple Transaction Logging",
                description:
                  "Easily record all your income and expenses with intuitive forms and smart categorization.",
              },
              {
                icon: <BarChart size={48} />,
                title: "Insightful Reports",
                description:
                  "Generate detailed reports and visualize your financial health with charts and graphs.",
              },
              {
                icon: <CreditCard size={48} />,
                title: "Multi-Currency Support",
                description:
                  "Manage transactions in multiple currencies, perfect for global businesses.",
              },
              {
                icon: <ShieldCheck size={48} />,
                title: "Secure & Reliable",
                description:
                  "Your financial data is protected with industry-standard encryption and security measures.",
              },
              {
                icon: <Zap size={48} />,
                title: "Automated Reminders",
                description:
                  "Never miss a payment or a due date with customizable automated reminders.",
              },
            ]].map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2"
              >
                <div className="text-cyan-700 dark:text-cyan-300 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gray-100 dark:bg-gray-800 rounded-t-3xl shadow-inner"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Simple & Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Monthly */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
              <h3 className="text-3xl font-bold text-center mb-4">
                Cashbook Assist Monthly
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                Perfect for individuals and small businesses.
              </p>
              <div className="text-center mb-8">
                <span className="text-5xl font-extrabold text-cyan-700 dark:text-cyan-400">
                  $3.99
                </span>
                <span className="text-xl text-gray-500 dark:text-gray-400">
                  /month
                </span>
              </div>
              <ul className="space-y-4 mb-8 text-gray-700 dark:text-gray-300">
                {["Unlimited Transactions", "Advanced Reports", "Multi-Currency Support"].map((txt, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" size={20} />
                    {txt}
                  </li>
                ))}
              </ul>
              <a href='/signup?plan=monthly&sys=cashbook'>
              <button className="w-full py-3 bg-cyan-700 dark:bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-800 dark:hover:bg-cyan-500 transition-colors duration-300 shadow-md">
                Choose Monthly
              </button>
              </a>
            </div>

            {/* Annual - Recommended */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl border-2 border-cyan-700 transform scale-105">
              <div className="text-center mb-4">
                <span className="inline-block bg-cyan-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Recommended
                </span>
              </div>
              <h3 className="text-3xl font-bold text-center mb-4">
                Cashbook Assist Annual
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                Perfect for individuals and small businesses.
              </p>
              <div className="text-center mb-8">
                <span className="text-5xl font-extrabold text-cyan-700 dark:text-cyan-400">
                  $39.99
                </span>
                <span className="text-xl text-gray-500 dark:text-gray-400">
                  /year
                </span>
              </div>
              <ul className="space-y-4 mb-8 text-gray-700 dark:text-gray-300">
                {["Unlimited Transactions", "Advanced Reports", "Multi-Currency Support"].map((txt, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" size={20} />
                    {txt}
                  </li>
                ))}
              </ul>
            <a href='/signup?plan=annual&sys=cashbook'>
              <button className="w-full py-3 bg-cyan-700 dark:bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-800 dark:hover:bg-cyan-500 transition-colors duration-300 shadow-md">
                Choose Annual
              </button>
            </a>
            </div>

            {/* Enterprise */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
              <h3 className="text-3xl font-bold text-center mb-4">
                Cashbook Assist Enterprise
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                Custom solutions for large organizations.
              </p>
              <div className="text-center mb-8">
                <span className="text-5xl font-extrabold text-cyan-700 dark:text-cyan-400">
                  Custom
                </span>
              </div>
              <ul className="space-y-4 mb-8 text-gray-700 dark:text-gray-300">
                {[
                  "All Pro Features",
                  "Unlimited Users",
                  "Dedicated Support",
                  "API Access",
                  "Custom Integrations",
                ].map((txt, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" size={20} />
                    {txt}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:info@shsoftwares.com?subject=Enterprise plan for cashbook assist"
                target="__blank"
              >
                <button className="w-full py-3 bg-cyan-700 dark:bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-800 dark:hover:bg-cyan-500 transition-colors duration-300 shadow-md">
                  Contact Sales
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-10 rounded-t-lg">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Silverhouse Softwares. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a
              href="/application/privacy-policy"
              className="text-gray-400 hover:text-white dark:hover:text-cyan-400 transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="/application/terms-of-use"
              className="text-gray-400 hover:text-white dark:hover:text-cyan-400 transition-colors duration-300"
            >
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
      </footer>

      {/* Tailwind animations */}
      <style jsx>{`
        @keyframes fadeInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInFromBottom 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in-up.delay-100 {
          animation-delay: 0.1s;
        }
        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

        <div className="fixed bottom-6 right-6 z-50">
            <ThemeTogglerTwo />
        </div>
    </div>
  );
}