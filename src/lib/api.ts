// API utility functions for community features

import { Post, Comment, Tag, LikeResponse, LikeStatusResponse } from '@/types/api';

// Base API URL
const API_BASE = '/api';

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Posts API
export const postsApi = {
  // Get all posts
  getAll: (params: URLSearchParams) => 
    apiCall<{ posts: Post[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/posts?${params}`),

  // Get single post
  getById: (id: string) => 
    apiCall<Post>(`/posts/${id}`),

  // Create post
  create: (data: { content: string; type: string; tags?: string[] }) => 
    apiCall<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update post
  update: (id: string, data: { content?: string; type?: string; tags?: string[] }) => 
    apiCall<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete post
  delete: (id: string) => 
    apiCall<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    }),

  // Like/unlike post
  toggleLike: (id: string) => 
    apiCall<LikeResponse>(`/posts/${id}/like`, {
      method: 'POST',
    }),

  // Check if user liked post
  getLikeStatus: (id: string) => 
    apiCall<LikeStatusResponse>(`/posts/${id}/like`),

  // Get user posts
  getByUser: (userId: string, params: URLSearchParams) => 
    apiCall<{ posts: Post[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/users/${userId}/posts?${params}`),
};

// Comments API
export const commentsApi = {
  // Get post comments
  getByPost: (postId: string, params: URLSearchParams) => 
    apiCall<{ comments: Comment[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/posts/${postId}/comments?${params}`),

  // Get single comment
  getById: (id: string) => 
    apiCall<Comment>(`/comments/${id}`),

  // Create comment
  create: (postId: string, data: { content: string; parentId?: string }) => 
    apiCall<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update comment
  update: (id: string, data: { content?: string }) => 
    apiCall<Comment>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete comment
  delete: (id: string) => 
    apiCall<{ message: string }>(`/comments/${id}`, {
      method: 'DELETE',
    }),

  // Like/unlike comment
  toggleLike: (id: string) => 
    apiCall<LikeResponse>(`/comments/${id}/like`, {
      method: 'POST',
    }),

  // Check if user liked comment
  getLikeStatus: (id: string) => 
    apiCall<LikeStatusResponse>(`/comments/${id}/like`),
};

// Tags API
export const tagsApi = {
  // Get all tags
  getAll: (params: URLSearchParams) => 
    apiCall<{ tags: Tag[] }>(`/tags?${params}`),

  // Get single tag
  getById: (id: string) => 
    apiCall<Tag>(`/tags/${id}`),

  // Create tag
  create: (data: { name: string; description?: string }) => 
    apiCall<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update tag
  update: (id: string, data: { name?: string; description?: string }) => 
    apiCall<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete tag
  delete: (id: string) => 
    apiCall<{ message: string }>(`/tags/${id}`, {
      method: 'DELETE',
    }),
};

// Feed API
export const feedApi = {
  // Get personalized feed
  getFeed: (params: URLSearchParams) => 
    apiCall<{ posts: Post[]; pagination: { page: number; limit: number; total: number; totalPages: number }; type: string }>(`/feed?${params}`),
};

// Utility functions
export const apiUtils = {
  // Build query string from object
  buildQueryString: (params: Record<string, string | number | boolean | string[]>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return searchParams.toString();
  },

  // Format error message
  formatError: (error: { message?: string; error?: string }): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  },

  // Check if response is successful
  isSuccess: (response: Response): boolean => {
    return response.ok;
  },

  // Get error from response
  getErrorFromResponse: async (response: Response): Promise<string> => {
    try {
      const error = await response.json();
      return error.error || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
  },
};

// Export all APIs
export const api = {
  posts: postsApi,
  comments: commentsApi,
  tags: tagsApi,
  feed: feedApi,
  utils: apiUtils,
};
