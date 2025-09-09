'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'minimal' | 'icon' | 'text' | 'image';
  className?: string;
  showText?: boolean;
  imageSrc?: string;
  imageAlt?: string;
}

export function Logo({ 
  size = 'md', 
  variant = 'default', 
  className = '',
  showText = true,
  imageSrc = '/logo.png',
  imageAlt = 'Nerdino Logo'
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
    '2xl': 'h-20 w-20',
    '3xl': 'h-32 w-32',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl',
  };

  const getLogoIcon = () => {
    switch (variant) {
      case 'image':
        return (
          <div className="flex items-center">
            <div className={`${sizeClasses[size]} relative`}>
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-contain"
                priority
              />
            </div>
            {showText && (
              <span className={`ml-3 ${textSizeClasses[size]} font-bold text-gray-900 dark:text-gray-100`} style={{ fontFamily: 'Courier New, monospace' }}>
                NERDINO
              </span>
            )}
          </div>
        );
      case 'minimal':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Dinossauro */}
              <g className="fill-purple-500">
                {/* Cabeça */}
                <ellipse cx="35" cy="45" rx="18" ry="15" />
                {/* Óculos */}
                <rect x="25" y="40" width="8" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="37" y="40" width="8" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="33" y1="43" x2="37" y2="43" stroke="currentColor" strokeWidth="2" />
                {/* Corpo */}
                <ellipse cx="35" cy="65" rx="20" ry="18" />
                {/* Pernas */}
                <ellipse cx="25" cy="85" rx="6" ry="8" />
                <ellipse cx="45" cy="85" rx="6" ry="8" />
                {/* Cauda */}
                <ellipse cx="15" cy="70" rx="8" ry="4" transform="rotate(-30 15 70)" />
              </g>
              {/* Cometa */}
              <g className="fill-purple-500">
                <circle cx="70" cy="30" r="8" />
                <path d="M62 30 L50 25 L52 35 Z" />
                <path d="M62 30 L50 35 L52 25 Z" />
                {/* Símbolos de código */}
                <text x="70" y="35" textAnchor="middle" className="text-xs fill-white font-mono">&lt;/&gt;</text>
              </g>
            </svg>
          </div>
        );
      case 'icon':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              {/* Dinossauro */}
              <g className="fill-purple-500">
                {/* Cabeça */}
                <ellipse cx="35" cy="45" rx="18" ry="15" />
                {/* Óculos */}
                <rect x="25" y="40" width="8" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="37" y="40" width="8" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="33" y1="43" x2="37" y2="43" stroke="currentColor" strokeWidth="2" />
                {/* Corpo */}
                <ellipse cx="35" cy="65" rx="20" ry="18" />
                {/* Pernas */}
                <ellipse cx="25" cy="85" rx="6" ry="8" />
                <ellipse cx="45" cy="85" rx="6" ry="8" />
                {/* Cauda */}
                <ellipse cx="15" cy="70" rx="8" ry="4" transform="rotate(-30 15 70)" />
              </g>
              {/* Cometa */}
              <g className="fill-purple-500">
                <circle cx="70" cy="30" r="8" />
                <path d="M62 30 L50 25 L52 35 Z" />
                <path d="M62 30 L50 35 L52 25 Z" />
                {/* Símbolos de código */}
                <text x="70" y="35" textAnchor="middle" className="text-xs fill-white font-mono">&lt;/&gt;</text>
              </g>
            </svg>
          </div>
        );
      case 'text':
        return (
          <div className="flex items-center">
            <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent`} style={{ fontFamily: 'Courier New, monospace' }}>
              NERDINO
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className={`${sizeClasses[size]} relative`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                {/* Dinossauro */}
                <g className="fill-purple-500">
                  {/* Cabeça */}
                  <ellipse cx="35" cy="45" rx="18" ry="15" />
                  {/* Óculos */}
                  <rect x="25" y="40" width="8" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="37" y="40" width="8" height="6" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="33" y1="43" x2="37" y2="43" stroke="currentColor" strokeWidth="2" />
                  {/* Corpo */}
                  <ellipse cx="35" cy="65" rx="20" ry="18" />
                  {/* Pernas */}
                  <ellipse cx="25" cy="85" rx="6" ry="8" />
                  <ellipse cx="45" cy="85" rx="6" ry="8" />
                  {/* Cauda */}
                  <ellipse cx="15" cy="70" rx="8" ry="4" transform="rotate(-30 15 70)" />
                </g>
                {/* Cometa */}
                <g className="fill-purple-500">
                  <circle cx="70" cy="30" r="8" />
                  <path d="M62 30 L50 25 L52 35 Z" />
                  <path d="M62 30 L50 35 L52 25 Z" />
                  {/* Símbolos de código */}
                  <text x="70" y="35" textAnchor="middle" className="text-xs fill-white font-mono">&lt;/&gt;</text>
                </g>
              </svg>
            </div>
            {showText && (
              <span className={`ml-3 ${textSizeClasses[size]} font-bold text-gray-900 dark:text-gray-100`} style={{ fontFamily: 'Courier New, monospace' }}>
                NERDINO
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {getLogoIcon()}
    </div>
  );
}

// Logo variants for different contexts
export function LogoMinimal({ size = 'md', className = '' }: Omit<LogoProps, 'variant'>) {
  return <Logo size={size} variant="minimal" className={className} />;
}

export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'variant'>) {
  return <Logo size={size} variant="icon" className={className} />;
}

export function LogoText({ size = 'md', className = '' }: Omit<LogoProps, 'variant'>) {
  return <Logo size={size} variant="text" className={className} />;
}

export function LogoImage({ 
  size = 'md', 
  className = '', 
  imageSrc = '/logo.png',
  imageAlt = 'Nerdino Logo',
  showText = true 
}: Omit<LogoProps, 'variant'>) {
  return (
    <Logo 
      size={size} 
      variant="image" 
      className={className}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      showText={showText}
    />
  );
}
