'use client';

import React from 'react';
import { Search, Grid3X3, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Filters {
  search: string;
  status: string;
  technology: string;
  period: string;
  sortBy: string;
}

interface ProjectsFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const ProjectsFilters: React.FC<ProjectsFiltersProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode
}) => {
  const { t } = useLanguage();

  const technologies = [
    'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript',
    'JavaScript', 'PHP', 'Laravel', 'Django', 'Express', 'MongoDB', 'PostgreSQL',
    'MySQL', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST API'
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-600" />
              {t('projects.filters.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t('projects.filters.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('projects.filters.status')}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">{t('projects.filters.allStatuses')}</option>
                  <option value="active">{t('projects.filters.active')}</option>
                  <option value="paused">{t('projects.filters.paused')}</option>
                  <option value="completed">{t('projects.filters.completed')}</option>
                  <option value="archived">{t('projects.filters.archived')}</option>
                </select>
              </div>

              {/* Technology Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('projects.filters.technology')}
                </label>
                <select
                  value={filters.technology}
                  onChange={(e) => handleFilterChange('technology', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">{t('projects.filters.allTechnologies')}</option>
                  {technologies.map((tech) => (
                    <option key={tech} value={tech.toLowerCase()}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('projects.filters.period')}
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">{t('projects.filters.allPeriods')}</option>
                  <option value="today">{t('projects.filters.today')}</option>
                  <option value="week">{t('projects.filters.thisWeek')}</option>
                  <option value="month">{t('projects.filters.thisMonth')}</option>
                  <option value="year">{t('projects.filters.thisYear')}</option>
                </select>
              </div>
            </div>

            {/* Sort and View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('projects.filters.sortBy')}:
                </span>
                <div className="flex gap-1">
                  {[
                    { key: 'recent', label: t('projects.filters.mostRecent') },
                    { key: 'name', label: t('projects.filters.nameAZ') },
                    { key: 'stars', label: t('projects.filters.stars') },
                    { key: 'progress', label: t('projects.filters.progress') },
                    { key: 'lastUpdate', label: t('projects.filters.lastUpdate') }
                  ].map((option) => (
                    <Button
                      key={option.key}
                      variant={filters.sortBy === option.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('sortBy', option.key)}
                      className={filters.sortBy === option.key ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('projects.filters.view')}:
                </span>
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-none border-0 ${
                      viewMode === 'grid' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-none border-0 ${
                      viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
