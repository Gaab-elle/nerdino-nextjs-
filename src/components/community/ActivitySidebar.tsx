'use client';

import React from 'react';
import { BarChart3, Zap, Heart, Users, MessageCircle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export const ActivitySidebar: React.FC = () => {
  const { t } = useLanguage();

  const personalStats = {
    postsThisWeek: 8,
    likesReceived: 247,
    newFollowers: 12,
    commentsMade: 34
  };

  const recentActivity = [
    {
      id: 1,
      type: 'like',
      user: 'Maria',
      action: t('community.activity.likedProject'),
      time: '2 horas atrás',
      icon: <Heart className="h-4 w-4 text-red-500" />
    },
    {
      id: 2,
      type: 'comment',
      user: 'Carlos',
      action: t('community.activity.commentedPost'),
      time: '4 horas atrás',
      icon: <MessageCircle className="h-4 w-4 text-blue-500" />
    },
    {
      id: 3,
      type: 'follow',
      user: 'Ana',
      action: t('community.activity.startedFollowing'),
      time: '6 horas atrás',
      icon: <Users className="h-4 w-4 text-green-500" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Personal Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            {t('community.activity.yourActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{personalStats.postsThisWeek}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.activity.postsThisWeek')}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{personalStats.likesReceived}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.activity.likesReceived')}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{personalStats.newFollowers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.activity.newFollowers')}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{personalStats.commentsMade}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.activity.commentsMade')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            {t('community.activity.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
