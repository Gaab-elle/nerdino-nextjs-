'use client';

import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Smartphone, Key, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PrivacySettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onUnsavedChanges }) => {
  const { t } = useLanguage();
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showLastSeen: true,
    showOnlineStatus: true,
    twoFactorAuth: false,
    dataCollection: true,
    analytics: true,
    cookies: true
  });

  const handleChange = (field: string, value: any) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Profile Privacy */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.privacy.profile.title')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.privacy.profile.visibility')}
              </label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => handleChange('profileVisibility', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="public">{t('settings.privacy.profile.public')}</option>
                <option value="connections">{t('settings.privacy.profile.connections')}</option>
                <option value="private">{t('settings.privacy.profile.private')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.privacy.profile.showLastSeen')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.privacy.profile.showLastSeenDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={privacy.showLastSeen}
                  onChange={(e) => handleChange('showLastSeen', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.privacy.profile.showOnlineStatus')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.privacy.profile.showOnlineStatusDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={privacy.showOnlineStatus}
                  onChange={(e) => handleChange('showOnlineStatus', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.privacy.security.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {t('settings.privacy.security.twoFactorAuth')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.privacy.security.twoFactorAuthDescription')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={privacy.twoFactorAuth}
                  onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    {t('settings.privacy.security.changePassword')}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {t('settings.privacy.security.changePasswordDescription')}
                  </p>
                  <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    {t('settings.privacy.security.changePasswordButton')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Collection */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.privacy.data.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.privacy.data.collection')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.privacy.data.collectionDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={privacy.dataCollection}
                  onChange={(e) => handleChange('dataCollection', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.privacy.data.analytics')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.privacy.data.analyticsDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={privacy.analytics}
                  onChange={(e) => handleChange('analytics', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
