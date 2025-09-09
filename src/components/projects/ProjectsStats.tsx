'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
}

interface ProjectsStatsProps {
  projects: Project[];
}

export const ProjectsStats: React.FC<ProjectsStatsProps> = ({ projects }) => {
  const { t } = useLanguage();

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Total */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('projects.stats.total')}
            </div>
          </div>

          {/* Active */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.active}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('projects.stats.active')}
            </div>
          </div>

          {/* Paused */}
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.paused}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('projects.stats.paused')}
            </div>
          </div>

          {/* Completed */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('projects.stats.completed')}
            </div>
          </div>

          {/* Archived */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {stats.archived}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('projects.stats.archived')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
