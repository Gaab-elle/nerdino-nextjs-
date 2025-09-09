'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { ProjectsHeader } from '@/components/projects/ProjectsHeader';
import { ProjectsStats } from '@/components/projects/ProjectsStats';
import { ProjectsFilters } from '@/components/projects/ProjectsFilters';
import { ProjectsGrid } from '@/components/projects/ProjectsGrid';
import { ProjectsList } from '@/components/projects/ProjectsList';

export default function ProjectsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    technology: 'all',
    period: 'all',
    sortBy: 'recent'
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load mock projects data
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        name: "E-commerce Platform",
        description: "Plataforma completa de e-commerce com painel administrativo, integração de pagamentos e sistema de recomendações baseado em IA.",
        technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
        status: "active",
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
        status: "completed",
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
        status: "active",
        stars: 89,
        forks: 7,
        progress: 100,
        lastUpdate: "4 minutos atrás",
        createdAt: "2024-02-10",
        demoUrl: "https://chrome.google.com/webstore/detail/devtools-extension",
        githubUrl: "https://github.com/user/devtools-extension",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop"
      },
      {
        id: 4,
        name: "Weather Dashboard",
        description: "Dashboard meteorológico com previsões em tempo real, mapas interativos e alertas personalizados.",
        technologies: ["React", "D3.js", "OpenWeather API", "Tailwind CSS"],
        status: "paused",
        stars: 45,
        forks: 12,
        progress: 60,
        lastUpdate: "3 semanas atrás",
        createdAt: "2023-12-05",
        demoUrl: "https://demo-weather.com",
        githubUrl: "https://github.com/user/weather-dashboard",
        image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=200&fit=crop"
      },
      {
        id: 5,
        name: "Social Media Analytics",
        description: "Ferramenta de análise de redes sociais com métricas avançadas, relatórios automatizados e insights de IA.",
        technologies: ["Next.js", "Python", "MongoDB", "TensorFlow"],
        status: "active",
        stars: 156,
        forks: 23,
        progress: 75,
        lastUpdate: "1 dia atrás",
        createdAt: "2024-01-30",
        demoUrl: "https://demo-analytics.com",
        githubUrl: "https://github.com/user/social-analytics",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
      },
      {
        id: 6,
        name: "Blockchain Voting System",
        description: "Sistema de votação descentralizado baseado em blockchain com transparência total e segurança criptográfica.",
        technologies: ["Solidity", "Web3.js", "React", "Ethereum"],
        status: "archived",
        stars: 78,
        forks: 9,
        progress: 90,
        lastUpdate: "2 meses atrás",
        createdAt: "2023-10-15",
        demoUrl: null,
        githubUrl: "https://github.com/user/blockchain-voting",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop"
      }
    ];
    
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

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

    // Sort
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
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
        <ProjectsHeader />
        
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
            <ProjectsGrid projects={filteredProjects} />
          ) : (
            <ProjectsList projects={filteredProjects} />
          )}
        </div>
      </div>
    </>
  );
}
