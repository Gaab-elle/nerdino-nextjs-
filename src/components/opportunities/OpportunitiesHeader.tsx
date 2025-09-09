'use client';

import React, { useState } from 'react';
import { Briefcase, Bell, ToggleLeft, ToggleRight, TrendingUp, Users, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfile {
  skills: string[];
  experience: string;
  location: string;
  available: boolean;
}

interface OpportunitiesHeaderProps {
  userProfile: UserProfile;
}

export const OpportunitiesHeader: React.FC<OpportunitiesHeaderProps> = ({ userProfile }) => {
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(userProfile.available);

  const stats = {
    compatibleJobs: 24,
    applications: 8,
    interviews: 3,
    responseRate: 75
  };

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // Here you would update the user's availability status
    console.log('Availability toggled:', !isAvailable);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title and Description */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('opportunities.header.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('opportunities.header.subtitle')}
            </p>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isAvailable ? (
                <ToggleRight 
                  className="h-6 w-6 text-green-500 cursor-pointer" 
                  onClick={handleToggleAvailability}
                />
              ) : (
                <ToggleLeft 
                  className="h-6 w-6 text-gray-400 cursor-pointer" 
                  onClick={handleToggleAvailability}
                />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isAvailable ? t('opportunities.header.available') : t('opportunities.header.notAvailable')}
              </span>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              {t('opportunities.header.createAlert')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.compatibleJobs}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('opportunities.header.compatibleJobs')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.applications}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('opportunities.header.applications')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.interviews}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t('opportunities.header.interviews')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.responseRate}%
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {t('opportunities.header.responseRate')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-6 flex items-center gap-2">
          <Badge variant={isAvailable ? 'default' : 'secondary'} className="text-sm">
            {isAvailable ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {t('opportunities.header.statusAvailable')}
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                {t('opportunities.header.statusNotAvailable')}
              </>
            )}
          </Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isAvailable 
              ? t('opportunities.header.recruitersCanSee')
              : t('opportunities.header.recruitersCannotSee')
            }
          </span>
        </div>
      </div>
    </div>
  );
};
