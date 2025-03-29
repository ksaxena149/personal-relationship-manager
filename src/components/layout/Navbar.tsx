'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Get theme preference from localStorage or default to dark
    const theme = localStorage.getItem('theme') || 'dark';
    setIsDarkMode(theme === 'dark');

    // Listen for storage events (when localStorage changes)
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      setIsLoggedIn(!!currentToken);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Create a custom event listener for login state changes
    const handleLoginStateChange = () => {
      const currentToken = localStorage.getItem('token');
      setIsLoggedIn(!!currentToken);
    };
    
    window.addEventListener('loginStateChanged', handleLoginStateChange);
    
    // Check login status periodically
    const checkLoginInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      setIsLoggedIn(!!currentToken);
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStateChanged', handleLoginStateChange);
      clearInterval(checkLoginInterval);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    // Apply theme to body
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/auth/login';
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    } else {
      router.push('/search');
      setIsSearchOpen(false);
    }
  };

  // Don't show navbar on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  return (
    <nav className="bg-purple-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="PRM Logo" width={32} height={32} />
                <span className="text-xl font-bold">PRM</span>
              </Link>
            </div>
            {isLoggedIn && (
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/dashboard'
                      ? 'bg-purple-800 text-white'
                      : 'text-gray-300 hover:bg-purple-700 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/contacts"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/contacts' || pathname.startsWith('/contacts/')
                      ? 'bg-purple-800 text-white'
                      : 'text-gray-300 hover:bg-purple-700 hover:text-white'
                  }`}
                >
                  Contacts
                </Link>
                <Link
                  href="/reminders"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/reminders'
                      ? 'bg-purple-800 text-white'
                      : 'text-gray-300 hover:bg-purple-700 hover:text-white'
                  }`}
                >
                  Reminders
                </Link>
                <Link
                  href="/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/settings'
                      ? 'bg-purple-800 text-white'
                      : 'text-gray-300 hover:bg-purple-700 hover:text-white'
                  }`}
                >
                  Settings
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {isLoggedIn && (
              <>
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center mr-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="py-1 px-2 text-sm bg-purple-800 text-white rounded-md border border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      placeholder="Search..."
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="ml-1 p-1 rounded-md hover:bg-purple-700"
                      aria-label="Submit search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-1 p-1 rounded-md hover:bg-purple-700"
                      aria-label="Close search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-md text-gray-300 hover:bg-purple-700 hover:text-white mr-2"
                    aria-label="Open search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-300 hover:bg-purple-700 hover:text-white"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-purple-700 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-purple-700 hover:text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 