'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { CreatePost } from '@/components/community/CreatePost';
import { FeedFilters } from '@/components/community/FeedFilters';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { TrendingSidebar } from '@/components/community/TrendingSidebar';
import { ActivitySidebar } from '@/components/community/ActivitySidebar';
import { SuggestionsSidebar } from '@/components/community/SuggestionsSidebar';
import { PopularTagsSidebar } from '@/components/community/PopularTagsSidebar';
import { QuickStatsSidebar } from '@/components/community/QuickStatsSidebar';

export default function CommunityPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    sortBy: 'recent',
    feed: 'all' // 'all' or 'following'
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load mock posts data
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        type: 'achievement',
        author: {
          id: 1,
          name: 'Lucas Martins',
          username: 'lucasmartins',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          title: 'Full Stack Developer',
          verified: true
        },
        content: 'Update: Consegui uma vaga como Tech Lead na TechCorp! Foram 3 meses de processo, mas valeu muito a pena. Obrigado a todos que me ajudaram com dicas e networking aqui na comunidade. Vamos que vamos! 🚀',
        tags: ['#techlead', '#carreira', '#conquista', '#networking'],
        timestamp: '1 dia atrás',
        stats: {
          likes: 234,
          comments: 45,
          shares: 18,
          saves: 12
        },
        userLiked: false,
        userSaved: false,
        userFollowed: false
      },
      {
        id: 2,
        type: 'tutorial',
        author: {
          id: 2,
          name: 'Thiago Silva',
          username: 'thiagosilva',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          title: 'DevOps Engineer',
          verified: false
        },
        content: 'Acabei de publicar um tutorial completo sobre como configurar CI/CD com GitHub Actions para projetos Node.js. Cobre desde o básico até deploy automático em produção. Link nos comentários! 📚',
        tags: ['#githubactions', '#cicd', '#nodejs', '#devops'],
        timestamp: '1 dia atrás',
        stats: {
          likes: 89,
          comments: 23,
          shares: 15,
          saves: 8
        },
        userLiked: true,
        userSaved: false,
        userFollowed: false
      },
      {
        id: 3,
        type: 'code',
        author: {
          id: 3,
          name: 'Carlos Silva',
          username: 'carlossilva',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          title: 'Senior React Developer',
          verified: true
        },
        content: 'Dica rápida: Como implementar um hook customizado para debounce em React. Super útil para campos de busca e evitar requests desnecessários! 💡',
        codeSnippet: {
          language: 'javascript',
          filename: 'useDebounce.js',
          code: `import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};`
        },
        tags: ['#react', '#hooks', '#javascript', '#performance'],
        timestamp: '4 horas atrás',
        stats: {
          likes: 89,
          comments: 23,
          shares: 15,
          saves: 5
        },
        userLiked: false,
        userSaved: true,
        userFollowed: false
      },
      {
        id: 4,
        type: 'project',
        author: {
          id: 4,
          name: 'Ana Santos',
          username: 'anasantos',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          title: 'Backend Developer',
          verified: false
        },
        content: 'Consegui minha primeira contribuição aceita no repositório oficial do Django! Foi uma correção pequena na documentação, mas estou muito feliz. Para quem está começando no open source, minha dica é: comecem pequeno e sejam consistentes! 🎉',
        project: {
          name: 'Django Documentation Fix',
          description: 'Correção na documentação do Django para melhorar clareza dos exemplos',
          githubUrl: 'https://github.com/django/django',
          demoUrl: null,
          technologies: ['Python', 'Django', 'Documentation']
        },
        tags: ['#django', '#opensource', '#python', '#contribuição'],
        timestamp: '8 horas atrás',
        stats: {
          likes: 156,
          comments: 34,
          shares: 12,
          saves: 7
        },
        userLiked: true,
        userSaved: false,
        userFollowed: true
      },
      {
        id: 5,
        type: 'question',
        author: {
          id: 5,
          name: 'Maria Rodriguez',
          username: 'mariarodriguez',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          title: 'Full Stack Developer',
          verified: false
        },
        content: 'Acabei de lançar meu mais novo projeto! Um dashboard de analytics para APIs que mostra métricas em tempo real. Levei 3 meses para desenvolver e estou muito orgulhosa do resultado. Que acham? 🚀',
        tags: ['#dashboard', '#analytics', '#apis', '#realtime'],
        timestamp: '2 horas atrás',
        stats: {
          likes: 67,
          comments: 19,
          shares: 8,
          saves: 3
        },
        userLiked: false,
        userSaved: false,
        userFollowed: false
      }
    ];
    
    setPosts(mockPosts);
    setFilteredPosts(mockPosts);
  }, []);

  // Filter and sort posts
  useEffect(() => {
    let filtered = [...posts];

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(post => post.type === filters.type);
    }

    // Sort
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.stats.likes - a.stats.likes);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.stats.likes + b.stats.comments + b.stats.shares) - (a.stats.likes + a.stats.comments + a.stats.shares));
        break;
    }

    setFilteredPosts(filtered);
  }, [posts, filters]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <CommunityHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <ActivitySidebar />
              <TrendingSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <CreatePost />
              
              {/* Feed Filters */}
              <FeedFilters 
                filters={filters}
                setFilters={setFilters}
              />
              
              {/* Community Feed */}
              <CommunityFeed posts={filteredPosts} />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <SuggestionsSidebar />
              <PopularTagsSidebar />
              <QuickStatsSidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
