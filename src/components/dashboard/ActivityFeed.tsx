'use client';

import React from 'react';
import { Heart, MessageCircle, GitBranch, Star, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'fork' | 'star' | 'trending' | 'follow';
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  action: string;
  target: string;
  time: string;
  metadata?: {
    projectName?: string;
    comment?: string;
    language?: string;
  };
}

const getMockActivities = (t: (key: string) => string): Activity[] => [
  {
    id: '1',
    type: 'like',
    user: {
      name: 'Maria Silva',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      username: 'maria_silva'
    },
    action: t('dashboard.activity.likedProject'),
    target: 'React Portfolio',
    time: '2 min atrás',
    metadata: {
      projectName: 'React Portfolio'
    }
  },
  {
    id: '2',
    type: 'comment',
    user: {
      name: 'João Santos',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      username: 'joao_santos'
    },
    action: t('dashboard.activity.commentedProject'),
    target: 'E-commerce API',
    time: '1 hora atrás',
    metadata: {
      projectName: 'E-commerce API',
      comment: 'Excelente trabalho! A documentação está muito clara.'
    }
  },
  {
    id: '3',
    type: 'fork',
    user: {
      name: 'Ana Costa',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      username: 'ana_costa'
    },
    action: t('dashboard.activity.forkedProject'),
    target: 'Weather Dashboard',
    time: '3 horas atrás',
    metadata: {
      projectName: 'Weather Dashboard'
    }
  },
  {
    id: '4',
    type: 'trending',
    user: {
      name: 'Trending',
      avatar: '',
      username: 'trending'
    },
    action: t('dashboard.activity.trendingProject'),
    target: 'Task Manager App',
    time: '5 horas atrás',
    metadata: {
      projectName: 'Task Manager App',
      language: 'React Native'
    }
  },
  {
    id: '5',
    type: 'follow',
    user: {
      name: 'Carlos Lima',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      username: 'carlos_lima'
    },
    action: t('dashboard.activity.startedFollowing'),
    target: '',
    time: '1 dia atrás'
  },
  {
    id: '6',
    type: 'star',
    user: {
      name: 'Pedro Oliveira',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      username: 'pedro_oliveira'
    },
    action: t('dashboard.activity.starredProject'),
    target: 'React Portfolio',
    time: `2 ${t('dashboard.progress.daysAgo')}`,
    metadata: {
      projectName: 'React Portfolio'
    }
  }
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'like':
      return <Heart size={16} className="text-red-500" />;
    case 'comment':
      return <MessageCircle size={16} className="text-blue-500" />;
    case 'fork':
      return <GitBranch size={16} className="text-green-500" />;
    case 'star':
      return <Star size={16} className="text-yellow-500" />;
    case 'trending':
      return <TrendingUp size={16} className="text-purple-500" />;
    case 'follow':
      return <Users size={16} className="text-indigo-500" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'like':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'comment':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'fork':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'star':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'trending':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'follow':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
  }
};

export const ActivityFeed: React.FC = () => {
  const { t } = useLanguage();
  const mockActivities = getMockActivities(t);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.activityFeed.title')}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {activity.type === 'trending' ? (
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                ) : (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {activity.user.name}
                  </span>
                  <Badge className={getActivityColor(activity.type)}>
                    {getActivityIcon(activity.type)}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.action}
                  {activity.target && (
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {' '}{activity.target}
                    </span>
                  )}
                </p>

                {activity.metadata?.comment && (
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                    "{activity.metadata.comment}"
                  </div>
                )}

                {activity.metadata?.language && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {activity.metadata.language}
                    </Badge>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Load more button */}
        <div className="mt-6 text-center">
          <button className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
            {t('dashboard.activity.loadMore')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
