'use client';

import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Building, Target, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CareerSettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const CareerSettings: React.FC<CareerSettingsProps> = ({ onUnsavedChanges }) => {
  const { t } = useLanguage();
  
  const [career, setCareer] = useState({
    availability: 'active',
    contractType: 'CLT',
    workMode: 'remote',
    urgency: 'exploring',
    locations: ['São Paulo', 'Remoto'],
    salaryMin: 8000,
    salaryMax: 15000,
    companySize: 'all',
    industries: ['tech', 'fintech'],
    preferredStack: ['React', 'TypeScript', 'Node.js'],
    level: 'senior'
  });

  const handleChange = (field: string, value: string | boolean | number | string[]) => {
    setCareer(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Status */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.career.status.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Briefcase className="h-4 w-4 inline mr-1" />
                {t('settings.career.status.availability')}
              </label>
              <select
                value={career.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="active">{t('settings.career.status.active')}</option>
                <option value="passive">{t('settings.career.status.passive')}</option>
                <option value="unavailable">{t('settings.career.status.unavailable')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.career.status.contractType')}
              </label>
              <select
                value={career.contractType}
                onChange={(e) => handleChange('contractType', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="freelance">{t('settings.career.status.freelance')}</option>
                <option value="consulting">{t('settings.career.status.consulting')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.career.status.workMode')}
              </label>
              <select
                value={career.workMode}
                onChange={(e) => handleChange('workMode', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="remote">{t('settings.career.status.remote')}</option>
                <option value="onsite">{t('settings.career.status.onsite')}</option>
                <option value="hybrid">{t('settings.career.status.hybrid')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.career.status.urgency')}
              </label>
              <select
                value={career.urgency}
                onChange={(e) => handleChange('urgency', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="immediate">{t('settings.career.status.immediate')}</option>
                <option value="3months">{t('settings.career.status.3months')}</option>
                <option value="exploring">{t('settings.career.status.exploring')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.career.preferences.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                {t('settings.career.preferences.salaryRange')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder={t('settings.career.preferences.minSalary')}
                  value={career.salaryMin}
                  onChange={(e) => handleChange('salaryMin', parseInt(e.target.value) || 0)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="number"
                  placeholder={t('settings.career.preferences.maxSalary')}
                  value={career.salaryMax}
                  onChange={(e) => handleChange('salaryMax', parseInt(e.target.value) || 0)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                {t('settings.career.preferences.companySize')}
              </label>
              <select
                value={career.companySize}
                onChange={(e) => handleChange('companySize', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">{t('settings.career.preferences.allSizes')}</option>
                <option value="startup">{t('settings.career.preferences.startup')}</option>
                <option value="medium">{t('settings.career.preferences.medium')}</option>
                <option value="enterprise">{t('settings.career.preferences.enterprise')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* CV Upload */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.career.cv.title')}
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('settings.career.cv.uploadTitle')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('settings.career.cv.uploadDescription')}
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              {t('settings.career.cv.uploadButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
