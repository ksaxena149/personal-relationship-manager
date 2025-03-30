'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface InteractionDay {
  date: string;
  count: number;
}

interface InteractionGraphProps {
  contactId: string | number;
  months?: number;
  compact?: boolean;
}

// Helper function to get the date key in YYYY-MM-DD format
function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function InteractionGraph({ contactId, months = 12, compact = false }: InteractionGraphProps) {
  const [interactionData, setInteractionData] = useState<InteractionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Days of the week labels
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Month labels
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  useEffect(() => {
    const fetchInteractionHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        const response = await fetch(`/api/contacts/${contactId}/interactions?months=${months}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch interaction history');
        }
        
        const data = await response.json();
        setInteractionData(data.data.interactionHistory || []);
      } catch (err: any) {
        console.error('Error fetching interaction history:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInteractionHistory();
  }, [contactId, months, router]);
  
  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-full w-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-sm py-2">
        Error loading interaction history
      </div>
    );
  }
  
  if (!interactionData.length) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm py-2">
        No interaction data available
      </div>
    );
  }
  
  // Organize data by weeks and days
  const organizeByWeeks = () => {
    // Sort data by date
    const sortedData = [...interactionData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // If no data, return empty array to avoid errors
    if (sortedData.length === 0) {
      return [];
    }
    
    // Create a map for quick access to count by date
    const countByDate: Record<string, number> = {};
    sortedData.forEach(day => {
      countByDate[day.date] = day.count;
    });
    
    // Calculate start date (beginning of first month) and end date (today)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);
    startDate.setDate(1); // Start from the first day of the month
    
    // Initialize weeks structure
    const weeks: InteractionDay[][] = [];
    let currentWeek: InteractionDay[] = [];
    let dayOfWeek = 0;
    
    // Adjust start date to previous Monday
    const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(startDate.getDate() - (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1));
    
    // Generate days for each week
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // If we're at the beginning of a week, create a new week array
      if (dayOfWeek === 0) {
        currentWeek = [];
      }
      
      // Format date as YYYY-MM-DD
      const dateKey = getDateKey(currentDate);
      
      // Add the day to the current week
      currentWeek.push({
        date: dateKey,
        count: countByDate[dateKey] || 0
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      dayOfWeek = (dayOfWeek + 1) % 7;
      
      // If we've filled a week, add it to the weeks array
      if (dayOfWeek === 0) {
        weeks.push([...currentWeek]);
      }
    }
    
    // Add the final partial week if needed
    if (dayOfWeek > 0) {
      // Fill the remaining days
      while (dayOfWeek < 7) {
        currentWeek.push({ date: '', count: -1 });
        dayOfWeek++;
      }
      weeks.push([...currentWeek]);
    }
    
    return weeks;
  };
  
  const weeks = organizeByWeeks();
  
  // Get month labels positions
  const getMonthLabels = () => {
    const months: { label: string, position: number, left: number }[] = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      // Only check the first day (Monday) of each week
      const day = week[0];
      if (day && day.date) {
        const date = new Date(day.date);
        const month = date.getMonth();
        
        if (month !== currentMonth) {
          // Calculate center position for month label
          let weekWidth = 20; // Width of each week including margin
          months.push({
            label: monthLabels[month],
            position: weekIndex,
            // Center the label over its first week
            left: weekIndex * weekWidth
          });
          currentMonth = month;
        }
      }
    });
    
    return months;
  };
  
  const monthPositions = getMonthLabels();
  
  // Get the color based on the interaction count
  const getColor = (count: number) => {
    if (count < 0) return 'bg-transparent'; // Empty cell
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    if (count === 1) return 'bg-purple-200 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-800';
    if (count === 2) return 'bg-purple-300 dark:bg-purple-800/50 border border-purple-400 dark:border-purple-700';
    if (count === 3) return 'bg-purple-400 dark:bg-purple-700/70 border border-purple-500 dark:border-purple-600';
    return 'bg-purple-500 dark:bg-purple-600 border border-purple-600 dark:border-purple-500';
  };
  
  // Enhanced color function for compact mode
  const getCompactColor = (count: number) => {
    if (count < 0) return 'bg-transparent'; 
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    if (count === 1) return 'bg-purple-200 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-800';
    if (count === 2) return 'bg-purple-300 dark:bg-purple-800/60 border border-purple-400 dark:border-purple-700';
    if (count >= 3) return 'bg-purple-500 dark:bg-purple-600 border border-purple-600 dark:border-purple-500';
    return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'; // Fallback
  };
  
  // Format the tooltip date
  const formatTooltipDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="py-2">
      {compact ? (
        // Completely redesigned compact mode
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <div className="w-8 text-xs text-gray-500 dark:text-gray-400">Mon</div>
            <div className="flex-1 flex items-center">
              {monthPositions.length > 0 && monthPositions.map((month, i) => (
                <div 
                  key={i}
                  className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400"
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center mt-1">
            <div className="w-8"></div>
            <div className="flex-1 flex justify-between items-center px-1">
              {weeks.map((week, weekIndex) => {
                // Get max interaction count for the week
                const maxCount = Math.max(...week.filter(d => d.date).map(d => d.count), -1);
                return (
                  <div 
                    key={weekIndex} 
                    className={`w-4 h-4 rounded-sm ${getCompactColor(maxCount)}`}
                    title={`Week of ${week.find(d => d.date)?.date ? formatTooltipDate(week.find(d => d.date)!.date) : ''}: ${maxCount > 0 ? maxCount : 0} interactions`}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-end items-center mt-3 text-xs">
            <span className="mr-2 text-gray-500 dark:text-gray-400">Less</span>
            <div className={`w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-1`}></div>
            <div className={`w-4 h-4 rounded-sm bg-purple-200 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-800 mr-1`}></div>
            <div className={`w-4 h-4 rounded-sm bg-purple-300 dark:bg-purple-800/50 border border-purple-400 dark:border-purple-700 mr-1`}></div>
            <div className={`w-4 h-4 rounded-sm bg-purple-400 dark:bg-purple-700/70 border border-purple-500 dark:border-purple-600 mr-1`}></div>
            <div className={`w-4 h-4 rounded-sm bg-purple-500 dark:bg-purple-600 border border-purple-600 dark:border-purple-500`}></div>
            <span className="ml-2 text-gray-500 dark:text-gray-400">More</span>
          </div>
        </div>
      ) : (
        // Original full mode display
        <>
          <div className="mb-3 flex justify-between items-center">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {months}-Month Interaction History
            </div>
          </div>
          <div className="flex text-xs text-gray-500 dark:text-gray-400">
            <div className="w-12 text-right pr-2 flex-shrink-0">
              {weekdays.map((day, i) => (
                <div key={day} className="h-[18px] my-[1px]" style={{ 
                  marginTop: i === 0 ? 30 : undefined,
                  lineHeight: '18px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}>
                  {day}
                </div>
              ))}
            </div>
            <div className="w-full">
              <div className="relative" style={{ minWidth: `${weeks.length * 18}px`, width: 'fit-content', maxWidth: '100%' }}>
                <div className="flex">
                  {monthPositions.map((month, i) => {
                    // Calculate position to align with cells
                    const leftPosition = month.position * 18;
                    return (
                      <div 
                        key={i} 
                        className="absolute text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
                        style={{ 
                          left: `${leftPosition}px`,
                          top: '5px'
                        }}
                      >
                        {month.label}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 flex flex-nowrap">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col" style={{ minWidth: '16px', marginRight: '2px' }}>
                      {week.map((day, dayIndex) => (
                        <div 
                          key={`${weekIndex}-${dayIndex}`} 
                          className={`w-4 h-4 my-[2px] rounded-sm ${getColor(day.count)}`}
                          style={{ minWidth: '16px', minHeight: '16px' }}
                          title={day.date ? `${formatTooltipDate(day.date)}: ${day.count} interaction${day.count !== 1 ? 's' : ''}` : ''}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center mt-3 text-xs">
            <span className="mr-2 text-gray-500 dark:text-gray-400">Less</span>
            <div className={`w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-1`}></div>
            <div className={`w-4 h-4 rounded-sm bg-purple-200 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-800 mr-1`}></div>
            <div className={`w-4 h-4 rounded-sm bg-purple-300 dark:bg-purple-800/50 border border-purple-400 dark:border-purple-700 mr-1`}></div>
            <div className={`w-4 h-4 rounded-sm bg-purple-400 dark:bg-purple-700/70 border border-purple-500 dark:border-purple-600 mr-1`}></div>
            <div className={`w-4 h-4 rounded-sm bg-purple-500 dark:bg-purple-600 border border-purple-600 dark:border-purple-500`}></div>
            <span className="ml-2 text-gray-500 dark:text-gray-400">More</span>
          </div>
        </>
      )}
    </div>
  );
} 