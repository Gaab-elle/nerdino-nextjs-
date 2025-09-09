'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Filters {
  type: string;
  sortBy: string;
  feed: string;
}

interface FeedFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({ filters, setFilters }) => {
  const { t } = useLanguage();

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Feed Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('community.filters.feed')}:
        </span>
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {[
            { key: 'all', label: t('community.filters.all') },
            { key: 'following', label: t('community.filters.following') }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => handleFilterChange('feed', option.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filters.feed === option.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('community.filters.sortBy')}:
        </span>
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {[
            { key: 'recent', label: t('community.filters.recent') },
            { key: 'popular', label: t('community.filters.popular') },
            { key: 'trending', label: t('community.filters.trending') }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => handleFilterChange('sortBy', option.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filters.sortBy === option.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
