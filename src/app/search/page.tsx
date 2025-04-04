'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Note {
  id: number;
  note: string;
}

interface Contact {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  notes?: Note[];
}

interface NoteWithContact {
  id: number;
  note: string;
  contact: {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
}

interface Reminder {
  id: number;
  description: string;
  reminderDate: string;
  contact: {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string | null;
  } | null;
}

// Create a client component that uses searchParams
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notes, setNotes] = useState<NoteWithContact[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Authentication token not found');
      return;
    }
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data.data.contacts || []);
        setNotes(data.data.notes || []);
        setReminders(data.data.reminders || []);
      } else {
        console.error('Search failed:', await response.text());
      }
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Search</h1>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts, notes, reminders..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
      ) : hasSearched ? (
        <div className="space-y-8">
          {contacts.length === 0 && notes.length === 0 && reminders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {contacts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Contacts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contacts.map((contact) => (
                      <Link 
                        href={`/contacts/${contact.id}`}
                        key={contact.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <h3 className="font-medium">{contact.firstName} {contact.lastName}</h3>
                        {contact.email && <p className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</p>}
                        {contact.phoneNumber && <p className="text-sm text-gray-600 dark:text-gray-400">{contact.phoneNumber}</p>}
                        
                        {contact.notes && contact.notes.length > 0 && (
                          <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Matching notes:</p>
                            {contact.notes.map(note => (
                              <p key={note.id} className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                                "{note.note}"
                              </p>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {notes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Notes</h2>
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <Link 
                        href={`/contacts/${note.contact.id}`}
                        key={note.id}
                        className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Note for <span className="font-medium">{note.contact.firstName} {note.contact.lastName}</span>
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">{note.note}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {reminders.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Reminders</h2>
                  <div className="space-y-4">
                    {reminders.map((reminder) => (
                      <div 
                        key={reminder.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {formatDate(reminder.reminderDate)}
                          </span>
                          {reminder.contact && (
                            <Link 
                              href={`/contacts/${reminder.contact.id}`}
                              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                            >
                              For: {reminder.contact.firstName} {reminder.contact.lastName}
                            </Link>
                          )}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">{reminder.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Enter a search term to find contacts, notes, and reminders</p>
        </div>
      )}

      <div className="mt-8">
        <Link href="/dashboard" className="text-purple-600 dark:text-purple-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div></div>}>
      <SearchContent />
    </Suspense>
  );
} 