'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reminderService, Reminder } from '@/utils/reminders/notificationService';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('You must be logged in to view reminders');
      setLoading(false);
      return;
    }
    
    // Subscribe to reminder updates
    const unsubscribe = reminderService.subscribeToUpdates((updatedReminders) => {
      setReminders(updatedReminders);
      setLoading(false);
    });
    
    // Start the reminder notification service
    reminderService.startChecking();
    
    // Clean up when the component unmounts
    return () => {
      unsubscribe();
      // Don't stop checking for reminders when navigating away
      // as we want notifications to continue working in the background
    };
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

  // Determine if a reminder is due or overdue
  const isReminderDue = (dateString: string) => {
    const now = new Date();
    const reminderDate = new Date(dateString);
    return reminderDate <= now;
  };
  
  // Handle complete reminder
  const handleCompleteReminder = async (reminderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setActionLoading(reminderId);
    try {
      const success = await reminderService.completeReminder(reminderId);
      if (success) {
        toast.success('Reminder marked as completed');
      } else {
        toast.error('Failed to complete reminder');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle delete reminder
  const handleDeleteReminder = async (reminderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    
    setActionLoading(reminderId);
    try {
      const success = await reminderService.deleteReminder(reminderId);
      if (success) {
        toast.success('Reminder deleted');
      } else {
        toast.error('Failed to delete reminder');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
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
          <div>
            <div className="flex mb-4 space-x-2">
              <button 
                className="text-sm px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
              >
                All
              </button>
              <button 
                className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Due
              </button>
              <button 
                className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Upcoming
              </button>
              <button 
                className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                Completed
              </button>
            </div>
            
            <div className="grid gap-4">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className={`relative border rounded-lg p-4 transition ${
                    reminder.isCompleted
                      ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                      : isReminderDue(reminder.reminderDate)
                        ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-lg">
                      {reminder.description}
                      {reminder.isCompleted ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Completed
                        </span>
                      ) : isReminderDue(reminder.reminderDate) ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                          Due
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Upcoming
                        </span>
                      )}
                    </h3>
                    <p className={`${
                      reminder.isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : isReminderDue(reminder.reminderDate)
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      {formatDate(reminder.reminderDate)}
                    </p>
                  </div>
                  
                  {reminder.contact && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      For: {reminder.contact.firstName} {reminder.contact.lastName}
                    </p>
                  )}
                  
                  <div className="mt-2 flex space-x-2">
                    {!reminder.isCompleted && (
                      <button 
                        onClick={(e) => handleCompleteReminder(reminder.id, e)}
                        disabled={actionLoading === reminder.id}
                        className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50"
                      >
                        {actionLoading === reminder.id ? 'Working...' : 'Complete'}
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDeleteReminder(reminder.id, e)}
                      disabled={actionLoading === reminder.id}
                      className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50"
                    >
                      {actionLoading === reminder.id ? 'Working...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 