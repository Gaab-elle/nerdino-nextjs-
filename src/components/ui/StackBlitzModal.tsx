'use client';

import React, { useEffect, useRef } from 'react';
import { X, ExternalLink, Github, Code, Play } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  stackblitzUrl?: string;
  image?: string;
}

interface StackBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export const StackBlitzModal: React.FC<StackBlitzModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const { t } = useLanguage();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Gerar URL do StackBlitz baseada no projeto
  const generateStackBlitzUrl = (project: Project): string => {
    if (project.stackblitzUrl) {
      return project.stackblitzUrl;
    }

    // Se não tem URL específica, criar uma baseada nas tecnologias
    const tech = project.technologies[0]?.toLowerCase() || 'react';
    
    // Mapear tecnologias para templates do StackBlitz
    const templateMap: { [key: string]: string } = {
      'react': 'create-react-app',
      'next.js': 'nextjs',
      'nextjs': 'nextjs',
      'vue': 'vue',
      'vue.js': 'vue',
      'angular': 'angular',
      'svelte': 'svelte',
      'vanilla': 'vanilla',
      'typescript': 'create-react-app',
      'javascript': 'vanilla',
      'node.js': 'node',
      'nodejs': 'node',
      'python': 'python',
      'html': 'vanilla',
      'css': 'vanilla',
      'tailwind': 'create-react-app',
      'bootstrap': 'create-react-app'
    };

    const template = templateMap[tech] || 'create-react-app';
    
    // URL base do StackBlitz com template e configurações
    const baseUrl = `https://stackblitz.com/edit/${template}`;
    const params = new URLSearchParams({
      embed: '1',
      file: template === 'nextjs' ? 'pages/index.js' : 'src/App.js',
      title: project.name || 'Projeto',
      description: project.description || 'Projeto criado no StackBlitz'
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const stackblitzUrl = generateStackBlitzUrl(project);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {project.name}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.technologies.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botões de ação */}
            {project.githubUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(project.githubUrl, '_blank')}
                className="flex items-center space-x-1"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Button>
            )}
            
            {project.liveUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(project.liveUrl, '_blank')}
                className="flex items-center space-x-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Live Demo</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(stackblitzUrl.replace('?embed=1', ''), '_blank')}
              className="flex items-center space-x-1"
            >
              <Play className="h-4 w-4" />
              <span>Abrir no StackBlitz</span>
            </Button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(95vh-80px)]">
          {/* Project Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              {project.description}
            </p>
          </div>

          {/* StackBlitz Embed */}
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              src={stackblitzUrl}
              className="w-full h-full border-0"
              title={`${project.name} - StackBlitz`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
            
            {/* Loading overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Carregando projeto no StackBlitz...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
