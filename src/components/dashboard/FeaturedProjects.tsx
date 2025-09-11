'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Github, ExternalLink, Clock, CheckCircle, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';

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

// Função para calcular tempo relativo
const getTimeAgo = (timestamp: string) => {
  const now = new Date();
  const projectTime = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - projectTime.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Agora';
  if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''} atrás`;
};

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

interface FeaturedProjectsProps {
  onProjectAdded?: () => void;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ onProjectAdded }) => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar projetos
  const loadProjects = () => {
      try {
        const savedProjects = localStorage.getItem('userProjects');
        if (savedProjects) {
          const parsedProjects = JSON.parse(savedProjects);
          // Filtrar projetos do usuário atual
          const userProjects = parsedProjects.filter((project: any) => 
            project.authorId === user?.id
          );
          setProjects(userProjects);
        } else {
          // Se não há projetos salvos, criar alguns projetos de exemplo baseados nos posts
          const communityPosts = localStorage.getItem('communityPosts');
          if (communityPosts && user) {
            const posts = JSON.parse(communityPosts);
            const projectPosts = posts.filter((post: any) => 
              post.type === 'project' && post.author.id === user.id
            );
            
            const exampleProjects = projectPosts.map((post: any, index: number) => ({
              id: `project-${post.id}`,
              name: post.project?.name || `Projeto ${index + 1}`,
              description: post.project?.description || post.content,
              status: 'inProgress' as const,
              lastActivity: getTimeAgo(post.timestamp),
              technologies: post.project?.technologies || ['React', 'JavaScript'],
              githubUrl: post.project?.githubUrl,
              liveUrl: post.project?.demoUrl,
              progress: Math.floor(Math.random() * 80) + 20 // Progresso aleatório entre 20-100%
            }));
            
            setProjects(exampleProjects);
            // Salvar projetos no localStorage
            localStorage.setItem('userProjects', JSON.stringify(exampleProjects));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
  };

  // Carregar projetos do localStorage
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // Escutar evento de projeto adicionado
  useEffect(() => {
    const handleProjectAdded = () => {
      loadProjects();
    };

    window.addEventListener('projectAdded', handleProjectAdded);
    return () => {
      window.removeEventListener('projectAdded', handleProjectAdded);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.featuredProjects')}
          </h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando projetos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <Avatar className="mx-auto mb-2 w-12 h-12">
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.name || 'Usuário'} />
                <AvatarFallback className="text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <p className="text-lg font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm">Crie posts de projetos na comunidade para vê-los aqui!</p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/community'}>
              Ir para Comunidade
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
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
        )}
      </CardContent>
    </Card>
  );
};
