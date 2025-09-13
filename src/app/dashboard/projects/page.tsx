'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { ProjectsHeader } from '@/features/projects/ProjectsHeader';
import { ProjectsStats } from '@/features/projects/ProjectsStats';
import { ProjectsFilters } from '@/features/projects/ProjectsFilters';
import { ProjectsGrid } from '@/features/projects/ProjectsGrid';
import { ProjectsList } from '@/features/projects/ProjectsList';
import { EditProjectModal } from '@/features/projects/EditProjectModal';
import { AnalyticsModal } from '@/features/projects/AnalyticsModal';
import NewProjectModal from '@/features/projects/NewProjectModal';

interface ProjectData {
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

export default function ProjectsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    technology: 'all',
    period: 'all',
    sortBy: 'recent'
  });

  // Estados dos modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  // Handlers para os botões do header
  const handleNewProject = () => {
    console.log('🆕 Abrindo modal de criação de projeto...');
    setNewProjectModalOpen(true);
  };

  const handleSyncGitHub = async () => {
    console.log('🔄 Recarregando projetos após sincronização...');
    // Recarregar os projetos após sincronização
    await loadProjects(filters.sortBy);
  };

  // Handlers para os botões dos projetos
  const handleEditProject = (project: ProjectData) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleAnalyticsProject = (project: ProjectData) => {
    setSelectedProject(project);
    setAnalyticsModalOpen(true);
  };

  const handleArchiveProject = async (project: ProjectData) => {
    if (confirm(t('projects.confirm.archive'))) {
      try {
        const response = await fetch(`/api/projects/${project.id}/archive`, {
          method: 'PATCH'
        });
        
        if (response.ok) {
          console.log('✅ Projeto arquivado com sucesso');
          await loadProjects(filters.sortBy);
        } else {
          console.error('❌ Erro ao arquivar projeto');
        }
      } catch (error) {
        console.error('❌ Erro ao arquivar projeto:', error);
      }
    }
  };

  const handleDeleteProject = async (project: ProjectData) => {
    if (confirm(t('projects.confirm.delete'))) {
      try {
        const response = await fetch(`/api/projects/${project.id}/delete`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log('✅ Projeto excluído com sucesso');
          await loadProjects(filters.sortBy);
        } else {
          console.error('❌ Erro ao excluir projeto');
        }
      } catch (error) {
        console.error('❌ Erro ao excluir projeto:', error);
      }
    }
  };

  const handleSaveProject = async (projectData: Partial<ProjectData>) => {
    if (!projectData.id) return;
    
    try {
      console.log('💾 Salvando projeto:', projectData);
      console.log('👤 Usuário atual:', { 
        hasUser: !!user, 
        userId: user?.id, 
        userEmail: user?.email 
      });
      
      const response = await fetch(`/api/projects/${projectData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (response.ok) {
        console.log('✅ Projeto salvo com sucesso');
        await loadProjects(filters.sortBy);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao salvar projeto:', errorData);
        alert(`Erro ao salvar projeto: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar projeto:', error);
    }
  };

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    technologies: string[];
    status: 'active' | 'paused' | 'completed' | 'archived';
    progress: number;
    demoUrl: string;
    githubUrl: string;
    image?: string;
  }) => {
    try {
      console.log('🆕 Criando novo projeto:', projectData);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (response.ok) {
        console.log('✅ Projeto criado com sucesso');
        await loadProjects(filters.sortBy);
        setNewProjectModalOpen(false);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao criar projeto:', errorData);
        alert(`Erro ao criar projeto: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar projeto:', error);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load user projects from API
  const loadProjects = async (sortBy: string = 'recent') => {
    try {
      console.log('🔄 Carregando projetos do usuário...');
      const response = await fetch(`/api/projects/user?sortBy=${sortBy}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Projetos carregados:', data.data);
        setProjects(data.data);
        setFilteredProjects(data.data);
      } else {
        console.error('❌ Erro ao carregar projetos:', data.error);
        // Fallback para projetos mock se não conseguir carregar
        loadMockProjects();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar projetos:', error);
      // Fallback para projetos mock se não conseguir carregar
      loadMockProjects();
    }
  };

  // Fallback para projetos mock
  const loadMockProjects = () => {
    console.log('📝 Carregando projetos mock como fallback...');
    const mockProjects = [
      {
        id: 1,
        name: "E-commerce Platform",
        description: "Plataforma completa de e-commerce com painel administrativo, integração de pagamentos e sistema de recomendações baseado em IA.",
        technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
        status: "active" as const,
        stars: 124,
        forks: 15,
        progress: 85,
        lastUpdate: "2 dias atrás",
        createdAt: "2024-01-15",
        demoUrl: "https://demo-ecommerce.com",
        githubUrl: "https://github.com/user/ecommerce-platform",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop"
      },
      {
        id: 2,
        name: "Task Management System",
        description: "Sistema completo de gerenciamento de tarefas para equipes com kanban board, relatórios e integração com calendário.",
        technologies: ["Vue.js", "Laravel", "MySQL"],
        status: "completed" as const,
        stars: 92,
        forks: 18,
        progress: 100,
        lastUpdate: "1 semana atrás",
        createdAt: "2023-11-20",
        demoUrl: "https://demo-tasks.com",
        githubUrl: "https://github.com/user/task-management",
        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop"
      },
      {
        id: 3,
        name: "DevTools Extension",
        description: "Extensão para Chrome que ajuda desenvolvedores a debugar aplicações React com visualização de estado em tempo real.",
        technologies: ["TypeScript", "Chrome APIs", "React", "Webpack"],
        status: "active" as const,
        stars: 89,
        forks: 7,
        progress: 100,
        lastUpdate: "4 minutos atrás",
        createdAt: "2024-02-10",
        demoUrl: "https://chrome.google.com/webstore/detail/devtools-extension",
        githubUrl: "https://github.com/user/devtools-extension",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop"
      }
    ];
    
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  };

  // Load projects on mount
  useEffect(() => {
    if (user) {
      loadProjects(filters.sortBy);
    }
  }, [user, filters.sortBy]);

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Technology filter
    if (filters.technology !== 'all') {
      filtered = filtered.filter(project =>
        project.technologies.some(tech => tech.toLowerCase() === filters.technology.toLowerCase())
      );
    }

    // Period filter
    if (filters.period !== 'all') {
      const now = new Date();
      
      switch (filters.period) {
        case 'today':
          filtered = filtered.filter(project => {
            const projectDate = new Date(project.createdAt);
            return projectDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(project => {
            const projectDate = new Date(project.createdAt);
            return projectDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(project => {
            const projectDate = new Date(project.createdAt);
            return projectDate >= monthAgo;
          });
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(project => {
            const projectDate = new Date(project.createdAt);
            return projectDate >= yearAgo;
          });
          break;
      }
    }

    // Sort
    switch (filters.sortBy) {
      case 'recent':
        // Mais recentes = projetos criados mais recentemente primeiro
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stars':
        filtered.sort((a, b) => b.stars - a.stars);
        break;
      case 'progress':
        filtered.sort((a, b) => b.progress - a.progress);
        break;
      case 'lastUpdate':
        // Última atualização = projetos atualizados mais recentemente primeiro
        filtered.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
        break;
    }

    setFilteredProjects(filtered);
  }, [projects, filters]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <ProjectsHeader 
          onNewProject={handleNewProject}
          onSyncGitHub={handleSyncGitHub}
        />
        
        {/* Stats */}
        <ProjectsStats projects={projects} />
        
        {/* Filters */}
        <ProjectsFilters 
          filters={filters}
          setFilters={setFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        
        {/* Projects Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {viewMode === 'grid' ? (
            <ProjectsGrid 
              projects={filteredProjects}
              onEdit={handleEditProject}
              onArchive={handleArchiveProject}
              onDelete={handleDeleteProject}
              onAnalytics={handleAnalyticsProject}
            />
          ) : (
            <ProjectsList 
              projects={filteredProjects}
              onEdit={handleEditProject}
              onArchive={handleArchiveProject}
              onDelete={handleDeleteProject}
              onAnalytics={handleAnalyticsProject}
            />
          )}
        </div>

        {/* Modals */}
        <EditProjectModal
          project={selectedProject}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveProject}
        />
        
        <AnalyticsModal
          project={selectedProject}
          isOpen={analyticsModalOpen}
          onClose={() => setAnalyticsModalOpen(false)}
        />
        
        <NewProjectModal
          isOpen={newProjectModalOpen}
          onClose={() => setNewProjectModalOpen(false)}
          onSave={handleCreateProject}
        />
      </div>
    </>
  );
}
