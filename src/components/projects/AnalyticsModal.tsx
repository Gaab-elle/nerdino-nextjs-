'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Eye, Heart, MessageCircle, Star, GitFork, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
}

interface AnalyticsData {
  project: {
    id: number;
    title: string;
    status: string;
  };
  metrics: {
    views: number;
    likes: number;
    comments: number;
    stars: number;
    forks: number;
  };
  timeline: {
    created: string;
    updated: string;
    lastActivity: string;
  };
  performance: {
    progress: number;
    completionRate: number;
    averageRating: number;
  };
}

interface AnalyticsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  project,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar analytics quando o modal abre
  useEffect(() => {
    if (isOpen && project) {
      loadAnalytics();
    }
  }, [isOpen, project]);

  const loadAnalytics = async () => {
    if (!project) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/analytics`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAnalytics(data.data);
      } else {
        console.error('Error loading analytics:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('projects.analytics.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {project.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('projects.analytics.loading')}
                </p>
              </div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {analytics.metrics.views}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t('projects.analytics.views')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {analytics.metrics.likes}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t('projects.analytics.likes')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {analytics.metrics.comments}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t('projects.analytics.comments')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {analytics.metrics.stars}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t('projects.analytics.stars')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <GitFork className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {analytics.metrics.forks}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t('projects.analytics.forks')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {t('projects.analytics.performance')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('projects.analytics.progress')}</span>
                        <span>{analytics.performance.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analytics.performance.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('projects.analytics.completionRate')}</span>
                        <span>{analytics.performance.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analytics.performance.completionRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span>{t('projects.analytics.averageRating')}</span>
                        <span>{analytics.performance.averageRating}/5.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {t('projects.analytics.timeline')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('projects.analytics.created')}:
                      </span>
                      <span>{formatDate(analytics.timeline.created)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('projects.analytics.updated')}:
                      </span>
                      <span>{formatDate(analytics.timeline.updated)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('projects.analytics.lastActivity')}:
                      </span>
                      <span>{formatDate(analytics.timeline.lastActivity)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {t('projects.analytics.error')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
