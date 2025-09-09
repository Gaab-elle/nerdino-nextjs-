'use client';

import React from 'react';
import { Briefcase, Github, Users, MapPin, Clock, ExternalLink, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  salary?: string;
  technologies: string[];
  match: number;
}

interface OpenSourceProject {
  id: string;
  name: string;
  description: string;
  stars: number;
  language: string;
  issues: number;
  lastActivity: string;
  url: string;
}

interface DeveloperToConnect {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company?: string;
  technologies: string[];
  mutualConnections: number;
}

const mockJobs: JobOpportunity[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'São Paulo, SP',
    type: 'remote',
    salary: 'R$ 8.000 - 12.000',
    technologies: ['React', 'TypeScript', 'Next.js'],
    match: 95
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Rio de Janeiro, RJ',
    type: 'hybrid',
    salary: 'R$ 6.000 - 10.000',
    technologies: ['Node.js', 'React', 'PostgreSQL'],
    match: 87
  }
];

const getMockOpenSourceProjects = (t: (key: string) => string): OpenSourceProject[] => [
  {
    id: '1',
    name: 'awesome-react-components',
    description: 'Collection of reusable React components',
    stars: 1250,
    language: 'TypeScript',
    issues: 12,
    lastActivity: `2 ${t('dashboard.progress.daysAgo')}`,
    url: 'https://github.com/user/awesome-react-components'
  },
  {
    id: '2',
    name: 'dev-tools-cli',
    description: 'Command line tools for developers',
    stars: 890,
    language: 'JavaScript',
    issues: 5,
    lastActivity: `1 ${t('dashboard.progress.daysAgo')}`,
    url: 'https://github.com/user/dev-tools-cli'
  }
];

const mockDevelopers: DeveloperToConnect[] = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'Senior Frontend Developer',
    company: 'Google',
    technologies: ['React', 'Vue.js', 'TypeScript'],
    mutualConnections: 3
  },
  {
    id: '2',
    name: 'Carlos Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Backend Developer',
    company: 'Microsoft',
    technologies: ['Node.js', 'Python', 'AWS'],
    mutualConnections: 1
  }
];

const getMatchColor = (match: number) => {
  if (match >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (match >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (match >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

export const OpportunitiesSection: React.FC = () => {
  const { t } = useLanguage();
  const mockOpenSourceProjects = getMockOpenSourceProjects(t);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.opportunities.title')}
        </h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Opportunities */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Briefcase size={16} className="text-blue-500 mr-2" />
            {t('dashboard.opportunities.suggestedJobs')}
          </h3>
          <div className="space-y-3">
            {mockJobs.map((job) => (
              <div
                key={job.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {job.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <Badge className={getMatchColor(job.match)}>
                    {job.match}% {t('dashboard.opportunities.match')}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {job.type === 'remote' ? t('dashboard.opportunities.remote') : job.type === 'hybrid' ? t('dashboard.opportunities.hybrid') : t('dashboard.opportunities.onsite')}
                  </span>
                  {job.salary && (
                    <span>{job.salary}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {job.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <Button size="sm" variant="outline" className="w-full">
                  {t('dashboard.opportunities.viewDetails')}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Open Source Projects */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Github size={16} className="text-gray-500 mr-2" />
            {t('dashboard.opportunities.openSourceProjects')}
          </h3>
          <div className="space-y-3">
            {mockOpenSourceProjects.map((project) => (
              <div
                key={project.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {project.language}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Star size={12} className="mr-1" />
                    {project.stars}
                  </span>
                  <span>{project.issues} issues</span>
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {project.lastActivity}
                  </span>
                </div>

                <Button size="sm" variant="outline" className="w-full" asChild>
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} className="mr-2" />
                    {t('dashboard.opportunities.viewProject')}
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Developers to Connect */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Users size={16} className="text-purple-500 mr-2" />
            {t('dashboard.opportunities.connectWithDevs')}
          </h3>
          <div className="space-y-3">
            {mockDevelopers.map((dev) => (
              <div
                key={dev.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {dev.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dev.role}
                      {dev.company && ` • ${dev.company}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {dev.mutualConnections} {t('dashboard.opportunities.mutualConnections')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3 mb-3">
                  {dev.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <Button size="sm" variant="outline" className="w-full">
                  {t('dashboard.opportunities.connect')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
