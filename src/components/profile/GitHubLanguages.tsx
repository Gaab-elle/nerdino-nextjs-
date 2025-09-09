'use client';

import React from 'react';
import { Code, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';

export const GitHubLanguages: React.FC = () => {
  const { data: profileData, loading, error } = useGitHubProfile();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            Programming Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !profileData?.languages) {
    return null;
  }

  const languages = profileData.languages;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code size={20} />
          Programming Languages
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Languages used in your GitHub repositories
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {languages.map((language, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 text-sm"
            >
              {language}
            </Badge>
          ))}
        </div>
        
        {languages.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Code size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No languages detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
