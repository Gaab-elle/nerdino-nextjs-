'use client';

import React from 'react';
import { TrendingUp, Users, Target, Lightbulb, BarChart3, Clock, Star, Award, BookOpen, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfile {
  skills: string[];
  experience: string;
  location: string;
  available: boolean;
}

interface OpportunitiesSidebarProps {
  userProfile: UserProfile;
}

export const OpportunitiesSidebar: React.FC<OpportunitiesSidebarProps> = ({ userProfile }) => {
  const { t } = useLanguage();

  const personalStats = {
    applications: 8,
    responseRate: 75,
    interviews: 3,
    offers: 1
  };

  const recommendations = [
    {
      id: 1,
      title: t('opportunities.sidebar.recommendations.learnGraphQL'),
      description: t('opportunities.sidebar.recommendations.learnGraphQLDesc'),
      impact: '+15%',
      type: 'skill'
    },
    {
      id: 2,
      title: t('opportunities.sidebar.recommendations.learnKubernetes'),
      description: t('opportunities.sidebar.recommendations.learnKubernetesDesc'),
      impact: '+12%',
      type: 'skill'
    },
    {
      id: 3,
      title: t('opportunities.sidebar.recommendations.updateProfile'),
      description: t('opportunities.sidebar.recommendations.updateProfileDesc'),
      impact: '+8%',
      type: 'profile'
    }
  ];

  const marketInsights = {
    trendingTechs: [
      { name: 'GraphQL', growth: '+25%', jobs: 156 },
      { name: 'Kubernetes', growth: '+18%', jobs: 89 },
      { name: 'TypeScript', growth: '+15%', jobs: 234 },
      { name: 'AWS', growth: '+12%', jobs: 178 }
    ],
    salaryRanges: {
      'React Developer': { min: 6000, max: 15000 },
      'Node.js Developer': { min: 7000, max: 16000 },
      'Python Developer': { min: 8000, max: 18000 },
      'DevOps Engineer': { min: 10000, max: 20000 }
    }
  };

  const networking = [
    {
      id: 1,
      name: 'João Silva',
      company: 'TechCorp',
      position: 'Tech Lead',
      mutualConnections: 3,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Maria Santos',
      company: 'StartupXYZ',
      position: 'Senior Dev',
      mutualConnections: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: t('opportunities.sidebar.activity.viewedProfile'),
      company: 'TechCorp Solutions',
      time: '2 horas atrás'
    },
    {
      id: 2,
      action: t('opportunities.sidebar.activity.savedJob'),
      company: 'StartupXYZ',
      time: '1 dia atrás'
    },
    {
      id: 3,
      action: t('opportunities.sidebar.activity.appliedJob'),
      company: 'DataTech Inc',
      time: '2 dias atrás'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Personal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            {t('opportunities.sidebar.personalProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{personalStats.applications}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('opportunities.sidebar.applications')}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{personalStats.responseRate}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('opportunities.sidebar.responseRate')}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{personalStats.interviews}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('opportunities.sidebar.interviews')}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{personalStats.offers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('opportunities.sidebar.offers')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            {t('opportunities.sidebar.recommendations.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {rec.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {rec.impact}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {rec.description}
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  {rec.type === 'skill' ? (
                    <>
                      <BookOpen className="h-3 w-3 mr-1" />
                      {t('opportunities.sidebar.learn')}
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      {t('opportunities.sidebar.update')}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            {t('opportunities.sidebar.marketIntelligence')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                {t('opportunities.sidebar.trendingTechs')}
              </h4>
              <div className="space-y-2">
                {marketInsights.trendingTechs.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {tech.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {tech.growth}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {tech.jobs} vagas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                {t('opportunities.sidebar.salaryRanges')}
              </h4>
              <div className="space-y-2">
                {Object.entries(marketInsights.salaryRanges).map(([role, range]) => (
                  <div key={role} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{role}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        R$ {range.min.toLocaleString()} - R$ {range.max.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Networking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t('opportunities.sidebar.networking')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {networking.map((person) => (
              <div key={person.id} className="flex items-center gap-3">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {person.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {person.position} @ {person.company}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {person.mutualConnections} conexões em comum
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            {t('opportunities.sidebar.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {activity.company} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
