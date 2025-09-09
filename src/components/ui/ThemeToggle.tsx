'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />;
    }
    return actualTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const getTooltip = () => {
    if (theme === 'system') {
      return 'Tema do sistema';
    }
    return theme === 'dark' ? 'Modo escuro' : 'Modo claro';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycleTheme}
      className="relative"
      title={getTooltip()}
    >
      {getIcon()}
    </Button>
  );
}
