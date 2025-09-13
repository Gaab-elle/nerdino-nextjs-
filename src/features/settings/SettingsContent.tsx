'use client';

import React from 'react';
import { ProfileSettings } from '@/features/settings/ProfileSettings';
import { NotificationSettings } from '@/features/settings/NotificationSettings';
import { CareerSettings } from '@/features/settings/CareerSettings';
import { ConnectionSettings } from '@/features/settings/ConnectionSettings';
import { DataSettings } from '@/features/settings/DataSettings';
import PrivacySettings from '@/features/settings/PrivacySettings';
import AppearanceSettings from '@/features/settings/AppearanceSettings';
import ProfileExamples from '@/features/settings/ProfileExamples';

interface SettingsContentProps {
  activeSection: string;
  settings?: {
    profile?: unknown;
    privacy?: unknown;
    appearance?: unknown;
    notifications?: unknown;
    career?: unknown;
    connections?: unknown;
    data?: unknown;
  };
  onSettingsChange?: (settings: {
    profile?: unknown;
    privacy?: unknown;
    appearance?: unknown;
    notifications?: unknown;
    career?: unknown;
    connections?: unknown;
    data?: unknown;
  }) => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  activeSection,
  settings,
  onSettingsChange,
  onUnsavedChanges
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings 
          settings={settings?.profile ? { profile: settings.profile } : undefined}
          onSettingsChange={onSettingsChange}
          onUnsavedChanges={onUnsavedChanges} 
        />;
      case 'privacy-visibility':
        return <PrivacySettings onUnsavedChanges={onUnsavedChanges} />;
      case 'appearance-layout':
        return <AppearanceSettings onUnsavedChanges={onUnsavedChanges} />;
      case 'examples':
        return <ProfileExamples />;
      case 'notifications':
        return <NotificationSettings onUnsavedChanges={onUnsavedChanges} />;
      case 'career':
        return <CareerSettings onUnsavedChanges={onUnsavedChanges} />;
      case 'connections':
        return <ConnectionSettings onUnsavedChanges={onUnsavedChanges} />;
      case 'data':
        return <DataSettings onUnsavedChanges={onUnsavedChanges} />;
      default:
        return <ProfileSettings onUnsavedChanges={onUnsavedChanges} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {renderContent()}
    </div>
  );
};
