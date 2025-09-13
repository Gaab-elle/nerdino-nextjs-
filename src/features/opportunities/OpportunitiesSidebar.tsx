'use client';

import React from 'react';
import { TrendingUp, Users, Target, Lightbulb, BarChart3, Clock, Star, Award, BookOpen, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { MarketIntelligence } from './MarketIntelligence';

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


      {/* Market Intelligence - New Component */}
      <MarketIntelligence />

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
