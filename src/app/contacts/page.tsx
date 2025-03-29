'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  birthday?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchContacts() {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('You must be logged in to view contacts');
          setLoading(false);
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
        setError(err.message || 'An error occurred while fetching contacts');
        console.error('Error fetching contacts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Link 
          href="/contacts/new" 
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm"
        >
          Add Contact
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {loading ? (
          <div className="text-center py-10">
            <p>Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">No contacts yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Get started by adding your first contact.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <Link href={`/contacts/${contact.id}`} className="block">
                  <h3 className="font-medium text-lg">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  {contact.email && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {contact.email}
                    </p>
                  )}
                  {contact.phoneNumber && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {contact.phoneNumber}
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