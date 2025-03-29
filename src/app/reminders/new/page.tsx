'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { reminderService } from '@/utils/reminders/notificationService';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewReminderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    contactId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [success, setSuccess] = useState('');

  // Fetch contacts when the component mounts
  useEffect(() => {
    async function fetchContacts() {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('You must be logged in to create reminders');
          setLoadingContacts(false);
          return;
        }
        
        const response = await fetch('/api/contacts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        
        const data = await response.json();
        setContacts(data.data || []);
      } catch (err: any) {
        console.error('Error fetching contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    }

    fetchContacts();
    
    // Start the reminder service to ensure notifications are active
    reminderService.startChecking();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to create reminders');
      }
      
      // Combine date and time into ISO string
      const reminderDate = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}:00`)
        : new Date(`${formData.date}T00:00:00`);

      // Create request body
      const requestBody = {
        contactId: formData.contactId || null,
        reminderDate: reminderDate.toISOString(),
        description: formData.description || formData.title,
        isRecurring: false
      };

      // Call the API
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create reminder');
      }
      
      // Set success message
      setSuccess('Reminder created successfully! You will receive a sound notification when it is due.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        contactId: '',
      });
      
      // Force refresh of reminders in the service
      reminderService.startChecking();
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/reminders');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date formatted as YYYY-MM-DD for min date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Set New Reminder</h1>
        <Link 
          href="/reminders" 
          className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-400 text-blue-700 dark:text-blue-300 px-4 py-3 rounded mb-4">
          <p className="flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            You will receive a sound notification when your reminder is due, even if you navigate away from this page.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                min={today}
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium">
                Time
              </label>
              <input
                type="time"
                name="time"
                id="time"
                value={formData.time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="contactId" className="block text-sm font-medium">
                Related Contact (Optional)
              </label>
              <select
                id="contactId"
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 sm:text-sm"
              >
                <option value="">None</option>
                {loadingContacts ? (
                  <option disabled>Loading contacts...</option>
                ) : (
                  contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 sm:text-sm"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}