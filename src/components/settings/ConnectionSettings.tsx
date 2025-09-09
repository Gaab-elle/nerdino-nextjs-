'use client';

import React, { useState } from 'react';
import { Users, MessageCircle, Eye, EyeOff, Github, Linkedin, Twitter, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConnectionSettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({ onUnsavedChanges }) => {
  const { t } = useLanguage();
  
  const [connections, setConnections] = useState({
    presence: 'online',
    messageFrom: 'connections',
    readReceipts: true,
    typingIndicators: true,
    suggestions: true,
    autoJoin: true,
    githubSync: true,
    linkedinSync: false,
    twitterSync: false
  });

  const handleChange = (field: string, value: any) => {
    setConnections(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Chat Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.connections.chat.title')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.connections.chat.presence')}
              </label>
              <select
                value={connections.presence}
                onChange={(e) => handleChange('presence', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="online">{t('settings.connections.chat.online')}</option>
                <option value="away">{t('settings.connections.chat.away')}</option>
                <option value="invisible">{t('settings.connections.chat.invisible')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.connections.chat.messageFrom')}
              </label>
              <select
                value={connections.messageFrom}
                onChange={(e) => handleChange('messageFrom', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">{t('settings.connections.chat.all')}</option>
                <option value="connections">{t('settings.connections.chat.connections')}</option>
                <option value="none">{t('settings.connections.chat.none')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.connections.chat.readReceipts')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.connections.chat.readReceiptsDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={connections.readReceipts}
                  onChange={(e) => handleChange('readReceipts', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.connections.chat.typingIndicators')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.connections.chat.typingIndicatorsDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={connections.typingIndicators}
                  onChange={(e) => handleChange('typingIndicators', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Discovery */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.connections.discovery.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.connections.discovery.suggestions')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.connections.discovery.suggestionsDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={connections.suggestions}
                  onChange={(e) => handleChange('suggestions', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.connections.discovery.autoJoin')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.connections.discovery.autoJoinDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={connections.autoJoin}
                  onChange={(e) => handleChange('autoJoin', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Social Sync */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.connections.sync.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    GitHub
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.connections.sync.githubDescription')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={connections.githubSync}
                  onChange={(e) => handleChange('githubSync', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    LinkedIn
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.connections.sync.linkedinDescription')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={connections.linkedinSync}
                  onChange={(e) => handleChange('linkedinSync', e.target.checked)}
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
