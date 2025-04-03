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
  // Since this is a server component, we need a different approach
  // We'll use pathname directly in the component to determine when to show the navbar
  
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
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
        {/* The NavbarWrapper is handled inside individual pages */}
        {children}
      </body>
    </html>
  );
}
