'use client';

import React from 'react';
import { MessageCircle, Users, Code, Share2, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const WelcomeScreen: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <MessageCircle className="h-6 w-6 text-purple-600" />,
      title: t('messages.welcome.features.chat.title'),
      description: t('messages.welcome.features.chat.description')
    },
    {
      icon: <Code className="h-6 w-6 text-blue-600" />,
      title: t('messages.welcome.features.code.title'),
      description: t('messages.welcome.features.code.description')
    },
    {
      icon: <Share2 className="h-6 w-6 text-green-600" />,
      title: t('messages.welcome.features.share.title'),
      description: t('messages.welcome.features.share.description')
    },
    {
      icon: <Users className="h-6 w-6 text-orange-600" />,
      title: t('messages.welcome.features.groups.title'),
      description: t('messages.welcome.features.groups.description')
    }
  ];

  const quickActions = [
    {
      icon: <Search className="h-4 w-4" />,
      label: t('messages.welcome.quickActions.search'),
      action: () => console.log('Search contacts')
    },
    {
      icon: <Plus className="h-4 w-4" />,
      label: t('messages.welcome.quickActions.newChat'),
      action: () => console.log('New chat')
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Main Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="h-12 w-12 text-purple-600" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('messages.welcome.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('messages.welcome.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={action.action}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t('messages.welcome.tips.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong>{t('messages.welcome.tips.tip1.title')}:</strong> {t('messages.welcome.tips.tip1.description')}
            </div>
            <div>
              <strong>{t('messages.welcome.tips.tip2.title')}:</strong> {t('messages.welcome.tips.tip2.description')}
            </div>
            <div>
              <strong>{t('messages.welcome.tips.tip3.title')}:</strong> {t('messages.welcome.tips.tip3.description')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
