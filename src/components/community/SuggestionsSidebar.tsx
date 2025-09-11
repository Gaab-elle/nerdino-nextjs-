'use client';

import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';

export const SuggestionsSidebar: React.FC = () => {
  const { t } = useLanguage();

  const suggestions: any[] = []; // Dados reais serão implementados com sistema de sugestões

  const handleFollow = (userId: number) => {
    console.log('Following user:', userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t('community.suggestions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </h4>
                  {user.verified && (
                    <span className="text-blue-500 text-xs">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {user.mutualConnections} conexões em comum
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFollow(user.id)}
                className="flex-shrink-0"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                {t('community.suggestions.follow')}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" size="sm" className="w-full">
            {t('community.suggestions.viewAll')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
