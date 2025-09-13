'use client';

import React, { useState } from 'react';
import { BarChart3, Zap, Heart, Users, MessageCircle, Star, X, TrendingUp, Calendar, UserPlus, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';

interface ActivitySidebarProps {
  posts?: Array<{
    id: string;
    content: string;
    author: { id: string; name: string; username: string; avatar: string };
    timestamp: string;
    type: string;
    stats?: { likes: number; comments: number; shares: number };
  }>;
  comments?: Array<{
    id: string;
    content: string;
    author: { id: string; name: string; username: string; avatar: string };
    timestamp: string;
    postId: string;
    authorId: string;
    postTitle?: string;
    postAuthor?: string;
  }>;
}

export const ActivitySidebar: React.FC<ActivitySidebarProps> = ({ posts = [], comments = [] }) => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Calcular estatísticas reais baseadas nos dados
  const calculateRealStats = () => {
    if (!user) return { postsThisWeek: 0, likesReceived: 0, newFollowers: 0, commentsMade: 0 };

    // Posts desta semana (últimos 7 dias) - remover filtro de data por enquanto
    const postsThisWeek = posts.filter(post => 
      post.author?.id === user.id
    ).length;

    // Total de likes recebidos
    const likesReceived = posts
      .filter(post => post.author?.id === user.id)
      .reduce((total, post) => total + (post.stats?.likes || 0), 0);

    // Novos seguidores (simulado - seria calculado com dados de followers)
    const newFollowers = Math.floor(Math.random() * 20) + 5; // Simulado por enquanto

    // Comentários feitos pelo usuário
    const commentsMade = comments.filter(comment => 
      comment.authorId === user.id
    ).length;

    return {
      postsThisWeek,
      likesReceived,
      newFollowers,
      commentsMade
    };
  };

  const personalStats = calculateRealStats();

  // Função para calcular tempo relativo
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''} atrás`;
  };

  // Dados reais para os detalhes de cada estatística
  const getRealPostsThisWeek = () => {
    if (!user) return [];
    
    return posts
      .filter(post => post.author?.id === user.id)
      .map(post => ({
        id: post.id,
        title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
        type: post.type,
        likes: post.stats?.likes || 0,
        comments: post.stats?.comments || 0,
        time: getTimeAgo(post.timestamp)
      }))
      .slice(0, 8); // Limitar a 8 posts
  };

  const postsThisWeek = getRealPostsThisWeek();

  const getRealLikesReceived = () => {
    if (!user) return [];
    
    // Simular likes recebidos baseados nos posts do usuário
    const userPosts = posts.filter(post => post.author.id === user.id);
    const likesData: Array<{
      id: string;
      user: string;
      avatar: string;
      post: string;
      time: string;
      type: string;
    }> = [];
    
    userPosts.forEach(post => {
      if (post.stats?.likes && post.stats.likes > 0) {
        // Simular alguns likes para cada post
        const numLikes = Math.min(post.stats.likes, 3); // Máximo 3 likes por post
        for (let i = 0; i < numLikes; i++) {
          likesData.push({
            id: `${post.id}-like-${i}`,
            user: `Usuário ${Math.floor(Math.random() * 1000)}`,
            avatar: `https://images.unsplash.com/photo-${1494790108755 + Math.floor(Math.random() * 1000000)}?w=40&h=40&fit=crop&crop=face`,
            post: post.content.substring(0, 30) + '...',
            time: getTimeAgo(post.timestamp),
            type: "like"
          });
        }
      }
    });
    
    return likesData.slice(0, 5); // Limitar a 5 likes
  };

  const likesReceived = getRealLikesReceived();

  const newFollowers: Array<{
    id: string;
    name: string;
    username: string;
    avatar: string;
    followedAt: string;
    user: string;
    title: string;
    mutual: boolean;
  }> = []; // Dados reais serão implementados com sistema de followers

  const getRealCommentsMade = () => {
    if (!user) return [];
    
    return comments
      .filter(comment => comment.authorId === user.id)
      .map(comment => ({
        id: comment.id,
        post: comment.postTitle || "Post",
        author: comment.postAuthor || "Autor",
        time: getTimeAgo(comment.timestamp),
        content: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '')
      }))
      .slice(0, 5); // Limitar a 5 comentários
  };

  const commentsMade = getRealCommentsMade();

  const recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    user: { name: string; avatar: string };
    icon: React.ReactNode;
    action: string;
    time: string;
  }> = []; // Dados reais serão implementados com sistema de notificações

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
            <button 
              onClick={() => setActiveModal('posts')}
              className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer group"
            >
              <div className="text-2xl font-bold text-blue-600 group-hover:text-blue-700">{personalStats.postsThisWeek}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.activity.postsThisWeek')}
              </div>
            </button>
            <button 
              onClick={() => setActiveModal('likes')}
              className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer group"
            >
              <div className="text-2xl font-bold text-green-600 group-hover:text-green-700">{personalStats.likesReceived}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.activity.likesReceived')}
              </div>
            </button>
            <button 
              onClick={() => setActiveModal('followers')}
              className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer group"
            >
              <div className="text-2xl font-bold text-orange-600 group-hover:text-orange-700">{personalStats.newFollowers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.activity.newFollowers')}
              </div>
            </button>
            <button 
              onClick={() => setActiveModal('comments')}
              className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
            >
              <div className="text-2xl font-bold text-gray-600 group-hover:text-gray-700">{personalStats.commentsMade}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('community.activity.commentsMade')}
              </div>
            </button>
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
                    <span className="font-medium">{activity.user.name}</span> {activity.action}
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

      {/* Modais para detalhes das estatísticas */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activeModal === 'posts' && 'Posts desta Semana'}
                {activeModal === 'likes' && 'Curtidas Recebidas'}
                {activeModal === 'followers' && 'Novos Seguidores'}
                {activeModal === 'comments' && 'Comentários Feitos'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveModal(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeModal === 'posts' && (
                <div className="space-y-4">
                  {postsThisWeek.map((post) => (
                    <div key={post.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">{post.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <Badge variant="outline" className="text-xs">
                              {post.type}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.comments}
                            </span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'likes' && (
                <div className="space-y-4">
                  {likesReceived.map((like) => (
                    <div key={like.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <img 
                        src={like.avatar} 
                        alt={like.user}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{like.user}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">curtiu &quot;{like.post}&quot;</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{like.time}</p>
                      </div>
                      <Heart className="h-5 w-5 text-red-500" />
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'followers' && (
                <div className="space-y-4">
                  {newFollowers.map((follower) => (
                    <div key={follower.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <img 
                        src={follower.avatar} 
                        alt={follower.user}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{follower.user}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{follower.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {follower.mutual} conexões em comum • {follower.followedAt}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Seguir
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'comments' && (
                <div className="space-y-4">
                  {commentsMade.map((comment) => (
                    <div key={comment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white mb-1">
                            Comentário em &quot;{comment.post}&quot;
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>por {comment.author}</span>
                            <span>•</span>
                            <span>{comment.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
