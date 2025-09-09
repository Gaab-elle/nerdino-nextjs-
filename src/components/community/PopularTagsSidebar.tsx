'use client';

import React from 'react';
import { TrendingUp, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export const PopularTagsSidebar: React.FC = () => {
  const { t } = useLanguage();

  const popularTags = [
    { name: 'react', count: 1247, trend: 'up' },
    { name: 'javascript', count: 2156, trend: 'up' },
    { name: 'nodejs', count: 892, trend: 'up' },
    { name: 'python', count: 1834, trend: 'down' },
    { name: 'typescript', count: 1456, trend: 'up' },
    { name: 'vue', count: 567, trend: 'up' },
    { name: 'angular', count: 423, trend: 'down' },
    { name: 'docker', count: 789, trend: 'up' },
    { name: 'aws', count: 634, trend: 'up' },
    { name: 'mongodb', count: 445, trend: 'down' },
    { name: 'postgresql', count: 378, trend: 'up' },
    { name: 'devops', count: 523, trend: 'up' }
  ];

  const handleTagClick = (tagName: string) => {
    console.log('Clicked tag:', tagName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-purple-600" />
          {t('community.trending.popularTags')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {popularTags.map((tag, index) => (
            <div
              key={tag.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              onClick={() => handleTagClick(tag.name)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  #{tag.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tag.count.toLocaleString()}
                </span>
                <TrendingUp 
                  className={`h-3 w-3 ${
                    tag.trend === 'up' 
                      ? 'text-green-500' 
                      : 'text-red-500 rotate-180'
                  }`} 
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-center">
            {t('community.tags.exploreMore')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
