import React from 'react';
import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 bg-white dark:bg-black text-gray-900 dark:text-gray-100">
        {children}
      </main>
    </>
  );
};

export default AppLayout; 