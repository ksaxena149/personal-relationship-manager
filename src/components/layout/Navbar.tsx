'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import ProfileImage from '@/components/ui/ProfileImage';
import { reminderService, Reminder } from '@/utils/reminders/notificationService';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  profileImage: string | null;
}

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const [showReminderDropdown, setShowReminderDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    const isCurrentlyLoggedIn = !!token;
    setIsLoggedIn(isCurrentlyLoggedIn);

    // Fetch user data if logged in
    if (isCurrentlyLoggedIn && !user) {
      fetchUserData();
    }

    // Get theme preference from localStorage or default to dark
    const theme = localStorage.getItem('theme') || 'dark';
    setIsDarkMode(theme === 'dark');
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Listen for storage events (when localStorage changes)
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      const isCurrentlyLoggedIn = !!currentToken;
      setIsLoggedIn(isCurrentlyLoggedIn);
      
      if (isCurrentlyLoggedIn && !user) {
        fetchUserData();
      } else if (!isCurrentlyLoggedIn) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Create a custom event listener for login state changes
    const handleLoginStateChange = () => {
      const currentToken = localStorage.getItem('token');
      const isCurrentlyLoggedIn = !!currentToken;
      setIsLoggedIn(isCurrentlyLoggedIn);
      
      if (isCurrentlyLoggedIn && !user) {
        fetchUserData();
      } else if (!isCurrentlyLoggedIn) {
        setUser(null);
      }
    };
    
    // Listen for profile updates from the settings page
    const handleProfileUpdate = (event: any) => {
      if (event.detail && event.detail.userData) {
        setUser(event.detail.userData);
      }
    };
    
    window.addEventListener('loginStateChanged', handleLoginStateChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    // Set up reminder notification service
    if (isCurrentlyLoggedIn) {
      // Subscribe to due reminders
      const unsubscribe = reminderService.subscribeToDueReminders((reminders) => {
        setDueReminders(prevReminders => {
          // Add new reminders to the list
          const newReminders = [...prevReminders];
          
          reminders.forEach(reminder => {
            if (!newReminders.some(r => r.id === reminder.id)) {
              newReminders.push(reminder);
            }
          });
          
          return newReminders;
        });
      });
      
      // Start checking for reminders
      reminderService.startChecking();
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('loginStateChanged', handleLoginStateChange);
        window.removeEventListener('profileUpdated', handleProfileUpdate);
        unsubscribe();
        reminderService.stopChecking();
      };
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStateChanged', handleLoginStateChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]); // Only depend on user, not isLoggedIn

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
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

  const handleReminderClick = (reminderId: number) => {
    // Mark the reminder as read
    reminderService.markAsRead(reminderId);
    
    // Update the list of due reminders
    setDueReminders(prevReminders => 
      prevReminders.filter(reminder => reminder.id !== reminderId)
    );
    
    // Navigate to reminders page
    router.push('/reminders');
    
    // Close the dropdown
    setShowReminderDropdown(false);
  };

  const handleCompleteReminder = async (reminderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const success = await reminderService.completeReminder(reminderId);
      if (success) {
        // Update the list of due reminders
        setDueReminders(prevReminders =>
          prevReminders.filter(reminder => reminder.id !== reminderId)
        );
        
        toast.success('Reminder marked as completed');
      } else {
        toast.error('Failed to complete reminder');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  // Don't show navbar on auth pages
  if (pathname.startsWith('/auth/')) {
    return null;
  }

  return (
    <>
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

                  {/* Notifications Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setShowReminderDropdown(!showReminderDropdown)}
                      className="p-2 rounded-md text-gray-300 hover:bg-purple-700 hover:text-white mr-2 relative"
                      aria-label="Notifications"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      {dueReminders.length > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {dueReminders.length}
                        </span>
                      )}
                    </button>

                    {showReminderDropdown && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden">
                        <div className="py-2 px-4 bg-purple-800 text-white font-medium">
                          Reminders ({dueReminders.length})
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {dueReminders.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                              {dueReminders.map((reminder) => (
                                <li 
                                  key={reminder.id} 
                                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleReminderClick(reminder.id)}
                                >
                                  <div className="text-sm font-medium text-gray-900">{reminder.description}</div>
                                  <div className="text-xs text-gray-500">
                                    {reminder.contact && (
                                      <span className="mr-2">
                                        {reminder.contact.firstName} {reminder.contact.lastName || ''}
                                      </span>
                                    )}
                                    <span>
                                      {new Date(reminder.reminderDate).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex justify-end space-x-2">
                                    <button
                                      onClick={(e) => handleCompleteReminder(reminder.id, e)}
                                      className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 hover:bg-green-200"
                                    >
                                      Complete
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">No new reminders</div>
                          )}
                        </div>
                        <div className="py-2 px-4 bg-gray-50 text-right">
                          <button 
                            onClick={() => {
                              router.push('/reminders');
                              setShowReminderDropdown(false);
                            }}
                            className="text-sm text-purple-600 hover:text-purple-800"
                          >
                            View all reminders
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md text-gray-300 hover:bg-purple-700 hover:text-white mr-2"
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

                  <Link
                    href="/settings"
                    className="flex items-center p-1 rounded-md hover:bg-purple-700 mr-2"
                    title="Settings"
                  >
                    <ProfileImage 
                      src={user?.profileImage || null} 
                      alt={user?.firstName || 'User'} 
                      size="sm" 
                    />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md text-gray-300 hover:bg-purple-700 hover:text-white"
                    title="Log out"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V9a1 1 0 00-1-1h-3a1 1 0 010-2h3a3 3 0 013 3v10a3 3 0 01-3 3H3a3 3 0 01-3-3V4a3 3 0 013-3h10a3 3 0 013 3v1a1 1 0 01-2 0V4a1 1 0 00-1-1H3zm12.293 7.293a1 1 0 10-1.414 1.414L15.586 13H9a1 1 0 100 2h6.586l-1.707 1.707a1 1 0 101.414 1.414l3.707-3.707a1 1 0 000-1.414l-3.707-3.707z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              )}
              {!isLoggedIn && (
                <div className="flex space-x-2">
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-purple-700 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-purple-700 hover:text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
} 