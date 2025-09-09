'use client';

import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Clock, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationSettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onUnsavedChanges }) => {
  const { t } = useLanguage();
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    inApp: true,
    social: {
      likes: true,
      comments: true,
      follows: true,
      mentions: true
    },
    projects: {
      stars: true,
      forks: true,
      issues: true,
      pullRequests: true
    },
    opportunities: {
      newJobs: true,
      responses: true,
      interviews: true
    },
    networking: {
      messages: true,
      invites: true,
      connections: true
    },
    system: {
      updates: true,
      maintenance: true,
      security: true
    },
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      weekends: true
    }
  });

  const handleToggle = (category: string, field?: string) => {
    setNotifications(prev => {
      const newState = { ...prev };
      if (field) {
        if (category === 'social' || category === 'projects' || category === 'opportunities' || category === 'networking' || category === 'system') {
          newState[category] = { ...newState[category], [field]: !newState[category][field] };
        } else if (category === 'doNotDisturb') {
          newState[category] = { ...newState[category], [field]: !newState[category][field] };
        }
      } else {
        newState[category] = !newState[category];
      }
      onUnsavedChanges(true);
      return newState;
    });
  };

  const handleTimeChange = (field: string, value: string) => {
    setNotifications(prev => ({
      ...prev,
      doNotDisturb: { ...prev.doNotDisturb, [field]: value }
    }));
    onUnsavedChanges(true);
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Notification Channels */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.notifications.channels.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {t('settings.notifications.channels.push')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.notifications.channels.pushDescription')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.push}
                  onChange={() => handleToggle('push')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {t('settings.notifications.channels.email')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.notifications.channels.emailDescription')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.email}
                  onChange={() => handleToggle('email')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {t('settings.notifications.channels.sms')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.notifications.channels.smsDescription')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.sms}
                  onChange={() => handleToggle('sms')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Event Types */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.notifications.events.title')}
          </h3>
          
          {/* Social Interactions */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {t('settings.notifications.events.social')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(notifications.social).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t(`settings.notifications.events.${key}`)}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={value}
                      onChange={() => handleToggle('social', key)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {t('settings.notifications.events.projects')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(notifications.projects).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t(`settings.notifications.events.${key}`)}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={value}
                      onChange={() => handleToggle('projects', key)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {t('settings.notifications.events.opportunities')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(notifications.opportunities).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t(`settings.notifications.events.${key}`)}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={value}
                      onChange={() => handleToggle('opportunities', key)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.notifications.doNotDisturb.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {notifications.doNotDisturb.enabled ? (
                  <VolumeX className="h-5 w-5 text-red-600" />
                ) : (
                  <Volume2 className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {t('settings.notifications.doNotDisturb.enable')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('settings.notifications.doNotDisturb.description')}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.doNotDisturb.enabled}
                  onChange={() => handleToggle('doNotDisturb', 'enabled')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {notifications.doNotDisturb.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {t('settings.notifications.doNotDisturb.startTime')}
                  </label>
                  <input
                    type="time"
                    value={notifications.doNotDisturb.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.notifications.doNotDisturb.endTime')}
                  </label>
                  <input
                    type="time"
                    value={notifications.doNotDisturb.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('settings.notifications.doNotDisturb.weekends')}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications.doNotDisturb.weekends}
                      onChange={() => handleToggle('doNotDisturb', 'weekends')}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
