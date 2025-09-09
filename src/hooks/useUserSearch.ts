import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { User, UsersSearchResponse, UsersSearchQuery } from '@/types/messages';

// Hook para buscar usuários
export function useUserSearch(query: UsersSearchQuery) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async () => {
    if (!session?.user?.id || !query.q || query.q.trim().length < 2) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('q', query.q.trim());
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await fetch(`/api/users/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data: UsersSearchResponse = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, query.q, query.limit]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchUsers]);

  return {
    users,
    loading,
    error,
    searchUsers,
  };
}

// Hook para buscar usuários com debounce
export function useUserSearchDebounced(initialQuery: string = '', limit: number = 20) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchResult = useUserSearch({ q: debouncedQuery, limit });

  return {
    ...searchResult,
    query,
    setQuery,
    debouncedQuery,
  };
}
