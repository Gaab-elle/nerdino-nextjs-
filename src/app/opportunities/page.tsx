'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { OpportunitiesHeader } from '@/components/opportunities/OpportunitiesHeader';
import { OpportunitiesFilters } from '@/components/opportunities/OpportunitiesFilters';
import { JobCards } from '@/components/opportunities/JobCards';
import { OpportunitiesSidebar } from '@/components/opportunities/OpportunitiesSidebar';

export default function OpportunitiesPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    experience: 'all',
    stack: 'all',
    technologies: [],
    salaryMin: 0,
    salaryMax: 50000,
    contractType: 'all',
    sortBy: 'relevance'
  });
  const [userProfile] = useState({
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'],
    experience: 'senior',
    location: 'São Paulo, SP',
    available: true
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load mock jobs data
  useEffect(() => {
    const mockJobs = [
      {
        id: 1,
        title: 'Senior React Developer',
        company: 'TechCorp Solutions',
        companyLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
        location: 'São Paulo, SP',
        remote: true,
        salary: { min: 12000, max: 18000 },
        experience: 'senior',
        contractType: 'CLT',
        technologies: ['React', 'TypeScript', 'Node.js', 'AWS'],
        description: 'Estamos procurando um desenvolvedor sênior para liderar o desenvolvimento de nossa plataforma web.',
        postedAt: '2 dias atrás',
        isNew: true,
        isUrgent: false,
        matchScore: 95,
        matchBreakdown: {
          skills: 100,
          experience: 95,
          location: 100
        },
        userApplied: false,
        userFavorited: false
      },
      {
        id: 2,
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
        location: 'Remoto',
        remote: true,
        salary: { min: 8000, max: 12000 },
        experience: 'pleno',
        contractType: 'PJ',
        technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
        description: 'Oportunidade para trabalhar em uma startup em crescimento com tecnologias modernas.',
        postedAt: '1 semana atrás',
        isNew: false,
        isUrgent: true,
        matchScore: 85,
        matchBreakdown: {
          skills: 80,
          experience: 90,
          location: 100
        },
        userApplied: false,
        userFavorited: true
      },
      {
        id: 3,
        title: 'Tech Lead - Python',
        company: 'DataTech Inc',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
        location: 'Rio de Janeiro, RJ',
        remote: false,
        salary: { min: 15000, max: 25000 },
        experience: 'senior',
        contractType: 'CLT',
        technologies: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
        description: 'Liderança técnica de equipe de desenvolvimento Python com foco em dados.',
        postedAt: '3 dias atrás',
        isNew: true,
        isUrgent: false,
        matchScore: 75,
        matchBreakdown: {
          skills: 60,
          experience: 100,
          location: 80
        },
        userApplied: true,
        userFavorited: false
      },
      {
        id: 4,
        title: 'Frontend Developer',
        company: 'DesignStudio',
        companyLogo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
        location: 'São Paulo, SP',
        remote: true,
        salary: { min: 6000, max: 9000 },
        experience: 'junior',
        contractType: 'CLT',
        technologies: ['React', 'TypeScript', 'CSS', 'Figma'],
        description: 'Desenvolvedor frontend para trabalhar com design system e interfaces modernas.',
        postedAt: '5 dias atrás',
        isNew: false,
        isUrgent: false,
        matchScore: 90,
        matchBreakdown: {
          skills: 85,
          experience: 70,
          location: 100
        },
        userApplied: false,
        userFavorited: false
      },
      {
        id: 5,
        title: 'DevOps Engineer',
        company: 'CloudTech',
        companyLogo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop',
        location: 'Remoto',
        remote: true,
        salary: { min: 10000, max: 15000 },
        experience: 'pleno',
        contractType: 'PJ',
        technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
        description: 'Especialista em DevOps para gerenciar infraestrutura cloud e CI/CD.',
        postedAt: '1 dia atrás',
        isNew: true,
        isUrgent: false,
        matchScore: 70,
        matchBreakdown: {
          skills: 65,
          experience: 85,
          location: 100
        },
        userApplied: false,
        userFavorited: false
      }
    ];
    
    setJobs(mockJobs);
    setFilteredJobs(mockJobs);
  }, []);

  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.technologies.some(tech => tech.toLowerCase().includes(searchLower))
      );
    }

    // Location filter
    if (filters.location !== 'all') {
      if (filters.location === 'remote') {
        filtered = filtered.filter(job => job.remote);
      } else {
        filtered = filtered.filter(job => job.location.includes(filters.location));
      }
    }

    // Experience filter
    if (filters.experience !== 'all') {
      filtered = filtered.filter(job => job.experience === filters.experience);
    }

    // Stack filter
    if (filters.stack !== 'all') {
      // This would be more complex in a real implementation
      filtered = filtered.filter(job => {
        const frontendTechs = ['React', 'Vue', 'Angular', 'CSS', 'HTML'];
        const backendTechs = ['Node.js', 'Python', 'Java', 'C#', 'Go'];
        const mobileTechs = ['React Native', 'Flutter', 'Swift', 'Kotlin'];
        
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
    if (filters.technologies.length > 0) {
      filtered = filtered.filter(job => 
        filters.technologies.some(tech => job.technologies.includes(tech))
      );
    }

    // Salary filter
    filtered = filtered.filter(job => 
      job.salary.min >= filters.salaryMin && job.salary.max <= filters.salaryMax
    );

    // Contract type filter
    if (filters.contractType !== 'all') {
      filtered = filtered.filter(job => job.contractType === filters.contractType);
    }

    // Sort
    switch (filters.sortBy) {
      case 'relevance':
        filtered.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        break;
      case 'salary':
        filtered.sort((a, b) => b.salary.max - a.salary.max);
        break;
      case 'match':
        filtered.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]);

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
        <OpportunitiesHeader userProfile={userProfile} />
        
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
                onApply={(jobId) => {
                  setJobs(jobs.map(job => 
                    job.id === jobId ? { ...job, userApplied: true } : job
                  ));
                }}
                onFavorite={(jobId) => {
                  setJobs(jobs.map(job => 
                    job.id === jobId ? { ...job, userFavorited: !job.userFavorited } : job
                  ));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
