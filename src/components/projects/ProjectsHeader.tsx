'use client';

import React from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const ProjectsHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Title and Description */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('projects.header.title')}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('projects.header.subtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('projects.header.analytics')}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('projects.header.newProject')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
