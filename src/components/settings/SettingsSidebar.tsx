'use client';

import React from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Briefcase, 
  Users, 
  Database,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeSection,
  onSectionChange
}) => {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'profile',
      title: t('settings.sections.profile.title'),
      description: t('settings.sections.profile.shortDescription'),
      icon: User,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'notifications',
      title: t('settings.sections.notifications.title'),
      description: t('settings.sections.notifications.shortDescription'),
      icon: Bell,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'appearance',
      title: t('settings.sections.appearance.title'),
      description: t('settings.sections.appearance.shortDescription'),
      icon: Palette,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'privacy',
      title: t('settings.sections.privacy.title'),
      description: t('settings.sections.privacy.shortDescription'),
      icon: Shield,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      id: 'career',
      title: t('settings.sections.career.title'),
      description: t('settings.sections.career.shortDescription'),
      icon: Briefcase,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'connections',
      title: t('settings.sections.connections.title'),
      description: t('settings.sections.connections.shortDescription'),
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'data',
      title: t('settings.sections.data.title'),
      description: t('settings.sections.data.shortDescription'),
      icon: Database,
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {t('settings.sidebar.title')}
      </h2>
      
      <nav className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isActive 
                  ? 'bg-purple-100 dark:bg-purple-800' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Icon className={`h-5 w-5 ${
                  isActive 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : section.color
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium ${
                  isActive 
                    ? 'text-purple-900 dark:text-purple-100' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {section.title}
                </h3>
                <p className={`text-sm ${
                  isActive 
                    ? 'text-purple-700 dark:text-purple-300' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {section.description}
                </p>
              </div>
              
              <ChevronRight className={`h-4 w-4 ${
                isActive 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} />
            </button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          {t('settings.sidebar.quickActions')}
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            {t('settings.sidebar.exportData')}
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            {t('settings.sidebar.importData')}
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            {t('settings.sidebar.deleteAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};
