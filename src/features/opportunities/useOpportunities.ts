import { useState, useEffect, useCallback } from 'react';
import { useJobCompatibility } from '@/hooks/useJobCompatibility';
import { JobData, OpportunitiesResponse, UseOpportunitiesOptions } from '@/types/jobs';

export const useOpportunities = (options: UseOpportunitiesOptions = {}) => {
  const { userSkills = [], source = 'infojobs', autoFetch = true } = options;
  
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    hasMore: false,
    total: 0,
    pageSize: 20,
    totalPages: 0
  });
  const [currentSource, setCurrentSource] = useState<string>('mock');

  // Criar perfil do usuário para cálculo de compatibilidade
  const userProfile = {
    skills: userSkills,
    experience: 'pleno', // Default, pode ser melhorado
    location: 'Brasil', // Default, pode ser melhorado
    available: true
  };

  // Calcular compatibilidade real das vagas
  const jobsWithCompatibility = useJobCompatibility(jobs, userProfile);

  const fetchJobs = useCallback(async (page: number = 0, newSource?: string) => {
    console.log('🚀 Iniciando fetchJobs...', { page, source: newSource || source });
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        source: newSource || source,
        ...(userSkills.length > 0 && { skills: userSkills.join(',') })
      });

      console.log('📡 Fazendo requisição para:', `/api/opportunities/fetch?${params}`);
      const response = await fetch(`/api/opportunities/fetch?${params}`);
      const data: OpportunitiesResponse = await response.json();
      console.log('📊 Resposta recebida:', { success: data.success, jobsCount: data.data.length, source: data.source });

      if (data.success) {
        // Sempre substitui os dados (paginação real, não acumulativa)
        console.log('✅ Dados recebidos com sucesso:', data.data.length, 'vagas');
        setJobs(data.data);
        setPagination(data.pagination);
        setCurrentSource(data.source);
      } else {
        console.log('❌ Erro na resposta:', data.error);
        setError(data.error || 'Failed to fetch opportunities');
        setJobs(data.data); // Use fallback data
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('❌ Erro na requisição:', err);
      setError('Network error while fetching opportunities');
    } finally {
      console.log('🏁 Finalizando fetchJobs, setLoading(false)');
      setLoading(false);
    }
  }, [userSkills, source]);

  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchJobs(pagination.page + 1);
    }
  }, [loading, pagination.hasMore, pagination.page, fetchJobs]);

  const goToPage = useCallback((page: number) => {
    if (!loading && page >= 0 && page < pagination.totalPages) {
      fetchJobs(page);
    }
  }, [loading, pagination.totalPages, fetchJobs]);

  const refreshJobs = useCallback(() => {
    fetchJobs(0);
  }, [fetchJobs]);

  const applyToJob = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, userApplied: true } : job
    ));
  }, []);

  const toggleFavorite = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, userFavorited: !job.userFavorited } : job
    ));
  }, []);

  const filterJobs = useCallback((filters: {
    search?: string;
    location?: string;
    experience?: string;
    technologies?: string[];
    salaryMin?: number;
    salaryMax?: number;
    contractType?: string;
    stack?: string;
    sortBy?: string;
  }, jobsToFilter = jobs) => {
    let filtered = [...jobsToFilter];
    console.log('🔍 Iniciando filtro com', jobsToFilter.length, 'vagas');
    console.log('📋 Filtros aplicados:', filters);

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.technologies.some(tech => tech.toLowerCase().includes(searchLower))
      );
      console.log('🔍 Após filtro de busca:', filtered.length);
    }

    // Location filter
    if (filters.location && filters.location !== 'all') {
      if (filters.location === 'remote') {
        filtered = filtered.filter(job => job.remote);
      } else {
        filtered = filtered.filter(job => job.location.includes(filters.location!));
      }
    }

    // Experience filter
    if (filters.experience && filters.experience !== 'all') {
      filtered = filtered.filter(job => job.experience === filters.experience);
    }

    // Stack filter
    if (filters.stack && filters.stack !== 'all') {
      const frontendTechs = ['React', 'Vue', 'Angular', 'CSS', 'HTML'];
      const backendTechs = ['Node.js', 'Python', 'Java', 'C#', 'Go'];
      const mobileTechs = ['React Native', 'Flutter', 'Swift', 'Kotlin'];
      
      filtered = filtered.filter(job => {
        switch (filters.stack) {
          case 'frontend':
            return job.technologies.some(tech => frontendTechs.includes(tech));
          case 'backend':
            return job.technologies.some(tech => backendTechs.includes(tech));
          case 'mobile':
            return job.technologies.some(tech => mobileTechs.includes(tech));
          default:
            return true;
        }
      });
    }

    // Technologies filter
    if (filters.technologies && filters.technologies.length > 0) {
      console.log('🔍 Aplicando filtro de tecnologias:', filters.technologies);
      filtered = filtered.filter(job => 
        filters.technologies!.some((tech: string) => job.technologies.includes(tech))
      );
      console.log('🔍 Após filtro de tecnologias:', filtered.length);
    }

    // Salary filter
    if (filters.salaryMin && filters.salaryMax && filters.salaryMin > 0 && filters.salaryMax > 0) {
      console.log('🔍 Aplicando filtro de salário:', filters.salaryMin, '-', filters.salaryMax);
      filtered = filtered.filter(job => 
        job.salary && job.salary.min >= filters.salaryMin! && job.salary.max <= filters.salaryMax!
      );
      console.log('🔍 Após filtro de salário:', filtered.length);
    }

    // Contract type filter
    if (filters.contractType && filters.contractType !== 'all') {
      filtered = filtered.filter(job => job.contractType === filters.contractType);
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'relevance':
          filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          break;
        case 'recent':
          filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
          break;
        case 'salary':
          filtered.sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0));
          break;
        case 'match':
          filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          break;
      }
    }

    console.log('✅ Filtro finalizado:', filtered.length, 'vagas restantes');
    return filtered;
  }, []); // Removido jobs das dependências

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchJobs(0);
    }
  }, [autoFetch, fetchJobs]);

  return {
    jobs: jobsWithCompatibility,
    loading,
    error,
    pagination,
    currentSource,
    fetchJobs,
    loadMore,
    goToPage,
    refreshJobs,
    applyToJob,
    toggleFavorite,
    filterJobs
  };
};
