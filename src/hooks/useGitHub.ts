import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  languages: string[];
  publicRepos: number;
  privateRepos: number;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  location: string;
  blog: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  visibility: string;
  fork: boolean;
}

export function useGitHub() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if GitHub is connected
  const checkConnection = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/github/sync');
      const data = await response.json();
      
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
      setError('Failed to check GitHub connection');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync GitHub data
  const syncGitHub = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/github/sync-alt', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to sync GitHub data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync GitHub data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get GitHub stats
  const getGitHubStats = async (): Promise<{ user: GitHubUser; stats: GitHubStats; recentActivity: any[] } | null> => {
    if (!session?.user?.id) return null;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/github/stats');
      const data = await response.json();
      
      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch GitHub stats');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GitHub stats';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get GitHub repositories
  const getGitHubRepos = async (page: number = 1, perPage: number = 20): Promise<GitHubRepo[] | null> => {
    if (!session?.user?.id) return null;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/github/repos?page=${page}&per_page=${perPage}`);
      const data = await response.json();
      
      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch GitHub repositories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GitHub repositories';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check connection on mount
  useEffect(() => {
    if (session?.user?.id) {
      checkConnection();
    }
  }, [session?.user?.id]);

  return {
    isConnected,
    isLoading,
    error,
    checkConnection,
    syncGitHub,
    getGitHubStats,
    getGitHubRepos,
  };
}
