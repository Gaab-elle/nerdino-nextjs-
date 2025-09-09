'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { SettingsContent } from '@/components/settings/SettingsContent';
import { SettingsHeader } from '@/components/settings/SettingsHeader';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      // Show success toast
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm(t('settings.confirmCancel'))) {
        setHasUnsavedChanges(false);
        // Reset form to original values
      }
    }
  };

  const handleReset = () => {
    if (confirm(t('settings.confirmReset'))) {
      setHasUnsavedChanges(false);
      // Reset to default values
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <SettingsHeader 
          activeSection={activeSection}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0">
              <SettingsSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <SettingsContent 
                activeSection={activeSection}
                onUnsavedChanges={setHasUnsavedChanges}
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {hasUnsavedChanges && (
                  <span className="text-orange-600 dark:text-orange-400">
                    {t('settings.unsavedChanges')}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {t('settings.reset')}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg"
                >
                  {isSaving ? t('settings.saving') : t('settings.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
