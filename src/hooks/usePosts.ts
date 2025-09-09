import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Post, PostsResponse, CreatePostRequest, UpdatePostRequest, PostsQuery } from '@/types/api';

// Hook para gerenciar posts
export function usePosts(query: PostsQuery = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.type) params.append('type', query.type);
      if (query.tag) params.append('tag', query.tag);
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.search) params.append('search', query.search);

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: PostsResponse = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [query.page, query.limit, query.type, query.tag, query.sortBy, query.search]);

  const createPost = async (postData: CreatePostRequest): Promise<Post | null> => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      return null;
    }
  };

  const updatePost = async (id: string, postData: UpdatePostRequest): Promise<Post | null> => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      setPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
      return updatedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      return null;
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(prev => prev.filter(post => post.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      return false;
    }
  };

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

  return {
    posts,
    loading,
    error,
    pagination,
    createPost,
    updatePost,
    deletePost,
    likePost,
    refetch: fetchPosts,
  };
}

// Hook para um post específico
export function usePost(id: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const likePost = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const result = await response.json();
      
      if (post) {
        const isLiked = result.liked;
        const likeCount = post._count.likes + (isLiked ? 1 : -1);
        
        setPost({
          ...post,
          _count: {
            ...post._count,
            likes: likeCount,
          },
        });
      }

      return result.liked;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
      return false;
    }
  };

  return {
    post,
    loading,
    error,
    likePost,
    refetch: fetchPost,
  };
}

// Hook para posts de um usuário
export function useUserPosts(userId: string, query: Omit<PostsQuery, 'userId'> = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.type) params.append('type', query.type);
      if (query.sortBy) params.append('sortBy', query.sortBy);

      const response = await fetch(`/api/users/${userId}/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }

      const data: PostsResponse = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserPosts();
    }
  }, [userId, query.page, query.limit, query.type, query.sortBy]);

  return {
    posts,
    loading,
    error,
    pagination,
    refetch: fetchUserPosts,
  };
}
