import { useState, useEffect } from 'react';

export interface GitHubProfileData {
  name: string;
  username: string;
  title: string;
  location: string;
  joinDate: string;
  avatar: string;
  bio: string;
  stats: {
    projects: number;
    followers: number;
    experience: string;
    commits: number;
    stars: number;
    languages: number;
  };
  social: {
    github: string;
    website?: string;
    email?: string;
    linkedin?: string;
    twitter?: string;
  };
  badges: string[];
  recentActivity: Array<{
    type: string;
    repo?: string;
    created_at: string;
    url: string;
  }>;
  topRepos: Array<{
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    url: string;
    updated_at: string;
  }>;
  languages: string[];
  githubData: {
    publicRepos: number;
    privateRepos: number;
    totalStars: number;
    totalForks: number;
    accountAge: number;
    lastActive: string;
  };
}

export interface UseGitHubProfileReturn {
  data: GitHubProfileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  lastSync: string | null;
}

export function useGitHubProfile(): UseGitHubProfileReturn {
  const [data, setData] = useState<GitHubProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedData = localStorage.getItem('github-profile-data');
        const cachedSync = localStorage.getItem('github-profile-last-sync');
        
        if (cachedData) {
          setData(JSON.parse(cachedData));
          setLastSync(cachedSync);
          setLoading(false);
        } else {
          // If no cached data, load mock data
          setData(getMockProfileData());
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading cached data:', error);
        setData(getMockProfileData());
        setLoading(false);
      }
    };

    loadCachedData();
  }, []);

  const fetchProfile = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/github/profile-alt', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // If GitHub is not connected and not forcing refresh, keep cached data
        if (response.status === 400 && errorData.error === 'GitHub not connected') {
          if (!forceRefresh) {
            console.log('GitHub not connected, keeping cached data');
            setLoading(false);
            return;
          }
          throw new Error('GitHub not connected');
        }
        
        throw new Error(errorData.error || 'Failed to fetch GitHub profile');
      }

      const result = await response.json();
      
      // Save to localStorage
      localStorage.setItem('github-profile-data', JSON.stringify(result.data));
      localStorage.setItem('github-profile-last-sync', result.lastSync);
      
      setData(result.data);
      setLastSync(result.lastSync);
      setError(null);
    } catch (err) {
      console.error('Error fetching GitHub profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // If error and no cached data, use mock data
      if (!localStorage.getItem('github-profile-data')) {
        setData(getMockProfileData());
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: () => fetchProfile(false), // Normal refresh (uses cache if GitHub not connected)
    forceRefresh: () => fetchProfile(true), // Force refresh from GitHub
    lastSync,
  };
}

// Mock data for when GitHub is not connected
function getMockProfileData(): GitHubProfileData {
  return {
    name: 'Gabrielle Ribeiro',
    username: 'gabrielle',
    title: 'Polyglot Developer',
    location: 'Belém',
    joinDate: 'Member since 2024',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Adoro um desafio!',
    stats: {
      projects: 14,
      followers: 1,
      experience: '1+ years',
      commits: 48,
      stars: 3,
      languages: 12
    },
    social: {
      github: 'https://github.com/gabrielle',
      website: '',
      email: 'gabrielle@example.com',
      linkedin: '',
      twitter: ''
    },
    badges: ['React', 'Python', 'Docker', 'Git'],
    recentActivity: [
      {
        type: 'PushEvent',
        repo: 'nerdino-nextjs',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        url: 'https://github.com/gabrielle/nerdino-nextjs'
      },
      {
        type: 'CreateEvent',
        repo: 'portfolio',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
        url: 'https://github.com/gabrielle/portfolio'
      },
      {
        type: 'PushEvent',
        repo: 'task-manager',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
        url: 'https://github.com/gabrielle/task-manager'
      }
    ],
    topRepos: [
      {
        name: 'nerdino-nextjs',
        description: 'Developer personal branding platform',
        stars: 3,
        forks: 1,
        language: 'TypeScript',
        url: 'https://github.com/gabrielle/nerdino-nextjs',
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
      }
    ],
    languages: ['TypeScript', 'JavaScript', 'Python', 'React', 'Next.js', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'Docker', 'Git'],
    githubData: {
      publicRepos: 14,
      privateRepos: 0,
      totalStars: 3,
      totalForks: 1,
      accountAge: 1,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
    }
  };
}
