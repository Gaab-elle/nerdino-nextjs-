'use client';

import React from 'react';
import { ExternalLink, Github, Star, Eye, Calendar, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WebContainerLazy } from '@/components/WebContainerLazy';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';
import { useProfileEdit } from '@/contexts/ProfileEditContext';

export const FeaturedProjects: React.FC = () => {
  const { t } = useLanguage();
  const { data: profileData } = useGitHubProfile();
  const { editingSection, startEditSection, stopEditSection } = useProfileEdit();

  // Convert GitHub repos to project format
  const getProjects = () => {
    if (!profileData?.topRepos) {
      return [
        {
          id: 1,
          title: "E-commerce Platform",
          description: "Plataforma completa de e-commerce com React, Node.js e PostgreSQL. Inclui sistema de pagamentos, gestão de estoque e dashboard administrativo.",
          image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop",
          technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "Docker"],
          stats: {
            stars: 142,
            views: 2847,
            lastUpdate: "2 dias atrás"
          },
          links: {
            demo: "https://demo.example.com",
            github: "https://github.com/facebook/react"
          },
          featured: true
        },
        {
          id: 2,
          title: "Task Management App",
          description: "Aplicação de gerenciamento de tarefas com drag-and-drop, notificações em tempo real e colaboração em equipe.",
          image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=300&fit=crop",
          technologies: ["Next.js", "TypeScript", "Prisma", "Socket.io", "Tailwind"],
          stats: {
            stars: 89,
            views: 1523,
            lastUpdate: "1 semana atrás"
          },
          links: {
            demo: "https://tasks.example.com",
            github: "https://github.com/vuejs/core"
          },
          featured: true
        },
        {
          id: 3,
          title: "Portfolio Website",
          description: "Site pessoal desenvolvido com React e animações CSS. Projeto em desenvolvimento para mostrar habilidades e projetos.",
          image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=300&fit=crop",
          technologies: ["React", "CSS3", "JavaScript", "Framer Motion"],
          stats: {
            stars: 0,
            views: 0,
            lastUpdate: "Em desenvolvimento"
          },
          links: {
            github: "https://github.com/facebook/react"
          },
          featured: true
        }
      ];
    }

    return profileData.topRepos.slice(0, 6).map((repo, index) => ({
      id: index + 1,
      title: repo.name,
      description: repo.description || `Repositório ${repo.name} desenvolvido com ${repo.language || 'múltiplas tecnologias'}.`,
      image: `https://images.unsplash.com/photo-${1556742049 + index}?w=600&h=300&fit=crop`,
      technologies: repo.language ? [repo.language] : ['JavaScript'],
      stats: {
        stars: repo.stars,
        views: Math.floor(Math.random() * 1000) + 100,
        lastUpdate: new Date(repo.updated_at).toLocaleDateString('pt-BR')
      },
      links: {
        demo: repo.url,
        github: repo.url
      },
      featured: true
    }));
  };

  const projects = getProjects();

  // Função para determinar o arquivo principal baseado na tecnologia
  const getMainFile = (technologies: string[]) => {
    const tech = technologies[0]?.toLowerCase();
    if (tech?.includes('next')) return 'pages/index.js';
    if (tech?.includes('react')) return 'src/App.js';
    if (tech?.includes('vue')) return 'src/App.vue';
    if (tech?.includes('angular')) return 'src/app/app.component.ts';
    return 'src/App.js'; // default
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-purple-600" />
            {t('profile.projects.title')}
            {editingSection === 'projects' && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Editando
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editingSection === 'projects' ? stopEditSection() : startEditSection('projects')}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('profile.projects.subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Featured Badge */}
                {project.featured && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-purple-600 text-white">
                      Destaque
                    </Badge>
                  </div>
                )}

                {/* Stats Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{project.stats.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{project.stats.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{project.stats.lastUpdate}</span>
                  </div>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {project.links?.demo && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver Demo
                      </a>
                    </Button>
                  )}
                  
                  {project.links?.github && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <Github className="h-4 w-4" />
                        Código
                      </a>
                    </Button>
                  )}
                  
                  {project.links?.github && (
                    <WebContainerLazy 
                      githubUrl={project.links.github}
                      file={getMainFile(project.technologies)}
                      buttonLabel="WebContainer"
                      projectName={project.title}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Projects Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            asChild
            className="px-8"
          >
            <a
              href={profileData?.social?.github || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              Ver Todos os Projetos no GitHub
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};