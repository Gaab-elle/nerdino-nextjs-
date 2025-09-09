'use client';

import React from 'react';
import { ChevronRight, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsHeaderProps {
  activeSection: string;
  hasUnsavedChanges: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ 
  activeSection, 
  hasUnsavedChanges 
}) => {
  const { t } = useLanguage();

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'profile': return t('settings.sections.profile.title');
      case 'notifications': return t('settings.sections.notifications.title');
      case 'appearance': return t('settings.sections.appearance.title');
      case 'privacy': return t('settings.sections.privacy.title');
      case 'career': return t('settings.sections.career.title');
      case 'connections': return t('settings.sections.connections.title');
      case 'data': return t('settings.sections.data.title');
      default: return t('settings.title');
    }
  };

  const getSectionDescription = (section: string) => {
    switch (section) {
      case 'profile': return t('settings.sections.profile.description');
      case 'notifications': return t('settings.sections.notifications.description');
      case 'appearance': return t('settings.sections.appearance.description');
      case 'privacy': return t('settings.sections.privacy.description');
      case 'career': return t('settings.sections.career.description');
      case 'connections': return t('settings.sections.connections.description');
      case 'data': return t('settings.sections.data.description');
      default: return t('settings.subtitle');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <SettingsIcon className="h-4 w-4" />
          <span>{t('settings.title')}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-gray-100">
            {getSectionTitle(activeSection)}
          </span>
        </nav>

        {/* Title and Description */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {getSectionTitle(activeSection)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {getSectionDescription(activeSection)}
            </p>
          </div>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-orange-700 dark:text-orange-300">
                {t('settings.unsavedChanges')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
