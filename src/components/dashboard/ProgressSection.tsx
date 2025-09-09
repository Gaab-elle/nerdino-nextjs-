'use client';

import React, { useState, useEffect } from 'react';
import { GitCommit, FolderOpen, Clock, AlertCircle, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHub } from '@/hooks/useGitHub';

interface ProgressStats {
  commitsThisWeek: number;
  activeProjects: number;
  avgDevTime: string;
  abandonedProjects: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface AbandonedProject {
  id: string;
  name: string;
  lastActivity: string;
  daysSinceLastCommit: number;
}

const mockStats: ProgressStats = {
  commitsThisWeek: 24,
  activeProjects: 3,
  avgDevTime: '2.5h/dia',
  abandonedProjects: 2,
  weeklyGoal: 30,
  weeklyProgress: 80
};

const getMockAbandonedProjects = (t: (key: string) => string): AbandonedProject[] => [
  {
    id: '1',
    name: 'Mobile App',
    lastActivity: `15 ${t('dashboard.progress.daysAgo')}`,
    daysSinceLastCommit: 15
  },
  {
    id: '2',
    name: 'Blog System',
    lastActivity: `8 ${t('dashboard.progress.daysAgo')}`,
    daysSinceLastCommit: 8
  }
];

export const ProgressSection: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected, getGitHubStats } = useGitHub();
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

  const mockAbandonedProjects = getMockAbandonedProjects(t);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.yourProgress')}
        </h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Progress */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('dashboard.progress.weeklyGoal')}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {githubStats ? githubStats.stats.totalRepos : mockStats.commitsThisWeek}/{mockStats.weeklyGoal}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${mockStats.weeklyProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {mockStats.weeklyProgress}% {t('dashboard.progress.goalReached')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <GitCommit size={24} className="text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {githubStats ? githubStats.stats.totalRepos : mockStats.commitsThisWeek}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('dashboard.progress.commits')}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FolderOpen size={24} className="text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {githubStats ? githubStats.stats.totalStars : mockStats.activeProjects}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('dashboard.progress.activeProjects')}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock size={24} className="text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {mockStats.avgDevTime}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('dashboard.progress.devTime')}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <TrendingUp size={24} className="text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              +12%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('dashboard.progress.vsLastWeek')}
            </div>
          </div>
        </div>

        {/* Abandoned Projects */}
        {mockAbandonedProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <AlertCircle size={16} className="text-yellow-500 mr-2" />
                {t('dashboard.progress.abandonedProjects')}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {mockAbandonedProjects.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {mockAbandonedProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {project.lastActivity}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    {t('dashboard.progress.reviveProject')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Target size={16} className="text-purple-500 mr-2" />
            {t('dashboard.progress.weeklyGoals')}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('dashboard.progress.commits')}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {mockStats.commitsThisWeek}/{mockStats.weeklyGoal}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('dashboard.progress.activeProjects')}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {mockStats.activeProjects}/5
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('dashboard.progress.devTime')}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {mockStats.avgDevTime}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
