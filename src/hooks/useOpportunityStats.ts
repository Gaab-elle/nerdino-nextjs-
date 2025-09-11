import { useState, useEffect, useCallback } from 'react';

interface JobData {
  id: string;
  title: string;
  company: string;
  technologies: string[];
  experience: string;
  location: string;
  remote: boolean;
  matchScore: number;
}

interface OpportunityStats {
  compatibleJobs: number;
  applications: number;
  interviews: number;
  responseRate: number;
  loading: boolean;
  error: string | null;
}

interface UseOpportunityStatsOptions {
  userSkills: string[];
  userExperience?: string;
  userLocation?: string;
  autoFetch?: boolean;
}

export const useOpportunityStats = (options: UseOpportunityStatsOptions) => {
  const { userSkills, userExperience, userLocation, autoFetch = true } = options;
  
  const [stats, setStats] = useState<OpportunityStats>({
    compatibleJobs: 0,
    applications: 0,
    interviews: 0,
    responseRate: 0,
    loading: false,
    error: null
  });

  // Função para calcular compatibilidade entre habilidades do usuário e tecnologias da vaga
  const calculateCompatibility = useCallback((userSkills: string[], jobTechnologies: string[], jobTitle: string = ''): number => {
    if (userSkills.length === 0) {
      return 0;
    }

    // Normaliza as habilidades para comparação
    const normalizeSkill = (skill: string) => skill.toLowerCase().trim();
    const normalizedUserSkills = userSkills.map(normalizeSkill);
    const normalizedJobTechs = jobTechnologies.map(normalizeSkill);
    const normalizedJobTitle = jobTitle.toLowerCase();

    // Se não há tecnologias definidas, tenta inferir do título
    if (jobTechnologies.length === 0) {
      // Mapeia termos do título para tecnologias
      const titleToTechMap: { [key: string]: string[] } = {
        'javascript': ['javascript', 'js'],
        'react': ['react'],
        'node': ['node.js', 'nodejs'],
        'python': ['python'],
        'java': ['java'],
        'fullstack': ['full stack', 'fullstack'],
        'frontend': ['frontend', 'front-end'],
        'backend': ['backend', 'back-end'],
        'mobile': ['mobile', 'android', 'ios'],
        'devops': ['devops', 'dev ops'],
        'typescript': ['typescript', 'ts']
      };

      // Procura por tecnologias no título
      const inferredTechs: string[] = [];
      Object.entries(titleToTechMap).forEach(([tech, variations]) => {
        if (variations.some(variation => normalizedJobTitle.includes(variation))) {
          inferredTechs.push(tech);
        }
      });

      if (inferredTechs.length > 0) {
        const matchingSkills = normalizedUserSkills.filter(userSkill => 
          inferredTechs.some(tech => 
            tech.includes(userSkill) || userSkill.includes(tech)
          )
        );
        return Math.round((matchingSkills.length / Math.max(userSkills.length, 1)) * 100);
      }
      
      // Se não conseguiu inferir tecnologias, retorna 0
      return 0;
    }

    // Conta quantas tecnologias do usuário estão presentes na vaga
    const matchingSkills = normalizedUserSkills.filter(userSkill => 
      normalizedJobTechs.some(jobTech => 
        jobTech.includes(userSkill) || userSkill.includes(jobTech)
      )
    );

    // Calcula a porcentagem de compatibilidade
    const compatibilityPercentage = (matchingSkills.length / Math.max(userSkills.length, 1)) * 100;
    
    return Math.round(compatibilityPercentage);
  }, []);

  // Função para buscar e calcular estatísticas
  const fetchStats = useCallback(async () => {
    if (userSkills.length === 0) {
      console.log('⚠️ Nenhuma habilidade do usuário fornecida');
      return;
    }

    setStats(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔍 Calculando estatísticas para habilidades:', userSkills);
      
      // Busca todas as vagas disponíveis (múltiplas páginas)
      let allJobs: JobData[] = [];
      let page = 0;
      let hasMore = true;
      
      while (hasMore && page < 5) { // Limita a 5 páginas para não sobrecarregar
        const response = await fetch(`/api/opportunities/fetch?source=infojobs&page=${page}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch jobs');
        }

        allJobs = [...allJobs, ...data.data];
        hasMore = data.pagination.hasMore;
        page++;
        
        console.log(`📊 Página ${page}: ${data.data.length} vagas, Total: ${allJobs.length}`);
      }
      
      console.log('📊 Total de vagas encontradas:', allJobs.length);

      // Calcula vagas compatíveis
      let compatibleJobsCount = 0;
      let totalCompatibility = 0;
      const compatibleJobsDetails: Array<{title: string, company: string, compatibility: number, technologies: string[]}> = [];

      allJobs.forEach(job => {
        const compatibility = calculateCompatibility(userSkills, job.technologies, job.title);
        
        // Considera compatível se tiver pelo menos 30% de compatibilidade
        if (compatibility >= 30) {
          compatibleJobsCount++;
          totalCompatibility += compatibility;
          compatibleJobsDetails.push({
            title: job.title,
            company: job.company,
            compatibility,
            technologies: job.technologies
          });
        }
      });

      console.log('🎯 Vagas compatíveis encontradas:', compatibleJobsDetails);
      console.log('📊 Detalhes das vagas compatíveis:');
      compatibleJobsDetails.forEach(job => {
        console.log(`  - ${job.title} (${job.company}): ${job.compatibility}% - [${job.technologies.join(', ')}]`);
      });

      // Calcula outras estatísticas baseadas em dados reais ou localStorage
      const applications = getApplicationsCount();
      const interviews = getInterviewsCount();
      const responseRate = calculateResponseRate(applications, interviews);

      console.log('✅ Estatísticas calculadas:', {
        compatibleJobs: compatibleJobsCount,
        applications,
        interviews,
        responseRate
      });

      setStats({
        compatibleJobs: compatibleJobsCount,
        applications,
        interviews,
        responseRate,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  }, [userSkills, calculateCompatibility]);

  // Função para obter número de aplicações do localStorage
  const getApplicationsCount = (): number => {
    try {
      const applications = localStorage.getItem('userApplications');
      if (applications) {
        const parsed = JSON.parse(applications);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch (error) {
      console.error('Erro ao ler aplicações do localStorage:', error);
    }
    return 0;
  };

  // Função para obter número de entrevistas do localStorage
  const getInterviewsCount = (): number => {
    try {
      const interviews = localStorage.getItem('userInterviews');
      if (interviews) {
        const parsed = JSON.parse(interviews);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch (error) {
      console.error('Erro ao ler entrevistas do localStorage:', error);
    }
    return 0;
  };

  // Função para calcular taxa de resposta
  const calculateResponseRate = (applications: number, interviews: number): number => {
    if (applications === 0) return 0;
    return Math.round((interviews / applications) * 100);
  };

  // Auto-fetch quando as habilidades mudam
  useEffect(() => {
    if (autoFetch && userSkills.length > 0) {
      fetchStats();
    }
  }, [autoFetch, userSkills, fetchStats]);

  // Função para atualizar estatísticas manualmente
  const refreshStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    refreshStats,
    calculateCompatibility
  };
};
