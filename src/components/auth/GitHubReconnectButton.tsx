'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, RefreshCw } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GitHubReconnectButtonProps {
  onReconnect?: () => void;
  className?: string;
}

export const GitHubReconnectButton: React.FC<GitHubReconnectButtonProps> = ({ 
  onReconnect,
  className = ""
}) => {
  const { t } = useLanguage();

  const handleReconnect = async () => {
    try {
      // Sign out first to clear any cached tokens
      await signIn('github', { 
        callbackUrl: '/projects',
        redirect: true 
      });
      
      if (onReconnect) {
        onReconnect();
      }
    } catch (error) {
      console.error('Error reconnecting GitHub:', error);
    }
  };

  return (
    <Button
      onClick={handleReconnect}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      <RefreshCw className="h-4 w-4" />
      <Github className="h-4 w-4" />
      Reconectar GitHub
    </Button>
  );
};
