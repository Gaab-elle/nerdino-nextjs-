'use client';

import React from 'react';
import { ProfileSettings } from './ProfileSettings';
import { NotificationSettings } from './NotificationSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { PrivacySettings } from './PrivacySettings';
import { CareerSettings } from './CareerSettings';
import { ConnectionSettings } from './ConnectionSettings';
import { DataSettings } from './DataSettings';

interface SettingsContentProps {
  activeSection: string;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  activeSection,
  onUnsavedChanges
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings onUnsavedChanges={onUnsavedChanges} />;
      case 'notifications':
        return <NotificationSettings onUnsavedChanges={onUnsavedChanges} />;
      case 'appearance':
        return <AppearanceSettings onUnsavedChanges={onUnsavedChanges} />;
      case 'privacy':
        return <PrivacySettings onUnsavedChanges={onUnsavedChanges} />;
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
