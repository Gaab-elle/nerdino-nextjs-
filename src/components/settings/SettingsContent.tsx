'use client';

import React from 'react';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { CareerSettings } from '@/components/settings/CareerSettings';
import { ConnectionSettings } from '@/components/settings/ConnectionSettings';
import { DataSettings } from '@/components/settings/DataSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import ProfileExamples from '@/components/settings/ProfileExamples';

interface SettingsContentProps {
  activeSection: string;
  settings?: any;
  onSettingsChange?: (settings: any) => void;
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
          settings={settings}
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
