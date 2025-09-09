'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, User, Github, FileText, Code, Share2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHub } from '@/hooks/useGitHub';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'outline' | 'secondary';
  onClick: () => void;
}

export const QuickActions: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected, syncGitHub, getGitHubStats } = useGitHub();
  const [githubStats, setGithubStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadGitHubStats();
    }
  }, [isConnected]);

  const loadGitHubStats = async () => {
    try {
      setIsLoading(true);
      const stats = await getGitHubStats();
      setGithubStats(stats);
    } catch (error) {
      console.error('Failed to load GitHub stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncGitHub = async () => {
    try {
      setIsLoading(true);
      await syncGitHub();
      await loadGitHubStats();
    } catch (error) {
      console.error('Failed to sync GitHub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-project',
      label: t('dashboard.newProject'),
      icon: <Plus size={16} />,
      variant: 'default',
      onClick: () => console.log('New project clicked')
    },
    {
      id: 'make-post',
      label: t('dashboard.makePost'),
      icon: <Edit3 size={16} />,
      variant: 'outline',
      onClick: () => console.log('Make post clicked')
    },
    {
      id: 'view-profile',
      label: t('dashboard.viewPublicProfile'),
      icon: <User size={16} />,
      variant: 'outline',
      onClick: () => console.log('View profile clicked')
    },
    {
      id: 'sync-github',
      label: isLoading ? 'Sincronizando...' : t('dashboard.syncGitHub'),
      icon: <Github size={16} />,
      variant: 'outline',
      onClick: handleSyncGitHub
    }
  ];

  const additionalActions = [
    {
      id: 'create-readme',
      label: t('dashboard.quickActions.createReadme'),
      icon: <FileText size={16} />,
      onClick: () => console.log('Create README clicked')
    },
    {
      id: 'code-snippet',
      label: t('dashboard.quickActions.shareCode'),
      icon: <Code size={16} />,
      onClick: () => console.log('Share code clicked')
    },
    {
      id: 'share-project',
      label: t('dashboard.quickActions.shareProject'),
      icon: <Share2 size={16} />,
      onClick: () => console.log('Share project clicked')
    },
    {
      id: 'settings',
      label: t('dashboard.quickActions.settings'),
      icon: <Settings size={16} />,
      onClick: () => console.log('Settings clicked')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.quickActions.title')}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        <div className="space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              className="w-full justify-start"
              onClick={action.onClick}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('dashboard.quickActions.moreActions')}
          </h3>
          
          {/* Additional Actions Grid */}
          <div className="grid grid-cols-2 gap-2">
            {additionalActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center p-3 h-auto"
                onClick={action.onClick}
              >
                {action.icon}
                <span className="text-xs mt-1 text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('dashboard.quickActions.quickSummary')}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {githubStats ? githubStats.stats.totalRepos : '0'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.quickActions.projects')}</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {githubStats ? githubStats.stats.totalStars : '0'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Stars</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {githubStats ? githubStats.user.followers : '0'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.quickActions.followers')}</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {githubStats ? githubStats.user.following : '0'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.quickActions.following')}</div>
            </div>
          </div>
        </div>

        {/* GitHub Integration Status */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Github size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? t('dashboard.quickActions.githubConnected') : 'GitHub não conectado'}
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          {isConnected && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {githubStats ? 'Dados sincronizados' : 'Clique em sincronizar para carregar dados'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
