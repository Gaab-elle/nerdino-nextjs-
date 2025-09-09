'use client';

import React from 'react';
import { Code2, Sparkles } from 'lucide-react';

interface FooterLogoProps {
  className?: string;
}

export function FooterLogo({ className = '' }: FooterLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <Code2 className="h-5 w-5 text-white" />
        </div>
        <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
      </div>
      <span className="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100">
        Nerdino
      </span>
    </div>
  );
}
