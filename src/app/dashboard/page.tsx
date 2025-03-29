'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Contact {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string | null;
}

interface Reminder {
  id: number;
  reminderDate: string;
  description: string;
  contact: {
    firstName: string;
    lastName: string | null;
  } | null;
}

export default function Dashboard() {
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch data
    const fetchData = async () => {
      try {
        // Fetch recent contacts
        const contactsResponse = await fetch('/api/contacts?limit=5', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!contactsResponse.ok) {
          if (contactsResponse.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch contacts');
        }

        const contactsData = await contactsResponse.json();
        setRecentContacts(contactsData.data || []);

        // Fetch upcoming reminders
        const remindersResponse = await fetch('/api/reminders?limit=5', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!remindersResponse.ok) {
          throw new Error('Failed to fetch reminders');
        }

        const remindersData = await remindersResponse.json();
        setUpcomingReminders(remindersData.data || []);

      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Contacts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Contacts</h2>
            <Link
              href="/contacts"
              className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              View all
            </Link>
          </div>

          {recentContacts.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentContacts.map((contact) => (
                <li key={contact.id} className="py-3">
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 py-2 rounded-md"
                  >
                    <div className="flex-shrink-0 bg-purple-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-semibold">
                      {contact.firstName.charAt(0)}
                      {contact.lastName ? contact.lastName.charAt(0) : ''}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </p>
                      {contact.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.email}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-4">
              No contacts yet.{' '}
              <Link
                href="/contacts/new"
                className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Add your first contact
              </Link>
            </p>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Reminders</h2>
            <Link
              href="/reminders"
              className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              View all
            </Link>
          </div>

          {upcomingReminders.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingReminders.map((reminder) => (
                <li key={reminder.id} className="py-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">{reminder.description}</p>
                      <div className="flex text-sm">
                        <p className="text-gray-500 dark:text-gray-400">
                          {formatDate(reminder.reminderDate)}
                        </p>
                        {reminder.contact && (
                          <>
                            <span className="mx-2 text-gray-500 dark:text-gray-400">
                              •
                            </span>
                            <p className="text-gray-500 dark:text-gray-400">
                              {reminder.contact.firstName}{' '}
                              {reminder.contact.lastName}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-4">
              No reminders yet.{' '}
              <Link
                href="/reminders/new"
                className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Set a reminder
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/contacts/new"
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Add Contact</span>
          </Link>

          <Link
            href="/reminders/new"
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Set Reminder</span>
          </Link>

          <Link
            href="/search"
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Search</span>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}