'use client';

import React from 'react';
import { Code2, Sparkles } from 'lucide-react';

interface LoadingLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export function LoadingLogo({ 
  size = 'lg', 
  className = '',
  animated = true 
}: LoadingLogoProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24',
  };

  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  const sparkleSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl ${
          animated ? 'animate-pulse' : ''
        }`}>
          <Code2 className={`${iconSizeClasses[size]} text-white ${
            animated ? 'animate-bounce' : ''
          }`} />
        </div>
        <Sparkles className={`${sparkleSizeClasses[size]} text-yellow-500 absolute -top-2 -right-2 ${
          animated ? 'animate-spin' : ''
        }`} />
      </div>
      <div className="mt-4 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Nerdino
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Developer Platform
        </p>
      </div>
    </div>
  );
}
