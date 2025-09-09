'use client';

import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import '@/i18n';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <LanguageProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </LanguageProvider>
    </SessionProvider>
  );
};
