'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
  // Function to apply theme
  const applyTheme = (theme: string) => {
    console.log('Applying theme:', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    console.log('Dark class applied:', document.documentElement.classList.contains('dark'));
  };

  useEffect(() => {
    // Get theme preference from localStorage or default to dark
    try {
      const theme = localStorage.getItem('theme') || 'dark';
      console.log('Initial theme from localStorage:', theme);
      
      // Apply theme to document
      applyTheme(theme);
      
      // Listen for theme changes
      const handleStorageChange = (e: StorageEvent) => {
        console.log('Storage change detected:', e.key, e.newValue);
        if (e.key === 'theme') {
          applyTheme(e.newValue || 'dark');
        }
      };
      
      // Custom event for theme changes within the same window
      const handleThemeChange = (e: CustomEvent) => {
        console.log('Theme change event received:', e.detail);
        if (e.detail && e.detail.theme) {
          applyTheme(e.detail.theme);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('themeChanged' as any, handleThemeChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('themeChanged' as any, handleThemeChange);
      };
    } catch (error) {
      console.error('Error initializing theme:', error);
      // Fallback to dark theme if there's an error
      document.documentElement.classList.add('dark');
    }
  }, []);

  // This component doesn't render anything
  return null;
} 