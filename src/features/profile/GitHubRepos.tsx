'use client';

import React from 'react';
import { Github, Star, GitFork, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';
import { useLanguage } from '@/contexts/LanguageContext';

export const GitHubRepos: React.FC = () => {
  const { t } = useLanguage();
  const { data: profileData, loading, error } = useGitHubProfile();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github size={20} />
            GitHub Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-gray-500">Loading repositories...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !profileData?.topRepos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github size={20} />
            GitHub Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Github size={48} className="mx-auto mb-4 opacity-50" />
            <p>Unable to load repositories</p>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const repos = profileData.topRepos;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github size={20} />
          Top GitHub Repositories
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your most popular repositories from GitHub
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {repos.map((repo, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {repo.name}
                    </h3>
                    {repo.language && (
                      <Badge variant="secondary" className="text-xs">
                        {repo.language}
                      </Badge>
                    )}
                  </div>
                  
                  {repo.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star size={14} />
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork size={14} />
                      <span>{repo.forks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="ml-4 flex-shrink-0"
                >
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    View
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {repos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Github size={48} className="mx-auto mb-4 opacity-50" />
            <p>No public repositories found</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <Button
            variant="outline"
            asChild
            className="w-full"
          >
            <a
              href={profileData.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <Github size={16} />
              View All Repositories on GitHub
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
