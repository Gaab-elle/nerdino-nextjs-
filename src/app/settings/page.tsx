'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { SettingsContent } from '@/components/settings/SettingsContent';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  
  const {
    settings,
    loading: settingsLoading,
    saving: isSaving,
    hasUnsavedChanges,
    updateSetting,
    updateSettings,
    saveSettings,
    loadSettings,
  } = useSettings();

  // Temporariamente remover verificação de autenticação para debug
  console.log('Settings page rendering');
  console.log('User:', user);
  console.log('Session:', session);
  console.log('Is loading:', isLoading);

  const handleSave = async () => {
    console.log('handleSave called');
    console.log('Current settings:', settings);
    console.log('User session:', session);
    
    try {
      const success = await saveSettings();
      console.log('Save result:', success);
      if (success) {
        // Recarregar a página ao invés de mostrar popup
        console.log('Settings saved successfully, reloading page...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error('Failed to save settings');
        alert('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('Erro ao salvar configurações: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm(t('settings.confirmCancel'))) {
        // Reload settings from server
        window.location.reload();
      }
    }
  };

  const handleReset = () => {
    if (confirm(t('settings.confirmReset'))) {
      // Reset to default values
      saveSettings();
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
                settings={settings}
                onSettingsChange={updateSettings}
                onUnsavedChanges={() => {}} // Hook useSettings já gerencia isso
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
