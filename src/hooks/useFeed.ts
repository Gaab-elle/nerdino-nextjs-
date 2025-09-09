import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Post, FeedResponse, FeedQuery } from '@/types/api';

// Hook para feed personalizado
export function useFeed(query: FeedQuery = {}) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [feedType, setFeedType] = useState<'following' | 'trending' | 'recommended'>('following');

  const fetchFeed = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.type) params.append('type', query.type);

      const response = await fetch(`/api/feed?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const data: FeedResponse = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
      setFeedType(data.type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [session?.user?.id, query.page, query.limit, query.type]);

  const likePost = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const result = await response.json();
      
      // Atualizar o post na lista
      setPosts(prev => prev.map(post => {
        if (post.id === id) {
          const isLiked = result.liked;
          const likeCount = post._count.likes + (isLiked ? 1 : -1);
          
          return {
            ...post,
            _count: {
              ...post._count,
              likes: likeCount,
            },
          };
        }
        return post;
      }));

      return result.liked;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
      return false;
    }
  };

  const refreshFeed = () => {
    fetchFeed();
  };

  const loadMore = async () => {
    if (pagination.page >= pagination.pages) return;

    try {
      const nextPage = pagination.page + 1;
      const params = new URLSearchParams();
      params.append('page', nextPage.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.type) params.append('type', query.type);

      const response = await fetch(`/api/feed?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load more posts');
      }

      const data: FeedResponse = await response.json();
      setPosts(prev => [...prev, ...data.posts]);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts');
    }
  };

  return {
    posts,
    loading,
    error,
    pagination,
    feedType,
    likePost,
    refreshFeed,
    loadMore,
    refetch: fetchFeed,
  };
}

// Hook para feed de posts populares (sem autenticação)
export function usePublicFeed(query: Omit<FeedQuery, 'type'> = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchPublicFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      params.append('sortBy', 'trending'); // Sempre trending para feed público

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch public feed');
      }

      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicFeed();
  }, [query.page, query.limit]);

  const likePost = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const result = await response.json();
      
      // Atualizar o post na lista
      setPosts(prev => prev.map(post => {
        if (post.id === id) {
          const isLiked = result.liked;
          const likeCount = post._count.likes + (isLiked ? 1 : -1);
          
          return {
            ...post,
            _count: {
              ...post._count,
              likes: likeCount,
            },
          };
        }
        return post;
      }));

      return result.liked;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
      return false;
    }
  };

  const loadMore = async () => {
    if (pagination.page >= pagination.pages) return;

    try {
      const nextPage = pagination.page + 1;
      const params = new URLSearchParams();
      params.append('page', nextPage.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      params.append('sortBy', 'trending');

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load more posts');
      }

      const data = await response.json();
      setPosts(prev => [...prev, ...data.posts]);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts');
    }
  };

  return {
    posts,
    loading,
    error,
    pagination,
    likePost,
    loadMore,
    refetch: fetchPublicFeed,
  };
}
