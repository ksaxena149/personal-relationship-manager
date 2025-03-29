'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProfileImage from '@/components/ui/ProfileImage';

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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [favoriteContacts, setFavoriteContacts] = useState<Set<number>>(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteContacts');
    if (storedFavorites) {
      try {
        const favoritesArray = JSON.parse(storedFavorites);
        setFavoriteContacts(new Set(favoritesArray));
      } catch (error) {
        console.error('Error parsing favorite contacts:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (favorites: Set<number>) => {
    try {
      localStorage.setItem('favoriteContacts', JSON.stringify([...favorites]));
    } catch (error) {
      console.error('Error saving favorite contacts:', error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (contactId: number) => {
    const newFavorites = new Set(favoriteContacts);
    if (newFavorites.has(contactId)) {
      newFavorites.delete(contactId);
    } else {
      newFavorites.add(contactId);
    }
    setFavoriteContacts(newFavorites);
    saveFavorites(newFavorites);
  };
  
  // Filter contacts when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact => 
      `${contact.firstName} ${contact.lastName || ''}`.toLowerCase().includes(lowercaseQuery) ||
      (contact.email && contact.email.toLowerCase().includes(lowercaseQuery)) ||
      (contact.phoneNumber && contact.phoneNumber.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredContacts(filtered);
  }, [contacts, searchQuery]);

  // Filter contacts for favorites and non-favorites
  const favoriteContactsList = filteredContacts.filter(contact => favoriteContacts.has(contact.id));
  const nonFavoriteContactsList = filteredContacts.filter(contact => !favoriteContacts.has(contact.id));

  // Fetch contacts
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
        setFilteredContacts(data.data || []);
        
        // Check if there's a contact ID in the URL to select initially
        const contactId = searchParams.get('id');
        if (contactId && data.data) {
          const selected = data.data.find((c: Contact) => c.id.toString() === contactId);
          if (selected) {
            fetchContactDetails(selected.id);
          }
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching contacts');
        console.error('Error fetching contacts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [searchParams]);

  // Fetch detailed contact info when a contact is selected
  const fetchContactDetails = async (contactId: number) => {
    try {
      const token = localStorage.getItem('token');
        
      if (!token) {
        setError('You must be logged in to view contact details');
        return;
      }
      
      // Check if we're on mobile - if so, navigate to dedicated contact page
      if (window.innerWidth < 768) {
        router.push(`/contacts/${contactId}`);
        return;
      }
      
      const response = await fetch(`/api/contacts/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact details');
      }
      
      const data = await response.json();
      setSelectedContact(data.data);
      
      // Update URL without full page reload
      router.push(`/contacts?id=${contactId}`, { scroll: false });
    } catch (err: any) {
      console.error('Error fetching contact details:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    
    if (!confirm('Are you sure you want to delete this contact? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
      
      // Remove from favorites if present
      if (favoriteContacts.has(selectedContact.id)) {
        const newFavorites = new Set(favoriteContacts);
        newFavorites.delete(selectedContact.id);
        setFavoriteContacts(newFavorites);
        saveFavorites(newFavorites);
      }
      
      // Remove from contacts list and clear selection
      setContacts(contacts.filter(c => c.id !== selectedContact.id));
      setFilteredContacts(filteredContacts.filter(c => c.id !== selectedContact.id));
      setSelectedContact(null);
      
      // Update URL 
      router.push('/contacts', { scroll: false });
    } catch (err: any) {
      console.error('Error deleting contact:', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left sidebar with contact list */}
      <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-96 h-full flex-col bg-gray-900 text-white overflow-y-auto border-r border-gray-700`}>
        <div className="px-4 py-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <Link href="/contacts/new" className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded">
            Add New
          </Link>
        </div>
        
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            {/* Favorites section, only shown if there are favorites */}
            {favoriteContactsList.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-sm text-gray-500 uppercase tracking-wider">
                  Favorites
                </div>
                {favoriteContactsList.map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => fetchContactDetails(contact.id)}
                    className={`px-4 py-3 border-b border-gray-700 flex items-center cursor-pointer hover:bg-gray-800 ${selectedContact?.id === contact.id ? 'bg-gray-800' : ''}`}
                  >
                    <ProfileImage 
                      src={contact.profileImage} 
                      alt={`${contact.firstName} ${contact.lastName || ''}`} 
                      size="sm"
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                      {contact.email && (
                        <div className="text-sm text-gray-400">{contact.email}</div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(contact.id);
                      }} 
                      className="ml-2 text-yellow-400 hover:text-yellow-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* All other contacts */}
            {nonFavoriteContactsList.length > 0 && (
              <div className="py-2">
                {favoriteContactsList.length > 0 && (
                  <div className="px-4 py-1 text-sm text-gray-500 uppercase tracking-wider">
                    Contacts
                  </div>
                )}
                {nonFavoriteContactsList.map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => fetchContactDetails(contact.id)}
                    className={`px-4 py-3 border-b border-gray-700 flex items-center cursor-pointer hover:bg-gray-800 ${selectedContact?.id === contact.id ? 'bg-gray-800' : ''}`}
                  >
                    <ProfileImage 
                      src={contact.profileImage} 
                      alt={`${contact.firstName} ${contact.lastName || ''}`} 
                      size="sm"
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                      {contact.email && (
                        <div className="text-sm text-gray-400">{contact.email}</div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(contact.id);
                      }} 
                      className="ml-2 text-gray-400 hover:text-yellow-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {filteredContacts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-center">No contacts found</p>
                {searchQuery && <p className="mt-2">Try a different search term</p>}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Right panel with contact details */}
      <div className={`${selectedContact ? 'flex' : 'hidden md:flex'} flex-col flex-1 h-full bg-gray-800 overflow-y-auto`}>
        {selectedContact ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <ProfileImage 
                  src={selectedContact.profileImage} 
                  alt={`${selectedContact.firstName} ${selectedContact.lastName || ''}`} 
                  size="lg"
                  className="mr-6" 
                />
                <div>
                  <h2 className="text-3xl font-bold">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h2>
                  {selectedContact.email && (
                    <p className="text-gray-400 mt-1">{selectedContact.email}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Clear selected contact and update URL
                    setSelectedContact(null);
                    router.push('/contacts', { scroll: false });
                  }}
                  className="md:hidden px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                >
                  Back
                </button>
                <Link
                  href={`/contacts/${selectedContact.id}`}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                >
                  View Full Page
                </Link>
                <Link
                  href={`/contacts/${selectedContact.id}/edit`}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDeleteContact}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="font-medium">{selectedContact.email || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Phone</p>
                  <p className="font-medium">{selectedContact.phoneNumber || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Address</p>
                  <p className="font-medium">{selectedContact.address || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Birthday</p>
                  <p className="font-medium">
                    {selectedContact.birthday ? formatDate(selectedContact.birthday) : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes section */}
            {selectedContact.notes && selectedContact.notes.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <Link
                    href={`/contacts/${selectedContact.id}/notes/new`}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                  >
                    Add Note
                  </Link>
                </div>
                <div className="space-y-4">
                  {selectedContact.notes.map((note) => (
                    <div key={note.id} className="border-b border-gray-600 pb-4 last:border-0">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">
                          {note.interactionDate ? `Interaction on ${formatDate(note.interactionDate)}` : formatDate(note.createdAt)}
                        </span>
                        <Link 
                          href={`/contacts/${selectedContact.id}/notes/${note.id}/edit`}
                          className="text-sm text-purple-400 hover:text-purple-300"
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

            {/* Reminders section */}
            {selectedContact.reminders && selectedContact.reminders.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Reminders</h3>
                  <Link
                    href={`/reminders/new?contactId=${selectedContact.id}`}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                  >
                    Add Reminder
                  </Link>
                </div>
                <div className="space-y-4">
                  {selectedContact.reminders.map((reminder) => (
                    <div key={reminder.id} className="flex justify-between items-start border-b border-gray-600 pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{formatDate(reminder.reminderDate)}</p>
                        <p className="text-gray-300">{reminder.description}</p>
                        {reminder.isRecurring && (
                          <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                            Recurring
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/reminders/${reminder.id}/edit`}
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">No Contact Selected</h2>
            <p>Select a contact to view details</p>
          </div>
        )}
      </div>
    </div>
  );
} 