'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProfileImageProps {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProfileImage({ src, alt, size = 'md', className = '' }: ProfileImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Determine size class
  const sizeClass = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
  }[size];
  
  const handleError = () => {
    setImageError(true);
  };
  
  // If no image or image error, show fallback
  if (!src || imageError) {
    return (
      <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }
  
  // Otherwise, show the image
  return (
    <div className={`${sizeClass} relative rounded-full overflow-hidden ${className}`}>
      <Image 
        src={src} 
        alt={alt} 
        fill
        sizes={`(max-width: 768px) ${size === 'sm' ? '2.5rem' : size === 'md' ? '4rem' : '8rem'}, ${size === 'sm' ? '2.5rem' : size === 'md' ? '4rem' : '8rem'}`}
        style={{ objectFit: 'cover' }}
        onError={handleError}
      />
    </div>
  );
} 