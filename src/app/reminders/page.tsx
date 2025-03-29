'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contact {
  firstName: string;
  lastName: string;
}

interface Reminder {
  id: string;
  reminderDate: string;
  description: string;
  contactId: string | null;
  contact?: Contact;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReminders() {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('You must be logged in to view reminders');
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/reminders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch reminders');
        }
        
        const data = await response.json();
        setReminders(data.data || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching reminders');
        console.error('Error fetching reminders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReminders();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reminders</h1>
        <Link 
          href="/reminders/new" 
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm"
        >
          Set Reminder
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {loading ? (
          <div className="text-center py-10">
            <p>Loading reminders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">No reminders yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Set up your first reminder to stay on top of important dates.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <Link href={`/reminders/${reminder.id}`} className="block">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-lg">
                      {reminder.description}
                    </h3>
                    <p className="text-purple-600 dark:text-purple-400">
                      {formatDate(reminder.reminderDate)}
                    </p>
                  </div>
                  {reminder.contact && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      For: {reminder.contact.firstName} {reminder.contact.lastName}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 