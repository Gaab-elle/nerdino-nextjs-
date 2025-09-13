'use client';

import React from 'react';
import { Star, GitFork, ExternalLink, Github, BarChart3, Archive, Edit, Trash2, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  status: 'active' | 'paused' | 'completed' | 'archived';
  stars: number;
  forks: number;
  progress: number;
  lastUpdate: string;
  createdAt: string;
  demoUrl: string | null;
  githubUrl: string;
  image: string;
}

interface ProjectsGridProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onAnalytics?: (project: Project) => void;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ 
  projects, 
  onEdit, 
  onArchive, 
  onDelete, 
  onAnalytics 
}) => {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('projects.status.active');
      case 'paused':
        return t('projects.status.paused');
      case 'completed':
        return t('projects.status.completed');
      case 'archived':
        return t('projects.status.archived');
      default:
        return status;
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          {t('projects.empty.title')}
        </div>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          {t('projects.empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="group hover:shadow-lg transition-shadow duration-200">
          <div className="relative">
            {/* Project Image */}
            <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600 rounded-t-lg overflow-hidden">
              <img
                src={project.image}
                alt={project.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
              />
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <Badge className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Project Info */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                  {project.description}
                </p>
              </div>

              {/* Technologies */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 4).map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.technologies.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-600">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">{project.stars}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('projects.metrics.stars')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <GitFork className="h-4 w-4" />
                    <span className="text-sm font-medium">{project.forks}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('projects.metrics.forks')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-purple-600">
                    {project.progress}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('projects.metrics.progress')}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Last Update */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {t('projects.lastUpdate')}: {project.lastUpdate}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {project.demoUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {t('projects.actions.demo')}
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-3 w-3 mr-1" />
                    GitHub
                  </a>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAnalytics?.(project)}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {t('projects.actions.analytics')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit?.(project)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {t('projects.actions.edit')}
                </Button>
                {project.status === 'paused' && (
                  <Button size="sm" variant="outline">
                    <Play className="h-3 w-3 mr-1" />
                    {t('projects.actions.resume')}
                  </Button>
                )}
                {project.status === 'active' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onArchive?.(project)}
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    {t('projects.actions.archive')}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete?.(project)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('projects.actions.delete')}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};
