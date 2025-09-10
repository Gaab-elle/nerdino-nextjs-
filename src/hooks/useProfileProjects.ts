import { useState, useEffect } from 'react';

interface ProfileProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: string;
  stars: number;
  forks: number;
  progress: number;
  lastUpdate: string;
  createdAt: string;
  demoUrl: string | null;
  githubUrl: string | null;
  image: string;
  isVisible: boolean;
  featured: boolean;
}

export const useProfileProjects = () => {
  const [projects, setProjects] = useState<ProfileProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/profile/projects');
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao carregar projetos');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Error loading profile projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectVisibility = async (projectId: string, isVisible: boolean) => {
    try {
      const response = await fetch('/api/profile/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          isVisible
        }),
      });

      if (response.ok) {
        // Atualizar o estado local
        setProjects(prev => 
          prev.map(project => 
            project.id === projectId 
              ? { ...project, isVisible }
              : project
          )
        );
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao atualizar visibilidade');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Error updating project visibility:', err);
      return false;
    }
  };

  const getVisibleProjects = () => {
    return projects.filter(project => project.isVisible);
  };

  const getFeaturedProjects = () => {
    return projects.filter(project => project.isVisible && project.featured);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    visibleProjects: getVisibleProjects(),
    featuredProjects: getFeaturedProjects(),
    loading,
    error,
    loadProjects,
    updateProjectVisibility
  };
};
