'use client';

import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useSSE } from '@/hooks/useSSE';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionError } = useSSE();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <Wifi className="h-4 w-4" />
        <span className="text-sm">Conectado</span>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Erro de conexão</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm">Conectando...</span>
    </div>
  );
};
