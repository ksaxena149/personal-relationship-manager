// Reminder notification service
import { toast } from 'react-hot-toast';

export interface Reminder {
  id: number;
  reminderDate: string;
  description: string;
  contactId: number | null;
  isRecurring: boolean;
  isCompleted?: boolean;
  contact?: {
    firstName: string;
    lastName: string | null;
  };
}

// Helper to safely access localStorage (only in browser)
const isBrowser = typeof window !== 'undefined';
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (isBrowser) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (isBrowser) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (isBrowser) {
      localStorage.removeItem(key);
    }
  }
};

class ReminderNotificationService {
  private reminders: Reminder[] = [];
  private checkedReminders: Set<number> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private notificationQueue: Reminder[] = [];
  private lastFetchTime: number = 0;
  private isFetching: boolean = false;
  
  // Event to notify subscribers of new due reminders
  private dueRemindersCallbacks: ((reminders: Reminder[]) => void)[] = [];
  // Event to notify subscribers of reminders data changes
  private updateRemindersCallbacks: ((reminders: Reminder[]) => void)[] = [];
  
  constructor() {
    if (!isBrowser) return; // Skip initialization on server
    
    // Create persistent identifier for checked reminders
    const savedCheckedReminders = safeLocalStorage.getItem('checkedReminders');
    if (savedCheckedReminders) {
      try {
        const parsed = JSON.parse(savedCheckedReminders);
        this.checkedReminders = new Set(parsed);
      } catch (e) {
        console.error('Error parsing checked reminders:', e);
      }
    }
    
    // Initialize audio
    this.initAudio();
  }
  
  private initAudio() {
    if (!isBrowser) return;
    
    try {
      // Create audio element for better compatibility
      this.audioElement = new Audio('/notification.mp3');
      this.audioElement.preload = 'auto';
      this.audioElement.volume = 0.5; // Lower volume to 50%
      
      // Preload the audio
      this.audioElement.load();
    } catch (e) {
      console.error('Error initializing audio:', e);
    }
  }
  
  public playNotificationSound() {
    if (!isBrowser) return;
    
    try {
      if (this.audioElement) {
        // Reset the audio to the beginning
        this.audioElement.currentTime = 0;
        this.audioElement.play().catch(err => {
          console.error('Error playing sound:', err);
          
          // If autoplay is blocked, we'll try again with user interaction
          document.addEventListener('click', () => {
            this.audioElement?.play();
          }, { once: true });
        });
      }
    } catch (e) {
      console.error('Error playing notification sound:', e);
    }
  }
  
  public startChecking() {
    if (!isBrowser) return;
    
    // Stop existing intervals if any
    this.stopChecking();
    
    // Fetch reminders immediately if it's been more than 30 seconds since last fetch
    const now = Date.now();
    if (now - this.lastFetchTime > 30000 && !this.isFetching) {
      this.fetchReminders().then(() => {
        // Check for due reminders immediately
        this.checkReminders();
      });
    } else {
      // Just check with existing data if we fetched recently
      this.checkReminders();
    }
    
    // Set up interval to check every 15 seconds
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 15000); // Check every 15 seconds
    
    // Set up a refresh interval to fetch new reminders every 60 seconds
    this.refreshInterval = setInterval(() => {
      if (!this.isFetching) {
        this.fetchReminders().then(() => {
          // Notify all subscribers of data change
          this.notifyUpdate();
        });
      }
    }, 60000); // Refresh every minute
  }
  
  public stopChecking() {
    if (!isBrowser) return;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
  
  private async fetchReminders() {
    if (!isBrowser) return;
    
    try {
      // Set fetching flag to prevent duplicate fetches
      if (this.isFetching) return;
      this.isFetching = true;
      
      const token = safeLocalStorage.getItem('token');
      if (!token) {
        this.isFetching = false;
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
      this.reminders = data.data || [];
      
      // Update last fetch time
      this.lastFetchTime = Date.now();
      this.isFetching = false;
      
      // Return the reminders for convenience
      return this.reminders;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      this.isFetching = false;
    }
  }
  
  private checkReminders() {
    if (!isBrowser) return;
    
    const now = new Date();
    const dueReminders: Reminder[] = [];
    
    // Check each reminder
    this.reminders.forEach(reminder => {
      // Skip completed reminders
      if (reminder.isCompleted) return;
      
      const reminderDate = new Date(reminder.reminderDate);
      
      // Check if reminder is due and hasn't been checked yet
      if (reminderDate <= now && !this.checkedReminders.has(reminder.id)) {
        dueReminders.push(reminder);
        this.checkedReminders.add(reminder.id);
        
        // Add to notification queue
        this.notificationQueue.push(reminder);
      }
    });
    
    // Save checked reminders to localStorage
    safeLocalStorage.setItem('checkedReminders', JSON.stringify([...this.checkedReminders]));
    
    // If we have due reminders, notify subscribers
    if (dueReminders.length > 0) {
      // Play sound once for any due reminders
      this.playNotificationSound();
      
      // Notify subscribers
      this.dueRemindersCallbacks.forEach(callback => callback(dueReminders));
      
      // Process notification queue
      this.processNotificationQueue();
    }
  }
  
  private processNotificationQueue() {
    if (!isBrowser) return;
    
    // Process one notification at a time
    if (this.notificationQueue.length > 0) {
      const reminder = this.notificationQueue.shift();
      if (reminder) {
        // Show toast notification
        const contactName = reminder.contact 
          ? `${reminder.contact.firstName} ${reminder.contact.lastName || ''}` 
          : '';
        
        const message = contactName 
          ? `Reminder: ${reminder.description} (${contactName})`
          : `Reminder: ${reminder.description}`;
        
        toast(message, {
          icon: '🔔',
          duration: 5000,
          position: 'top-right',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    }
  }
  
  public markAsRead(reminderId: number) {
    if (!isBrowser) return;
    
    this.checkedReminders.add(reminderId);
    safeLocalStorage.setItem('checkedReminders', JSON.stringify([...this.checkedReminders]));
  }
  
  public reset() {
    if (!isBrowser) return;
    
    this.checkedReminders.clear();
    safeLocalStorage.removeItem('checkedReminders');
  }
  
  public subscribeToDueReminders(callback: (reminders: Reminder[]) => void) {
    this.dueRemindersCallbacks.push(callback);
    return () => {
      // Return unsubscribe function
      this.dueRemindersCallbacks = this.dueRemindersCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public subscribeToUpdates(callback: (reminders: Reminder[]) => void) {
    this.updateRemindersCallbacks.push(callback);
    
    // Immediately call the callback with current reminders if we're in the browser
    if (isBrowser) {
      callback(this.reminders);
    }
    
    return () => {
      // Return unsubscribe function
      this.updateRemindersCallbacks = this.updateRemindersCallbacks.filter(cb => cb !== callback);
    };
  }
  
  private notifyUpdate() {
    // Notify all subscribers that reminders data has changed
    this.updateRemindersCallbacks.forEach(callback => callback(this.reminders));
  }
  
  public getDueReminders(): Reminder[] {
    const now = new Date();
    return this.reminders.filter(reminder => {
      const reminderDate = new Date(reminder.reminderDate);
      return reminderDate <= now && !reminder.isCompleted;
    });
  }
  
  public getAllReminders(): Reminder[] {
    return [...this.reminders];
  }
  
  public async completeReminder(reminderId: number) {
    if (!isBrowser) return false;
    
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch(`/api/reminders/${reminderId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isCompleted: true })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete reminder');
      }
      
      // Update the local data
      this.reminders = this.reminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, isCompleted: true } 
          : reminder
      );
      
      // Notify subscribers about the update
      this.notifyUpdate();
      
      return true;
    } catch (error) {
      console.error('Error completing reminder:', error);
      return false;
    }
  }
  
  public async deleteReminder(reminderId: number) {
    if (!isBrowser) return false;
    
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) return false;
      
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }
      
      // Remove from local data
      this.reminders = this.reminders.filter(reminder => reminder.id !== reminderId);
      
      // Remove from checked reminders if it's there
      if (this.checkedReminders.has(reminderId)) {
        this.checkedReminders.delete(reminderId);
        safeLocalStorage.setItem('checkedReminders', JSON.stringify([...this.checkedReminders]));
      }
      
      // Notify subscribers about the update
      this.notifyUpdate();
      
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const reminderService = new ReminderNotificationService(); 