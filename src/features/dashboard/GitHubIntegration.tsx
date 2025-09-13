'use client';

import React, { useState, useEffect } from 'react';
import { Github, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGitHub } from '@/hooks/useGitHub';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export const GitHubIntegration: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected, isLoading, error, syncGitHub, getGitHubStats } = useGitHub();
  const [stats, setStats] = useState<{
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    totalCommits: number;
    languages: Record<string, number>;
    recentActivity: Array<{
      repo: string;
      type: string;
      date: string;
    }>;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncGitHub();
      console.log('Sync result:', result);
      // Refresh stats after sync
      const newStats = await getGitHubStats();
      if (newStats) {
        setStats({
          totalRepos: newStats.stats?.totalRepos || 0,
          totalStars: newStats.stats?.totalStars || 0,
          totalForks: (newStats.stats as any)?.totalForks || 0,
          totalCommits: (newStats.stats as any)?.totalCommits || 0,
          languages: (newStats.stats as any)?.languages || {},
          recentActivity: newStats.recentActivity?.map(activity => ({
            repo: activity.repo,
            type: activity.type,
            date: activity.date
          })) || []
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadStats = async () => {
    if (isConnected) {
      const githubStats = await getGitHubStats();
      if (githubStats) {
        setStats({
          totalRepos: githubStats.stats?.totalRepos || 0,
          totalStars: githubStats.stats?.totalStars || 0,
          totalForks: (githubStats.stats as any)?.totalForks || 0,
          totalCommits: (githubStats.stats as any)?.totalCommits || 0,
          languages: (githubStats.stats as any)?.languages || {},
          recentActivity: githubStats.recentActivity?.map(activity => ({
            repo: activity.repo,
            type: activity.type,
            date: activity.date
          })) || []
        });
      }
    }
  };

  useEffect(() => {
    loadStats();
  }, [isConnected]);

  if (isConnected === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Github className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Connect GitHub</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your GitHub account to automatically sync your repositories and profile data.
            </p>
            <Button asChild>
              <Link href="/api/auth/signin/github">
                <Github className="w-4 h-4 mr-2" />
                Connect GitHub
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Integration
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Connected
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sync
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.totalRepos}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Repositories
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.totalStars}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Stars
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(stats as any).user?.followers || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Followers
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats?.languages || {}).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Languages
                </div>
              </div>
            </div>

            {Object.keys(stats?.languages || {}).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Top Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(stats?.languages || {}).slice(0, 8).map((language: string) => (
                    <Badge key={language} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={(stats as any).user?.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`${(stats as any).user?.html_url}?tab=repositories`} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  View Repos
                </a>
              </Button>
            </div>
          </div>
        )}

        {!stats && !isLoading && (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Click sync to load your GitHub data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
