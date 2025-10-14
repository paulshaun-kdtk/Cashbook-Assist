"use client"
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

const CheckCircle = ({ size, className }: { size?: number; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-check-circle ${className || ''}`}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
const DollarSign = ({ size, className }: { size?: number; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-dollar-sign ${className || ''}`}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const BarChart = ({ size, className }: { size?: number; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-bar-chart ${className || ''}`}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
const CreditCard = ({ size, className }: { size?: number; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-credit-card ${className || ''}`}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const Zap = ({ size, className }: { size?: number; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-zap ${className || ''}`}><path d="M4 14a1 1 0 0 1-.37-1.92L17 3l-5 10h5.5l-13 9Z"/></svg>;

// Social Media Icons
const YouTubeIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const InstagramIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const XIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

export default function CashbookLanding() {
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe sections
    if (heroRef.current) observer.observe(heroRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (pricingRef.current) observer.observe(pricingRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200/20 dark:border-gray-700/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 group">
            
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Cashbook Assist
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-medium relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link href="/signin" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-medium relative group">
                Sign In
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-20 pb-16 overflow-hidden opacity-0 translate-y-8 transition-all duration-1000 ease-out">
        {/* Scrolling marquee text */}
        <div className="absolute top-24 left-0 w-full overflow-hidden pointer-events-none">
          <div className="flex whitespace-nowrap animate-marquee text-8xl font-bold text-gray-100 dark:text-gray-800 opacity-30">
            <span className="mx-8">CASHBOOK • MANAGEMENT • ANALYTICS • REPORTS •</span>
            <span className="mx-8">CASHBOOK • MANAGEMENT • ANALYTICS • REPORTS •</span>
            <span className="mx-8">CASHBOOK • MANAGEMENT • ANALYTICS • REPORTS •</span>
          </div>
        </div>

        {/* Background gradient with animated particles */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          {/* Floating particles */}
          <div className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-float-slow" style={{top: '20%', left: '10%'}}></div>
          <div className="absolute w-1 h-1 bg-blue-500 rounded-full opacity-30 animate-float-medium" style={{top: '60%', left: '80%'}}></div>
          <div className="absolute w-3 h-3 bg-slate-400 rounded-full opacity-15 animate-float-fast" style={{top: '40%', left: '20%'}}></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 border border-blue-200 dark:border-blue-700 opacity-0 translate-y-4 animate-fade-in-up animation-delay-200 hover:scale-105 transition-transform duration-300">
              <Zap size={16} className="mr-2 animate-pulse" />
              Trusted by small businesses worldwide
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 opacity-0 translate-y-6 animate-fade-in-up animation-delay-400">
              <span className="block opacity-0 translate-y-4 animate-fade-in-up animation-delay-500">A financial revolution</span>
              <span className="block bg-gradient-to-r from-blue-600 via-blue-700 to-slate-700 bg-clip-text text-transparent opacity-0 translate-y-4 animate-fade-in-up animation-delay-700">
                for modern businesses
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed opacity-0 translate-y-4 animate-fade-in-up animation-delay-1100">
              Track income and expenses effortlessly, generate insightful reports, and streamline your financial workflow with our intuitive cashbook management platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 opacity-0 translate-y-4 animate-fade-in-up animation-delay-1300">
              <Link href="/signup">
                <button className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden">
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </button>
              </Link>
            </div>
            
            {/* Scroll indicator */}
            <div className="opacity-0 translate-y-4 animate-fade-in-up animation-delay-1500">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Scroll to Explore</p>
              <div className="mx-auto w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 bg-white dark:bg-slate-900 opacity-0 translate-y-8 transition-all duration-1000 ease-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 opacity-0 translate-y-4 animate-fade-in-up animation-delay-100">
              — FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 opacity-0 translate-y-4 animate-fade-in-up animation-delay-200">
              Financial management,<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">reimagined</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-4 animate-fade-in-up animation-delay-400">
              Powerful features designed to simplify your cashbook management and provide actionable insights for better financial decisions.
            </p>
          </div>

          {/* Numbered feature progression */}
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-600 opacity-20"></div>
            
            <div className="space-y-24">
              {[
                {
                  number: "01",
                  icon: <DollarSign size={32} />,
                  title: "Smart Transaction Logging",
                  description: "Effortlessly record income and expenses with intelligent categorization and automated suggestions.",
                  gradient: "from-emerald-400 to-green-500",
                  features: ["Auto-categorization", "Automated Recurring Entries", "Smart Notifications", "Bulk import"]
                },
                {
                  number: "02",
                  icon: <BarChart size={32} />,
                  title: "Analytics",
                  description: "Generate comprehensive reports with interactive charts and real-time financial insights. Transform your data into actionable business intelligence.",
                  gradient: "from-blue-400 to-cyan-500",
                  features: ["Real-time dashboards", "Custom reports", "Export options"]
                },
                {
                  number: "03",
                  icon: <CreditCard size={32} />,
                  title: "Multi-Currency Support",
                  description: "Handle transactions in multiple currencies with automatic conversion and exchange rate tracking. Perfect for global businesses and international transactions.",
                  gradient: "from-purple-400 to-indigo-500",
                  features: ["Auto conversion", "Live exchange rates", "Global support"]
                }
              ].map((feature, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-start gap-12 opacity-0 translate-y-8 animate-fade-in-up`} style={{animationDelay: `${600 + index * 200}ms`}}>
                  {/* Number and icon */}
                  <div className="flex-shrink-0 flex items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-gray-100 shadow-lg">
                        {feature.number}
                      </div>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 group">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Feature list */}
                    <div className="grid grid-cols-2 gap-3">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2 group/item">
                          <CheckCircle size={16} className="text-green-500 group-hover/item:scale-110 transition-transform duration-300" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-gray-100 transition-colors duration-300">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue exploring */}
          <div className="text-center mt-20 opacity-0 translate-y-4 animate-fade-in-up animation-delay-1400">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">( Keep Exploring )</div>
            <div className="flex justify-center space-x-2">
              {Array.from({length: 6}, (_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'} transition-colors duration-300`}></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      {/* <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              — WATCH IT IN ACTION
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              See how easy it is to<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">manage your finances</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Watch our 2-minute demo to see how Cashbook Assist simplifies your financial workflow
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-blue-700 transition-colors duration-300 group-hover:scale-110">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-lg shadow-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-32 h-6 bg-blue-200 dark:bg-blue-800 rounded"></div>
                      <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="h-16 bg-green-100 dark:bg-green-900 rounded"></div>
                      <div className="h-16 bg-blue-100 dark:bg-blue-900 rounded"></div>
                      <div className="h-16 bg-purple-100 dark:bg-purple-900 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Complete Walkthrough: From Setup to Reports
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Learn how to set up your account, add transactions, and generate insights in under 5 minutes
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      2:34
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      HD Quality
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Quick Setup</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get started in minutes with our guided onboarding process</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Real-time Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">See your financial health with live dashboards and analytics</p>
              </div>
             </div>
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              — TESTIMONIALS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Trusted by thousands of<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">business owners</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See what our customers are saying about how Cashbook Assist has transformed their financial management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chigukwa",
                role: "Small Business Owner",
                company: "Bloom Café",
                content: "Cashbook Assist has completely transformed how I manage my café's finances. The insights help me make better business decisions.",
                rating: 5,
                avatar: "SC"
              },
              {
                name: "Michael Rodriguez",
                role: "Freelance Consultant",
                company: "Rodriguez Consulting",
                content: "As a freelancer juggling multiple clients, tracking expenses was a nightmare. Now I can see exactly where my money goes and generate professional reports.",
                rating: 5,
                avatar: "MR"
              },
              {
                name: "Tanaka Moyo",
                role: "Retail Store Manager",
                company: "Park's Electronics",
                content: "I no longer have to use manual cashbooks, and this has helped me remotely monitor my finances.",
                rating: 5,
                avatar: "JP"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  {Array.from({length: testimonial.rating}, (_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              — FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Frequently asked<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">questions</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about Cashbook Assist
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How secure is my financial data?",
                answer: "We use encryption to protect your data both in transit and at rest. Our servers are hosted on secure cloud infrastructure with regular security audits and compliance with industry standards."
              },
              {
                question: "Can I import data from my existing accounting software?",
                answer: "Yes! Cashbook Assist supports importing data from popular formats including CSV, Excel, and API protocol. Our import wizard makes the process simple and error-free."
              },
              {
                question: "Is there a mobile app available?",
                answer: "Absolutely! Our mobile app is available for both iOS and Android devices. You can track expenses, income and view reports on the go with full synchronization across all your devices."
              },
              {
                question: "What kind of support do you provide?",
                answer: "We offer comprehensive support including email support for all plans, priority support for annual subscribers, and dedicated account management for enterprise customers. We also have extensive documentation and video tutorials."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. You'll continue to have access to your account until the end of your billing period."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Still have questions?
            </p>
            <a
              href="mailto:support@shsoftwares.com?subject=Questions about Cashbook Assist"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 opacity-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to transform your<br />
            financial management?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of business owners who have already streamlined their cashbook management with our powerful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Free Trial
              </button>
            </Link>
            <a
              href="/how-it-works" // link to how it works page
              className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              How it works
            </a>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center">
              <CheckCircle size={20} className="mr-2" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle size={20} className="mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle size={20} className="mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} id="pricing" className="py-20 bg-gray-50 dark:bg-slate-800 opacity-0 translate-y-8 transition-all duration-1000 ease-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 opacity-0 translate-y-4 animate-fade-in-up animation-delay-200">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-4 animate-fade-in-up animation-delay-400">
              Choose the perfect plan for your business. No hidden fees, no surprises. Enjoy a 7 day free trial on all plans (canceallable anytime).
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Monthly Plan */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group opacity-0 translate-y-8 animate-fade-in-up animation-delay-600 overflow-hidden">
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Monthly
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Perfect for growing businesses
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">$3.99</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 relative">
                {[
                  "Unlimited Transactions",
                  "Advanced Reports & Analytics",
                  "Multi-Currency Support",
                  "Email Support",
                  "Mobile & Web Access"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center group/item">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" size={20} />
                    <span className="text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-gray-100 transition-colors duration-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href='/signup?plan=monthly&sys=cashbook' className="block relative">
                <button className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl relative overflow-hidden group/btn">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                </button>
              </Link>
            </div>

            {/* Annual Plan - Popular */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500 p-8 shadow-2xl scale-105 group opacity-0 translate-y-8 animate-fade-in-up animation-delay-800 overflow-hidden hover:-translate-y-2 transition-all duration-500">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                  Most Popular
                </span>
              </div>
              
              {/* Premium glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl"></div>
              
              <div className="relative mb-8 pt-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300">
                  Annual
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Best value for established businesses
                </p>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300">$39.99</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/year</span>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-medium group-hover:scale-110 transition-transform duration-300">
                  Save 17% vs monthly
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 relative">
                {[
                  "Everything in Monthly",
                  "Priority Support",
                  "Advanced Integrations",
                  "Custom Reports",
                  "Data Export Options"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center group/item">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" size={20} />
                    <span className="text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-gray-100 transition-colors duration-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href='/signup?plan=annual&sys=cashbook' className="block relative">
                <button className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 relative overflow-hidden group/btn">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                </button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group opacity-0 translate-y-8 animate-fade-in-up animation-delay-1000 overflow-hidden">
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  Enterprise
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  For large organizations with custom needs
                </p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Custom</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 relative">
                {[
                  "Everything in Annual",
                  "Unlimited Users",
                  "Dedicated Account Manager",
                  "API Access",
                  "Custom Integrations",
                  "SLA Guarantee"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center group/item">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" size={20} />
                    <span className="text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-gray-100 transition-colors duration-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <a
                href="mailto:info@shsoftwares.com?subject=Enterprise plan for cashbook assist"
                target="_blank"
                rel="noopener noreferrer"
                className="block relative"
              >
                <button className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl relative overflow-hidden group/btn">
                  <span className="relative z-10">Contact Sales</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">Cashbook Assist</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Streamline your financial management with our powerful, intuitive cashbook platform designed for modern businesses.
              </p>
              <div className="flex space-x-4">
                <Link href="/signup">
                  <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                    Get Started Free
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/signin" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:support@shsoftwares.com?subject=Support request for cashbook assist"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/application/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/application/terms-of-use" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:info@shsoftwares.com?subject=Enterprise plan for cashbook assist"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact Sales
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 Silverhouse Softwares. All rights reserved.
              </p>
              <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
                {/* Social Media Links */}
                <div className="flex items-center space-x-4">
                  <a
                    href="https://www.youtube.com/@shsoftwares"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-500 transition-colors duration-300 transform hover:scale-110"
                    aria-label="YouTube"
                  >
                    <YouTubeIcon size={20} />
                  </a>
                  <a
                    href="https://www.facebook.com/shsoftwares"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors duration-300 transform hover:scale-110"
                    aria-label="Facebook"
                  >
                    <FacebookIcon size={20} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@shsoftwares"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110"
                    aria-label="TikTok"
                  >
                    <TikTokIcon size={20} />
                  </a>
                  <a
                    href="https://www.instagram.com/shsoftwares"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-500 transition-colors duration-300 transform hover:scale-110"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={20} />
                  </a>
                  <a
                    href="https://x.com/shsoftwares"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110"
                    aria-label="X (formerly Twitter)"
                  >
                    <XIcon size={20} />
                  </a>
                </div>
                <span className="text-gray-400 text-sm">Built with ❤️ for modern businesses</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

        <div className="fixed bottom-6 right-6 z-50">
            <ThemeTogglerTwo />
        </div>

        {/* Custom CSS Animations */}
        <style jsx>{`
          .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-100%);
            }
          }

          @keyframes float-slow {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
          }

          @keyframes float-medium {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            50% {
              transform: translateY(-15px) translateX(-8px);
            }
          }

          @keyframes float-fast {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            50% {
              transform: translateY(-25px) translateX(5px);
            }
          }

          .animate-marquee {
            animation: marquee 30s linear infinite;
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }

          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }

          .animate-float-medium {
            animation: float-medium 6s ease-in-out infinite;
          }

          .animate-float-fast {
            animation: float-fast 4s ease-in-out infinite;
          }

          .animation-delay-100 {
            animation-delay: 100ms;
          }

          .animation-delay-200 {
            animation-delay: 200ms;
          }

          .animation-delay-400 {
            animation-delay: 400ms;
          }

          .animation-delay-600 {
            animation-delay: 600ms;
          }

          .animation-delay-700 {
            animation-delay: 700ms;
          }

          .animation-delay-800 {
            animation-delay: 800ms;
          }

          .animation-delay-900 {
            animation-delay: 900ms;
          }

          .animation-delay-1000 {
            animation-delay: 1000ms;
          }

          .animation-delay-1100 {
            animation-delay: 1100ms;
          }

          .animation-delay-1300 {
            animation-delay: 1300ms;
          }

          .animation-delay-1400 {
            animation-delay: 1400ms;
          }

          .animation-delay-1500 {
            animation-delay: 1500ms;
          }

          /* Scroll-triggered animations will be visible */
          .opacity-0 {
            opacity: 0;
          }

          /* Grid pattern */
          .bg-grid-slate-100 {
            background-image: radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0);
            background-size: 20px 20px;
          }

          .dark .bg-grid-slate-700\\/25 {
            background-image: radial-gradient(circle at 1px 1px, rgb(51 65 85 / 0.25) 1px, transparent 0);
            background-size: 20px 20px;
          }
        `}</style>
    </div>
  );
}