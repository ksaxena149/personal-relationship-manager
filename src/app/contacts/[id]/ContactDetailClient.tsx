'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileImage from '@/components/ui/ProfileImage';

interface Note {
  id: number;
  note: string;
  interactionDate: string | null;
  createdAt: string;
}

interface Reminder {
  id: number;
  reminderDate: string;
  description: string;
  isRecurring: boolean;
}

interface Contact {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  birthday: string | null;
  profileImage: string | null;
  notes: Note[];
  reminders: Reminder[];
}

export default function ContactDetailClient({ contactId }: { contactId: string }) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    async function fetchContactDetails() {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        const response = await fetch(`/api/contacts/${contactId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Contact not found');
          }
          throw new Error('Failed to fetch contact details');
        }
        
        const data = await response.json();
        setContact(data.data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching contact details');
        console.error('Error fetching contact details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContactDetails();
  }, [contactId, router]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteContact = async () => {
    if (!confirm('Are you sure you want to delete this contact? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
      
      router.push('/contacts');
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the contact');
      console.error('Error deleting contact:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading contact details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Link 
          href="/contacts" 
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm"
        >
          Back to Contacts
        </Link>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg mb-4">Contact not found</p>
        <Link 
          href="/contacts" 
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm"
        >
          Back to Contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <ProfileImage 
            src={contact.profileImage} 
            alt={`${contact.firstName} ${contact.lastName || ''}`} 
            size="lg"
            className="mr-6" 
          />
          <h1 className="text-3xl font-bold">
            {contact.firstName} {contact.lastName}
          </h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm"
          >
            Edit Contact
          </Link>
          <button
            onClick={handleDeleteContact}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="bg-[var(--card-bg)] shadow rounded-lg p-6 mb-6 border border-[var(--card-border)]">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium">{contact.email || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Phone</p>
            <p className="font-medium">{contact.phoneNumber || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Address</p>
            <p className="font-medium">{contact.address || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Birthday</p>
            <p className="font-medium">{contact.birthday ? formatDate(contact.birthday) : 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {contact.notes && contact.notes.length > 0 && (
        <div className="bg-[var(--card-bg)] shadow rounded-lg p-6 mb-6 border border-[var(--card-border)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Notes</h2>
            <Link
              href={`/contacts/${contact.id}/notes/new`}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
            >
              Add Note
            </Link>
          </div>
          <div className="space-y-4">
            {contact.notes.map((note) => (
              <div key={note.id} className="border-b border-[var(--card-border)] pb-4 last:border-0">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {note.interactionDate ? `Interaction on ${formatDate(note.interactionDate)}` : formatDate(note.createdAt)}
                  </span>
                  <Link 
                    href={`/contacts/${contact.id}/notes/${note.id}/edit`}
                    className="text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
                  >
                    Edit
                  </Link>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{note.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders Section */}
      {contact.reminders && contact.reminders.length > 0 && (
        <div className="bg-[var(--card-bg)] shadow rounded-lg p-6 mb-6 border border-[var(--card-border)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Reminders</h2>
            <Link
              href={`/reminders/new?contactId=${contact.id}`}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
            >
              Add Reminder
            </Link>
          </div>
          <div className="space-y-4">
            {contact.reminders.map((reminder) => (
              <div key={reminder.id} className="flex justify-between items-start border-b border-[var(--card-border)] pb-4 last:border-0">
                <div>
                  <p className="font-medium">{formatDate(reminder.reminderDate)}</p>
                  <p className="text-gray-500 dark:text-gray-300">{reminder.description}</p>
                  {reminder.isRecurring && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                      Recurring
                    </span>
                  )}
                </div>
                <Link
                  href={`/reminders/${reminder.id}/edit`}
                  className="text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 