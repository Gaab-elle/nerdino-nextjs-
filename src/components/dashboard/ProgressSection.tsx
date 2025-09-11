'use client';

import React, { useState, useEffect } from 'react';
import { GitCommit, FolderOpen, Clock, AlertCircle, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHub } from '@/hooks/useGitHub';
import { useSession } from 'next-auth/react';

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

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now.getTime() - past.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Hoje';
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
  return `${Math.floor(diffInDays / 30)} meses atrás`;
};

export const ProgressSection: React.FC = () => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const { isConnected, getGitHubStats } = useGitHub();
  const [githubStats, setGithubStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    commitsThisWeek: 0,
    activeProjects: 0,
    avgDevTime: '0h/dia',
    abandonedProjects: 0,
    weeklyGoal: 30,
    weeklyProgress: 0
  });
  const [abandonedProjects, setAbandonedProjects] = useState<AbandonedProject[]>([]);

  useEffect(() => {
    if (isConnected) {
      loadGitHubStats();
    }
  }, [isConnected]);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  useEffect(() => {
    // Atualizar dados quando houver mudanças nos posts/projetos
    const handleDataUpdate = () => {
      if (user) {
        loadProgressData();
      }
    };

    window.addEventListener('postAdded', handleDataUpdate);
    window.addEventListener('projectAdded', handleDataUpdate);

    return () => {
      window.removeEventListener('postAdded', handleDataUpdate);
      window.removeEventListener('projectAdded', handleDataUpdate);
    };
  }, [user]);

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

  const loadProgressData = () => {
    try {
      // Carregar projetos do usuário
      const savedProjects = localStorage.getItem('userProjects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      const userProjects = projects.filter((project: any) => project.authorId === user?.id);

      // Carregar posts do usuário
      const savedPosts = localStorage.getItem('communityPosts');
      const posts = savedPosts ? JSON.parse(savedPosts) : [];
      const userPosts = posts.filter((post: any) => post.author.id === user?.id);

      // Calcular estatísticas
      const activeProjects = userProjects.filter((p: any) => p.status === 'inProgress').length;
      const abandonedProjectsList = userProjects.filter((p: any) => {
        const lastActivity = new Date(p.lastActivity || p.timestamp || Date.now());
        const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 7; // Projetos sem atividade há mais de 7 dias
      });

      // Calcular commits baseado em posts de código
      const codePosts = userPosts.filter((post: any) => post.type === 'code');
      const commitsThisWeek = codePosts.length;

      // Calcular tempo de desenvolvimento (estimativa baseada em atividade)
      const totalPosts = userPosts.length;
      const avgDevTime = totalPosts > 0 ? `${Math.min(totalPosts * 0.5, 8)}h/dia` : '0h/dia';

      // Calcular progresso semanal
      const weeklyProgress = Math.min((commitsThisWeek / 30) * 100, 100);

      setProgressStats({
        commitsThisWeek,
        activeProjects,
        avgDevTime,
        abandonedProjects: abandonedProjectsList.length,
        weeklyGoal: 30,
        weeklyProgress
      });

      // Mapear projetos abandonados
      const abandonedProjectsData = abandonedProjectsList.map((project: any) => ({
        id: project.id,
        name: project.name,
        lastActivity: getTimeAgo(project.lastActivity || project.timestamp),
        daysSinceLastCommit: Math.floor((Date.now() - new Date(project.lastActivity || project.timestamp).getTime()) / (1000 * 60 * 60 * 24))
      }));

      setAbandonedProjects(abandonedProjectsData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

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
              {progressStats.commitsThisWeek}/{progressStats.weeklyGoal}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressStats.weeklyProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {Math.round(progressStats.weeklyProgress)}% {t('dashboard.progress.goalReached')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <GitCommit size={24} className="text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {progressStats.commitsThisWeek}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('dashboard.progress.commits')}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FolderOpen size={24} className="text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {progressStats.activeProjects}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('dashboard.progress.activeProjects')}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock size={24} className="text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {progressStats.avgDevTime}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('dashboard.progress.devTime')}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <TrendingUp size={24} className="text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {progressStats.commitsThisWeek > 0 ? `+${Math.min(progressStats.commitsThisWeek * 5, 50)}%` : '0%'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {t('dashboard.progress.vsLastWeek')}
            </div>
          </div>
        </div>

        {/* Abandoned Projects */}
        {abandonedProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <AlertCircle size={16} className="text-yellow-500 mr-2" />
                {t('dashboard.progress.abandonedProjects')}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {abandonedProjects.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {abandonedProjects.map((project) => (
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
                {progressStats.commitsThisWeek}/{progressStats.weeklyGoal}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('dashboard.progress.activeProjects')}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {progressStats.activeProjects}/5
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('dashboard.progress.devTime')}</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {progressStats.avgDevTime}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
