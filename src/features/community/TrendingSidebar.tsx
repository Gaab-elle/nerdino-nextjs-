'use client';

import React from 'react';
import { TrendingUp, Star, GitFork } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export const TrendingSidebar: React.FC = () => {
  const { t } = useLanguage();

  const trendingProjects: Array<{
    id: string;
    name: string;
    description: string;
    author: { name: string; username: string; avatar: string };
    stars: number;
    forks: number;
    language: string;
    updatedAt: string;
  }> = []; // Dados reais serão implementados com sistema de trending
  const popularTags: string[] = []; // Dados reais serão implementados com sistema de tags

  return (
    <div className="space-y-6">
      {/* Trending Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            🔥 {t('community.trending.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingProjects.map((project, index) => (
              <div key={project.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {project.name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    {(project as any).icon}
                    <span>{(project as any).metric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-orange-500">🏷️</span>
            {t('community.trending.popularTags')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <button
                key={index}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
