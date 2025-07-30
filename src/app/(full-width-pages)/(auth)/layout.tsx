import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import ClientProviders from "@/context/reduxProviderContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import '../../globals.css'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ClientProviders>
        <div className="relative flex lg:flex-row w-full min-h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full min-h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/cashbook-assist/dashboard" className="block mb-4">
                  <Image
                    width={231}
                    height={48}
                    src="./favicon.svg"
                    className="rounded-4xl"
                    alt="Cashbook Assist App Logo"
                  />
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Cashbook Assist. Take charge of your finances.
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ClientProviders>
    </div>
  );
}
