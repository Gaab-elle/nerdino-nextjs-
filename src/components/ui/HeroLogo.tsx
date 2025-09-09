'use client';

import React from 'react';
import { Code2, Sparkles, Zap } from 'lucide-react';

interface HeroLogoProps {
  className?: string;
  animated?: boolean;
}

export function HeroLogo({ className = '', animated = true }: HeroLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative mb-6">
        <div className={`h-24 w-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl ${
          animated ? 'animate-pulse' : ''
        }`}>
          <Code2 className="h-12 w-12 text-white" />
        </div>
        <Sparkles className={`h-6 w-6 text-yellow-500 absolute -top-2 -right-2 ${
          animated ? 'animate-spin' : ''
        }`} />
        <Zap className={`h-4 w-4 text-orange-500 absolute -bottom-1 -left-1 ${
          animated ? 'animate-bounce' : ''
        }`} />
      </div>
      
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Nerdino
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A plataforma definitiva para desenvolvedores mostrarem suas habilidades, 
          construírem sua marca pessoal e se conectarem com a comunidade tech.
        </p>
      </div>
    </div>
  );
}
