'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import ProfileImage from '@/components/ui/ProfileImage';
import { relationshipTypes } from '@/utils/relationshipConfig';

interface Contact {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string | null;
  profileImage: string | null;
  relationshipType?: string | null;
  lastInteractionDate?: string | null;
  customInteractionDays?: number | null;
}

interface Reminder {
  id: number;
  reminderDate: string;
  description: string;
  contact: {
    firstName: string;
    lastName: string | null;
    profileImage: string;
    relationshipType: string | null;
    lastInteractionDate: string;
    customInteractionDays: number | null;
  } | null;
}

interface ContactWithRelationship extends Contact {
  relationshipType: string | null;
  lastInteractionDate: string | null;
  customInteractionDays: number | null;
}

export default function Dashboard() {
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [interactionReminders, setInteractionReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingReminders, setIsGeneratingReminders] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to fetch recent contacts
  const fetchRecentContacts = async (token: string) => {
    try {
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
    } catch (err) {
      console.error('Error fetching recent contacts:', err);
    }
  };

  // Function to fetch upcoming reminders
  const fetchUpcomingReminders = async (token: string) => {
    try {
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
    } catch (err) {
      console.error('Error fetching upcoming reminders:', err);
    }
  };

  // Function to fetch interaction reminders
  const fetchInteractionReminders = async (token: string) => {
    try {
      const response = await fetch('/api/reminders?type=interaction', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInteractionReminders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching interaction reminders:', error);
    }
  };

  // Combined function to fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch all data in parallel
      await Promise.all([
        fetchRecentContacts(token),
        fetchUpcomingReminders(token),
        fetchInteractionReminders(token)
      ]);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Set up a refresh interval every minute (optional)
    const refreshInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchRecentContacts(token);
      }
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const generateRelationshipReminders = async () => {
    setIsGeneratingReminders(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch('/api/relationship-reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Generated ${data.data.length} reminders`);
        
        // Reload reminders and contact data
        await fetchInteractionReminders(token);
        await fetchRecentContacts(token);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate reminders');
      }
    } catch (error) {
      console.error('Error generating reminders:', error);
      toast.error('Failed to generate reminders');
    } finally {
      setIsGeneratingReminders(false);
    }
  };
  
  const completeReminder = async (reminderId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`/api/reminders/${reminderId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Reminder marked as complete');
        
        // Reload reminders and contact data
        await fetchInteractionReminders(token);
        await fetchRecentContacts(token);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete reminder');
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
      toast.error('Failed to complete reminder');
    }
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
        <div className="shadow rounded-lg p-6 bg-[var(--card-bg)] border border-[var(--card-border)]">
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
            <div className="space-y-4">
              {recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  <div className="flex-shrink-0 bg-purple-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-semibold">
                    {contact.firstName.charAt(0)}
                    {contact.lastName ? contact.lastName.charAt(0) : ''}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    {contact.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contact.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Add interaction status indicator */}
                  {contact.relationshipType && contact.lastInteractionDate && (
                    <InteractionStatus contact={contact} />
                  )}
                </Link>
              ))}
            </div>
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
        <div className="shadow rounded-lg p-6 bg-[var(--card-bg)] border border-[var(--card-border)]">
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
      <div className="shadow rounded-lg p-6 mt-8 bg-[var(--card-bg)] border border-[var(--card-border)]">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/contacts/new"
            className="flex flex-col items-center p-4 border border-[var(--card-border)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
            className="flex flex-col items-center p-4 border border-[var(--card-border)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
            className="flex flex-col items-center p-4 border border-[var(--card-border)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
            className="flex flex-col items-center p-4 border border-[var(--card-border)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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

// Add this new component for interaction status
function InteractionStatus({ contact }: { contact: Contact }) {
  // Calculate days since last interaction
  if (!contact.relationshipType || !contact.lastInteractionDate) return null;
  
  const lastInteraction = new Date(contact.lastInteractionDate);
  const today = new Date();
  const daysSinceInteraction = Math.floor((today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get recommended interaction days based on relationship type
  let recommendedDays = 0;
  
  if (contact.customInteractionDays && contact.customInteractionDays > 0) {
    recommendedDays = contact.customInteractionDays;
  } else if (contact.relationshipType) {
    const relationshipType = relationshipTypes.find(type => type.id === contact.relationshipType);
    if (relationshipType) {
      recommendedDays = relationshipType.recommendedInteractionDays;
    }
  }
  
  if (recommendedDays <= 0) return null;
  
  // Determine status
  let statusColor = '';
  let statusText = '';
  
  if (daysSinceInteraction === 0) {
    statusColor = 'bg-green-500';
    statusText = 'Today';
  } else if (daysSinceInteraction > recommendedDays) {
    statusColor = 'bg-red-500';
    statusText = `${daysSinceInteraction}d`;
  } else if (daysSinceInteraction > (recommendedDays * 0.7)) {
    statusColor = 'bg-yellow-500';
    statusText = `${daysSinceInteraction}d`;
  } else {
    statusColor = 'bg-blue-500';
    statusText = `${daysSinceInteraction}d`;
  }
  
  return (
    <div className="ml-auto">
      <span className={`${statusColor} text-white text-xs px-2 py-1 rounded-full`} title={`${daysSinceInteraction} days since last interaction`}>
        {statusText}
      </span>
    </div>
  );
}