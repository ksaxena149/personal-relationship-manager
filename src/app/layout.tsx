import Navbar from '@/components/layout/Navbar';
import { Toaster } from "react-hot-toast";
import "./globals.css";
import type { Metadata } from 'next';
import ThemeInitializer from '@/components/ThemeInitializer';

const inter = { variable: '--font-inter', className: 'font-sans' };

export const metadata: Metadata = {
  title: "Personal Relationship Manager",
  description: "Keep track of important people and events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <ThemeInitializer />
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
