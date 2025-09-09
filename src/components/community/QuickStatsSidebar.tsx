'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export const QuickStatsSidebar: React.FC = () => {
  const { t } = useLanguage();

  const communityStats = {
    totalPosts: 1247,
    totalUsers: 3456,
    totalComments: 8934,
    totalLikes: 45678,
    totalShares: 2345,
    activeToday: 234
  };

  const weeklyTrends = [
    { label: 'Posts', value: 89, change: '+12%', positive: true },
    { label: 'Usuários', value: 156, change: '+8%', positive: true },
    { label: 'Interações', value: 234, change: '+15%', positive: true },
    { label: 'Engajamento', value: 67, change: '-3%', positive: false }
  ];

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            {t('community.stats.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {communityStats.totalPosts.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.stats.posts')}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {communityStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.stats.users')}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {communityStats.totalLikes.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.stats.likes')}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {communityStats.activeToday}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.stats.activeToday')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            {t('community.stats.weeklyTrends')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {trend.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {trend.value}
                  </span>
                  <span className={`text-xs ${
                    trend.positive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {trend.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t('community.quickActions.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('community.quickActions.startDiscussion')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('community.quickActions.startDiscussionDesc')}
                </div>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('community.quickActions.shareProject')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('community.quickActions.shareProjectDesc')}
                </div>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Share2 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('community.quickActions.inviteFriends')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('community.quickActions.inviteFriendsDesc')}
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
