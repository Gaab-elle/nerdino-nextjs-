'use client';

import React, { useState } from 'react';
import { Database, Download, Upload, Trash2, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DataSettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({ onUnsavedChanges }) => {
  const { t } = useLanguage();
  
  const [data, setData] = useState({
    autoBackup: true,
    backupFrequency: 'weekly',
    retention: '1year',
    exportFormat: 'json'
  });

  const handleChange = (field: string, value: string | boolean | number) => {
    setData(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  const handleExport = () => {
    // Simulate export
    console.log('Exporting data...');
  };

  const handleDeleteAccount = () => {
    if (confirm(t('settings.data.deleteAccount.confirm'))) {
      console.log('Deleting account...');
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Export Data */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.data.export.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    {t('settings.data.export.downloadTitle')}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {t('settings.data.export.downloadDescription')}
                  </p>
                  <div className="mt-3 flex gap-3">
                    <select
                      value={data.exportFormat}
                      onChange={(e) => handleChange('exportFormat', e.target.value)}
                      className="p-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
                    </select>
                    <button
                      onClick={handleExport}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {t('settings.data.export.downloadButton')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.data.backup.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.data.backup.autoBackup')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.data.backup.autoBackupDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={data.autoBackup}
                  onChange={(e) => handleChange('autoBackup', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {data.autoBackup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.data.backup.frequency')}
                  </label>
                  <select
                    value={data.backupFrequency}
                    onChange={(e) => handleChange('backupFrequency', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="daily">{t('settings.data.backup.daily')}</option>
                    <option value="weekly">{t('settings.data.backup.weekly')}</option>
                    <option value="monthly">{t('settings.data.backup.monthly')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.data.backup.retention')}
                  </label>
                  <select
                    value={data.retention}
                    onChange={(e) => handleChange('retention', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="3months">{t('settings.data.backup.3months')}</option>
                    <option value="6months">{t('settings.data.backup.6months')}</option>
                    <option value="1year">{t('settings.data.backup.1year')}</option>
                    <option value="forever">{t('settings.data.backup.forever')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Privacy & Compliance */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.data.privacy.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    {t('settings.data.privacy.lgpd.title')}
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {t('settings.data.privacy.lgpd.description')}
                  </p>
                  <button className="mt-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                    {t('settings.data.privacy.lgpd.button')}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                    {t('settings.data.privacy.retention.title')}
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {t('settings.data.privacy.retention.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            {t('settings.data.danger.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">
                    {t('settings.data.danger.deleteAccount.title')}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {t('settings.data.danger.deleteAccount.description')}
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 inline mr-2" />
                    {t('settings.data.danger.deleteAccount.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
