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

interface Post {
  id: number;
  type: string;
  author: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    title: string;
    verified: boolean;
  };
  content: string;
  tags: string[];
  timestamp: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  userLiked: boolean;
  userSaved: boolean;
  userFollowed: boolean;
  imageUrl?: string;
  linkPreview?: {
    title: string;
    description: string;
    image: string;
    domain: string;
  };
  linkUrl?: string;
  codeSnippet?: {
    language: string;
    filename: string;
    code: string;
  };
}

export default function CommunityPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<any[]>([]);
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

  // Carregar posts salvos do localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts);
      setPosts(parsedPosts);
      setFilteredPosts(parsedPosts);
    }
  }, []);

  // Carregar comentários do localStorage
  useEffect(() => {
    const savedComments = localStorage.getItem('communityComments');
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      // Converter para array de comentários
      const allComments: any[] = [];
      Object.values(parsedComments).forEach((postComments: any) => {
        allComments.push(...postComments);
      });
      setComments(allComments);
    }
  }, []);

  // Função para adicionar novo post
  const handlePostCreated = (newPost: Post) => {
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    setFilteredPosts(updatedPosts);
    
    // Salvar no localStorage
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  // Função para atualizar posts (para interações)
  const updatePosts = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    setFilteredPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

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
              <ActivitySidebar posts={posts} comments={comments} />
              <TrendingSidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <CreatePost onPostCreated={handlePostCreated} />
              
              {/* Feed Filters */}
              <FeedFilters 
                filters={filters}
                setFilters={setFilters}
              />
              
              {/* Community Feed */}
              {filteredPosts.length > 0 ? (
                <CommunityFeed posts={filteredPosts} onPostsUpdate={updatePosts} />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg">
                    Nenhum post ainda
                  </div>
                  <p className="text-gray-400 dark:text-gray-500 mt-2">
                    Seja o primeiro a compartilhar algo com a comunidade!
                  </p>
                </div>
              )}
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
