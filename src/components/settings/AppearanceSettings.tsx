'use client';

import React, { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Type, Layout, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AppearanceSettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ onUnsavedChanges }) => {
  const { t } = useLanguage();
  
  const [appearance, setAppearance] = useState({
    theme: 'auto',
    primaryColor: 'purple',
    density: 'normal',
    fontSize: 16,
    fontFamily: 'sans-serif',
    borderRadius: 'medium',
    animations: true,
    reducedMotion: false
  });

  const themes = [
    { value: 'light', label: t('settings.appearance.theme.light'), icon: Sun },
    { value: 'dark', label: t('settings.appearance.theme.dark'), icon: Moon },
    { value: 'auto', label: t('settings.appearance.theme.auto'), icon: Monitor }
  ];

  const colors = [
    { value: 'purple', label: t('settings.appearance.colors.purple'), class: 'bg-purple-500' },
    { value: 'blue', label: t('settings.appearance.colors.blue'), class: 'bg-blue-500' },
    { value: 'green', label: t('settings.appearance.colors.green'), class: 'bg-green-500' },
    { value: 'red', label: t('settings.appearance.colors.red'), class: 'bg-red-500' },
    { value: 'orange', label: t('settings.appearance.colors.orange'), class: 'bg-orange-500' }
  ];

  const densities = [
    { value: 'compact', label: t('settings.appearance.density.compact') },
    { value: 'normal', label: t('settings.appearance.density.normal') },
    { value: 'spacious', label: t('settings.appearance.density.spacious') }
  ];

  const fonts = [
    { value: 'sans-serif', label: t('settings.appearance.fonts.sans') },
    { value: 'serif', label: t('settings.appearance.fonts.serif') },
    { value: 'mono', label: t('settings.appearance.fonts.mono') }
  ];

  const handleChange = (field: string, value: any) => {
    setAppearance(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Theme */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.appearance.theme.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const Icon = theme.icon;
              return (
                <button
                  key={theme.value}
                  onClick={() => handleChange('theme', theme.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    appearance.theme === theme.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {theme.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Color */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.appearance.colors.title')}
          </h3>
          
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleChange('primaryColor', color.value)}
                className={`w-12 h-12 rounded-full border-2 ${
                  appearance.primaryColor === color.value
                    ? 'border-gray-900 dark:border-white'
                    : 'border-gray-300 dark:border-gray-600'
                } ${color.class}`}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Density */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.appearance.density.title')}
          </h3>
          
          <div className="space-y-3">
            {densities.map((density) => (
              <label key={density.value} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="density"
                  value={density.value}
                  checked={appearance.density === density.value}
                  onChange={(e) => handleChange('density', e.target.value)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-900 dark:text-gray-100">{density.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Font Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.appearance.fonts.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Type className="h-4 w-4 inline mr-1" />
                {t('settings.appearance.fonts.family')}
              </label>
              <select
                value={appearance.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {fonts.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.appearance.fonts.size')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={appearance.fontSize}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                  {appearance.fontSize}px
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.appearance.layout.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.appearance.layout.animations')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.appearance.layout.animationsDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={appearance.animations}
                  onChange={(e) => handleChange('animations', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.appearance.layout.reducedMotion')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.appearance.layout.reducedMotionDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={appearance.reducedMotion}
                  onChange={(e) => handleChange('reducedMotion', e.target.checked)}
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
