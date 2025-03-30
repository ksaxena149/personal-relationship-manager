'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileImage from '@/components/ui/ProfileImage';
import { relationshipTypes, getRandomInteractionVerb } from '@/utils/relationshipConfig';
import { toast } from 'react-hot-toast';

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
  relationshipType: string | null;
  customInteractionDays: number | null;
  lastInteractionDate: string | null;
  notes: Note[];
  reminders: Reminder[];
}

export default function ContactDetailClient({ contactId }: { contactId: string }) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecordingInteraction, setIsRecordingInteraction] = useState(false);
  const [interactionNote, setInteractionNote] = useState('');
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const router = useRouter();
  
  // Function to fetch contact details
  const fetchContactDetails = async () => {
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
  };
  
  useEffect(() => {
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

  // Get relationship type label if available
  const getRelationshipInfo = () => {
    if (!contact?.relationshipType) return null;
    
    const relationshipType = relationshipTypes.find(type => type.id === contact.relationshipType);
    if (!relationshipType) return null;
    
    let recommendedDays = relationshipType.recommendedInteractionDays;
    if (contact.relationshipType === 'custom' && contact.customInteractionDays) {
      recommendedDays = contact.customInteractionDays;
    }
    
    let lastInteractionText = 'No interactions recorded yet';
    let daysAgo = 0;
    
    if (contact.lastInteractionDate) {
      const lastInteraction = new Date(contact.lastInteractionDate);
      const today = new Date();
      daysAgo = Math.floor((today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysAgo === 0) {
        lastInteractionText = 'Last interaction: Today';
      } else if (daysAgo === 1) {
        lastInteractionText = 'Last interaction: Yesterday';
      } else {
        lastInteractionText = `Last interaction: ${daysAgo} days ago`;
      }
    }
    
    let interactionStatus = '';
    if (daysAgo === 0) {
      interactionStatus = 'recent';
    } else if (recommendedDays > 0 && daysAgo > recommendedDays) {
      interactionStatus = 'overdue';
    } else if (recommendedDays > 0 && daysAgo > (recommendedDays * 0.7)) {
      interactionStatus = 'upcoming';
    } else {
      interactionStatus = 'good';
    }
    
    return {
      label: relationshipType.label,
      recommendedDays,
      lastInteractionText,
      daysAgo,
      interactionStatus
    };
  };
  
  const recordInteraction = async (withNote = false) => {
    setIsRecordingInteraction(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`/api/contacts/${contactId}/interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          note: withNote ? interactionNote : '',
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record interaction');
      }
      
      // Show success message
      toast.success('Interaction recorded successfully');
      
      // Reset form
      setInteractionNote('');
      setShowInteractionForm(false);
      
      // Reload the contact data to get the updated interaction date and new note
      await fetchContactDetails();
      
    } catch (err: any) {
      console.error('Error recording interaction:', err);
      toast.error(err.message || 'Failed to record interaction');
    } finally {
      setIsRecordingInteraction(false);
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
          <button
            onClick={() => setShowInteractionForm(!showInteractionForm)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
            Just Interacted
          </button>
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
      
      {/* Interaction Form */}
      {showInteractionForm && (
        <div className="bg-[var(--card-bg)] shadow rounded-lg p-6 mb-6 border border-[var(--card-border)]">
          <h2 className="text-xl font-semibold mb-4">Record Interaction</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="interactionNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Interaction Notes (Optional)
              </label>
              <textarea
                id="interactionNote"
                value={interactionNote}
                onChange={(e) => setInteractionNote(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Add notes about your interaction (optional)"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => recordInteraction(true)}
                disabled={isRecordingInteraction}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm disabled:opacity-50"
              >
                {isRecordingInteraction ? 'Recording...' : 'Save with Note'}
              </button>
              <button
                type="button"
                onClick={() => recordInteraction(false)}
                disabled={isRecordingInteraction}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm disabled:opacity-50"
              >
                {isRecordingInteraction ? 'Recording...' : 'Just Record Interaction'}
              </button>
              <button
                type="button"
                onClick={() => setShowInteractionForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Relationship Card */}
      <div className="bg-[var(--card-bg)] shadow rounded-lg p-6 mb-6 border border-[var(--card-border)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Relationship</h2>
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="text-sm text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
          >
            Edit Relationship
          </Link>
        </div>
        
        {getRelationshipInfo() ? (
          <div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Relationship Type</p>
                <p className="font-medium">{getRelationshipInfo()?.label}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Recommended Contact</p>
                <p className="font-medium">Every {getRelationshipInfo()?.recommendedDays} days</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Last Interaction</p>
                <p className="font-medium">{getRelationshipInfo()?.lastInteractionText}</p>
              </div>
            </div>
            
            <div className={`p-3 rounded-md ${
              getRelationshipInfo()?.interactionStatus === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
              getRelationshipInfo()?.interactionStatus === 'upcoming' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
              getRelationshipInfo()?.interactionStatus === 'recent' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}>
              {getRelationshipInfo()?.interactionStatus === 'overdue' && (
                <p>It's been {getRelationshipInfo()?.daysAgo} days since your last interaction. Time to reach out!</p>
              )}
              {getRelationshipInfo()?.interactionStatus === 'upcoming' && (
                <p>You should consider reaching out soon - it's been a while since your last interaction.</p>
              )}
              {getRelationshipInfo()?.interactionStatus === 'recent' && (
                <p>You've interacted with this contact recently. Great job staying in touch!</p>
              )}
              {getRelationshipInfo()?.interactionStatus === 'good' && (
                <p>You're doing well staying in touch with this contact.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">No relationship type specified</p>
            <Link
              href={`/contacts/${contact.id}/edit`}
              className="inline-block mt-2 text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
            >
              Set relationship type
            </Link>
          </div>
        )}
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