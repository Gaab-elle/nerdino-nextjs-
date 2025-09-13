'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, GitBranch, Star, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const user = session?.user;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para calcular tempo relativo
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w`;
  };

  // Função para carregar atividades reais
  const loadActivities = () => {
    try {
      const savedPosts = localStorage.getItem('communityPosts');
      const savedComments = localStorage.getItem('communityComments');
      
      if (savedPosts && user) {
        const posts = JSON.parse(savedPosts);
        const comments = savedComments ? JSON.parse(savedComments) : {};
        
        // Filtrar posts e comentários do usuário
        const userPosts = posts.filter((post: { author: { id: string } }) => post.author.id === user.id);
        const userComments = Object.values(comments).filter((comment: any) => comment.authorId === user.id);
        
        // Converter para formato de atividades
        const realActivities: Activity[] = [];
        
        // Adicionar atividades de posts
        userPosts.slice(0, 5).forEach((post: { id: string; content: string; timestamp: string; type: string }) => {
          realActivities.push({
            id: `post-${post.id}`,
            type: 'trending',
            user: {
              name: (post as any).author?.name || 'Usuário',
              avatar: (post as any).author?.avatar_url || '',
              username: ((post as any).author?.name || 'usuario').toLowerCase().replace(/\s+/g, '')
            },
            action: 'criou um novo post',
            target: post.type === 'project' ? 'projeto' : post.type,
            time: getTimeAgo(post.timestamp),
            metadata: {
              projectName: post.type === 'project' ? post.content.split('\n')[0] : undefined
            }
          });
        });
        
        // Adicionar atividades de comentários
        userComments.slice(0, 3).forEach((comment: any) => {
          realActivities.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            user: {
              name: comment.authorName || 'Usuário',
              avatar: comment.authorAvatar || '',
              username: (comment.authorName || 'usuario').toLowerCase().replace(/\s+/g, '')
            },
            action: 'comentou em',
            target: 'um post',
            time: getTimeAgo(comment.timestamp),
            metadata: {
              comment: comment.content.substring(0, 50) + '...'
            }
          });
        });
        
        setActivities(realActivities.slice(0, 8)); // Limitar a 8 atividades
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar atividades
  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  // Escutar evento de post adicionado
  useEffect(() => {
    const handlePostAdded = () => {
      loadActivities();
    };

    window.addEventListener('postAdded', handlePostAdded);
    return () => {
      window.removeEventListener('postAdded', handlePostAdded);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.activityFeed.title')}
        </h2>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando atividades...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <TrendingUp size={48} className="mx-auto mb-2" />
              <p className="text-lg font-medium">Nenhuma atividade ainda</p>
              <p className="text-sm">Crie posts ou comente para ver suas atividades aqui!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
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
                    &quot;{activity.metadata.comment}&quot;
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
        )}

        {/* Load more button */}
        {activities.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
              {t('dashboard.activity.loadMore')}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
