'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { OpportunitiesHeader } from '@/features/opportunities/OpportunitiesHeader';
import { OpportunitiesFilters } from '@/features/opportunities/OpportunitiesFilters';
import { JobCards } from '@/features/opportunities/JobCards';
import { OpportunitiesSidebar } from '@/features/opportunities/OpportunitiesSidebar';
import { Pagination } from '@/features/opportunities/Pagination';
import { CompatibleJobsModal } from '@/features/opportunities/CompatibleJobsModal';
import { JobData, CompatibleJob } from '@/types/jobs';
import { useOpportunities } from '@/features/opportunities/useOpportunities';

export default function OpportunitiesPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    experience: 'all',
    stack: 'all',
    technologies: [] as string[],
    salaryMin: 0,
    salaryMax: 0, // Mudado para 0 para não filtrar por salário por padrão
    contractType: 'all',
    sortBy: 'relevance'
  });
  const [userProfile] = useState({
    skills: ['React', 'TypeScript', 'Node.js', 'JavaScript', 'Python', 'AWS', 'Docker', 'Git'], // Habilidades reais para teste
    experience: 'senior',
    location: 'São Paulo, SP',
    available: true
  });

  const [showCompatibleJobsModal, setShowCompatibleJobsModal] = useState(false);
  const [compatibleJobs, setCompatibleJobs] = useState<CompatibleJob[]>([]);
  const [loadingCompatibleJobs, setLoadingCompatibleJobs] = useState(false);

  // Use the opportunities hook
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    pagination,
    currentSource,
    refreshJobs,
    goToPage,
    applyToJob,
    toggleFavorite,
    filterJobs
  } = useOpportunities({
    userSkills: userProfile.skills,
    source: 'infojobs', // Using InfoJobs scraping as default
    autoFetch: true
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Memoize filtered jobs to prevent infinite loops
  const filteredJobs = useMemo(() => {
    console.log('🔍 Jobs recebidos:', jobs.length, 'Source:', currentSource);
    console.log('📊 Primeira vaga:', jobs[0]?.title, jobs[0]?.company);
    const filtered = filterJobs(filters, jobs);
    console.log('✅ Vagas filtradas:', filtered.length);
    return filtered;
  }, [jobs, filters, currentSource, filterJobs]);

  // Função para mostrar vagas compatíveis em um modal
  const handleShowCompatibleJobs = async () => {
    console.log('🎯 Buscando vagas compatíveis para:', userProfile.skills);
    
    setLoadingCompatibleJobs(true);
    setShowCompatibleJobsModal(true);
    
    // Função para calcular compatibilidade
    const calculateCompatibility = (userSkills: string[], jobTechnologies: string[], jobTitle: string = ''): number => {
      if (userSkills.length === 0) {
        return 0;
      }

      const normalizeSkill = (skill: string) => skill.toLowerCase().trim();
      const normalizedUserSkills = userSkills.map(normalizeSkill);
      const normalizedJobTechs = jobTechnologies.map(normalizeSkill);
      const normalizedJobTitle = jobTitle.toLowerCase();

      // Se não há tecnologias definidas, tenta inferir do título
      if (jobTechnologies.length === 0) {
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
        
        return 0;
      }

      const matchingSkills = normalizedUserSkills.filter(userSkill => 
        normalizedJobTechs.some(jobTech => 
          jobTech.includes(userSkill) || userSkill.includes(jobTech)
        )
      );

      return Math.round((matchingSkills.length / Math.max(userSkills.length, 1)) * 100);
    };

    try {
        // Busca todas as vagas disponíveis (múltiplas páginas)
        let allJobs: Array<{
          id: string;
          title: string;
          company: string;
          location: string;
          salary: { min: number; max: number };
          type: string;
          description: string;
          requirements: string;
          technologies: string[];
          postedAt: string;
          isRemote: boolean;
          experienceLevel: string;
          remote: boolean;
          experience: string;
          contractType: string;
          isNew: boolean;
          isUrgent: boolean;
          userApplied: boolean;
          userFavorited: boolean;
          url: string;
        }> = [];
      let page = 0;
      let hasMore = true;
      
      while (hasMore && page < 5) { // Limita a 5 páginas
        const response = await fetch(`/api/opportunities/fetch?source=infojobs&page=${page}`);
        const data = await response.json();

        if (data.success) {
          allJobs = [...allJobs, ...data.data];
          hasMore = data.pagination.hasMore;
          page++;
          console.log(`📊 Página ${page}: ${data.data.length} vagas, Total: ${allJobs.length}`);
        } else {
          break;
        }
      }

      // Filtra vagas compatíveis (≥30% de compatibilidade) e adiciona match score
      const compatibleJobsWithScore = allJobs
        .map(job => {
          const compatibility = calculateCompatibility(userProfile.skills, job.technologies, job.title);
          return {
            ...job,
            matchScore: compatibility,
            matchBreakdown: {
              skills: compatibility,
              experience: 85, // Default
              location: job.isRemote ? 100 : 80
            }
          };
        })
        .filter(job => job.matchScore >= 30)
        .sort((a, b) => b.matchScore - a.matchScore); // Ordena por compatibilidade

      console.log('🎯 Total de vagas analisadas:', allJobs.length);
      console.log('🎯 Vagas compatíveis encontradas:', compatibleJobsWithScore.length);
      console.log('📊 Detalhes das vagas compatíveis:');
      compatibleJobsWithScore.forEach(job => {
        console.log(`  - ${job.title} (${job.company}): ${job.matchScore}% - [${job.technologies.join(', ')}]`);
      });
      
      setCompatibleJobs(compatibleJobsWithScore);
    } catch (error) {
      console.error('❌ Erro ao buscar vagas compatíveis:', error);
      setCompatibleJobs([]);
    } finally {
      setLoadingCompatibleJobs(false);
    }
  };



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
        <OpportunitiesHeader 
          userProfile={userProfile} 
          onShowCompatibleJobs={handleShowCompatibleJobs}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <OpportunitiesSidebar userProfile={userProfile} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filters */}
              <OpportunitiesFilters 
                filters={filters}
                setFilters={setFilters}
                userSkills={userProfile.skills}
              />
              
              {/* Job Cards */}
              <JobCards 
                jobs={filteredJobs}
                userSkills={userProfile.skills}
                loading={jobsLoading}
                error={jobsError}
                dataSource={currentSource}
                onApply={applyToJob}
                onFavorite={toggleFavorite}
                onRefresh={refreshJobs}
              />
              
              {/* Pagination */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasMore={pagination.hasMore}
                onPageChange={goToPage}
                loading={jobsLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vagas Compatíveis */}
      <CompatibleJobsModal
        isOpen={showCompatibleJobsModal}
        onClose={() => setShowCompatibleJobsModal(false)}
        compatibleJobs={compatibleJobs}
        userSkills={userProfile.skills}
        loading={loadingCompatibleJobs}
      />
    </>
  );
}
