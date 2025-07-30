// src/app/layout.tsx
import './globals.css';
import { Outfit } from 'next/font/google';
import ClientProviders from '@/context/reduxProviderContext';
import {Toaster} from 'react-hot-toast';
import ProgressBar from "@/components/ui/progress/progressBar";

const outfit = Outfit({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ClientProviders>
          <ProgressBar />
           {children}
          <Toaster
            position="bottom-right"
            />
        </ClientProviders>
      </body>
    </html>
  );
}
