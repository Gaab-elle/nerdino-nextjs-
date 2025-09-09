'use client';

import React from 'react';
import { ArrowRight, Github, ExternalLink, Clock, CheckCircle, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'inProgress' | 'paused' | 'completed';
  lastActivity: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  progress: number;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'React Portfolio',
    description: 'Portfolio pessoal construído com React, TypeScript e Tailwind CSS',
    status: 'inProgress',
    lastActivity: '2 horas atrás',
    technologies: ['React', 'TypeScript', 'Tailwind'],
    githubUrl: 'https://github.com/user/react-portfolio',
    liveUrl: 'https://portfolio.example.com',
    progress: 75
  },
  {
    id: '2',
    name: 'E-commerce API',
    description: 'API REST para sistema de e-commerce com Node.js e Express',
    status: 'inProgress',
    lastActivity: '1 dia atrás',
    technologies: ['Node.js', 'Express', 'MongoDB'],
    githubUrl: 'https://github.com/user/ecommerce-api',
    progress: 60
  },
  {
    id: '3',
    name: 'Task Manager App',
    description: 'Aplicativo de gerenciamento de tarefas com React Native',
    status: 'paused',
    lastActivity: '1 semana atrás',
    technologies: ['React Native', 'Firebase'],
    githubUrl: 'https://github.com/user/task-manager',
    progress: 40
  },
  {
    id: '4',
    name: 'Weather Dashboard',
    description: 'Dashboard de clima com dados em tempo real',
    status: 'completed',
    lastActivity: '2 semanas atrás',
    technologies: ['Vue.js', 'Chart.js', 'API'],
    githubUrl: 'https://github.com/user/weather-dashboard',
    liveUrl: 'https://weather.example.com',
    progress: 100
  }
];

const getStatusIcon = (status: Project['status']) => {
  switch (status) {
    case 'inProgress':
      return <Clock size={16} className="text-blue-500" />;
    case 'paused':
      return <Pause size={16} className="text-yellow-500" />;
    case 'completed':
      return <CheckCircle size={16} className="text-green-500" />;
  }
};

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'inProgress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
};

export const FeaturedProjects: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.featuredProjects')}
          </h2>
          <Button variant="outline" size="sm">
            {t('dashboard.viewAllProjects')}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Project header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(project.status)}
                  <Badge className={getStatusColor(project.status)}>
                    {t(`dashboard.projectStatus.${project.status}`)}
                  </Badge>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{t('dashboard.progress.progress')}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1 mb-3">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('dashboard.progress.lastActivity')}: {project.lastActivity}
                </span>
                <div className="flex space-x-2">
                  {project.githubUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github size={16} />
                      </a>
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={16} />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
