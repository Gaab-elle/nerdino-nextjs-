import { useState, useEffect } from 'react';
import { Tag, TagsResponse, CreateTagRequest, UpdateTagRequest, TagsQuery } from '@/types/api';

// Hook para gerenciar tags
export function useTags(query: TagsQuery = {}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await fetch(`/api/tags?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data: TagsResponse = await response.json();
      setTags(data.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [query.search, query.limit]);

  const createTag = async (tagData: CreateTagRequest): Promise<Tag | null> => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        throw new Error('Failed to create tag');
      }

      const newTag = await response.json();
      setTags(prev => [newTag, ...prev]);
      return newTag;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
      return null;
    }
  };

  const updateTag = async (id: string, tagData: UpdateTagRequest): Promise<Tag | null> => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        throw new Error('Failed to update tag');
      }

      const updatedTag = await response.json();
      setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
      return updatedTag;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag');
      return null;
    }
  };

  const deleteTag = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }

      setTags(prev => prev.filter(tag => tag.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
      return false;
    }
  };

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    refetch: fetchTags,
  };
}

// Hook para uma tag específica
export function useTag(id: string) {
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTag = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tags/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tag');
      }

      const data = await response.json();
      setTag(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTag();
    }
  }, [id]);

  return {
    tag,
    loading,
    error,
    refetch: fetchTag,
  };
}

// Hook para tags populares
export function usePopularTags(limit: number = 20) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tags?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch popular tags');
      }

      const data: TagsResponse = await response.json();
      // Ordenar por número de posts
      const sortedTags = data.tags.sort((a, b) => b._count.posts - a._count.posts);
      setTags(sortedTags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularTags();
  }, [limit]);

  return {
    tags,
    loading,
    error,
    refetch: fetchPopularTags,
  };
}
