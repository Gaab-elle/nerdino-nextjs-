'use client';

import React from 'react';
import { MapPin, Clock, Heart, ExternalLink, Star, TrendingUp, Users, Calendar, CheckCircle, X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  salary?: { min: number; max: number };
  experience: string;
  contractType: string;
  technologies: string[];
  description: string;
  postedAt: string;
  isNew: boolean;
  isUrgent: boolean;
  matchScore: number;
  matchBreakdown: {
    skills: number;
    experience: number;
    location: number;
  };
  userApplied: boolean;
  userFavorited: boolean;
  url: string;
}

interface JobCardsProps {
  jobs: Job[];
  userSkills: string[];
  loading?: boolean;
  error?: string | null;
  dataSource?: string;
  onApply: (jobId: string) => void;
  onFavorite: (jobId: string) => void;
  onRefresh?: () => void;
}

export const JobCards: React.FC<JobCardsProps> = ({ 
  jobs, 
  userSkills, 
  loading = false, 
  error = null, 
  dataSource = 'mock',
  onApply, 
  onFavorite,
  onRefresh 
}) => {
  const { t } = useLanguage();

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 75) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const getMatchProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case 'junior': return t('opportunities.job.junior');
      case 'pleno': return t('opportunities.job.pleno');
      case 'senior': return t('opportunities.job.senior');
      case 'tech-lead': return t('opportunities.job.techLead');
      default: return exp;
    }
  };

  const getExperienceImage = (exp: string) => {
    switch (exp.toLowerCase()) {
      case 'estagio':
      case 'estágio':
      case 'estagiario':
      case 'estagiário':
        return '/estagiario.png';
      case 'junior':
      case 'júnior':
        return '/junior.png';
      case 'pleno':
        return '/pleno.png';
      case 'senior':
      case 'sênior':
      case 'tech-lead':
      case 'tech lead':
        return '/senior.png';
      default: 
        return '/junior.png'; // Default para junior
    }
  };

  const formatSalary = (min: number, max: number) => {
    return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
  };

  const handleShareJob = async (job: Job) => {
    const shareData = {
      title: `${job.title} - ${job.company}`,
      text: `Confira esta vaga: ${job.title} na ${job.company}`,
      url: job.url
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
        fallbackShare(job);
      }
    } else {
      fallbackShare(job);
    }
  };

  const fallbackShare = (job: Job) => {
    const shareText = `Confira esta vaga: ${job.title} na ${job.company}\n${job.url}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Link da vaga copiado para a área de transferência!');
      }).catch(() => {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link da vaga copiado para a área de transferência!');
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Carregando oportunidades...
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Erro ao carregar oportunidades
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 text-lg mb-4">
            {error}
          </div>
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            Não foi possível carregar as oportunidades. Verifique sua conexão e tente novamente.
          </p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              Tentar Novamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Oportunidades
          </h2>
          {dataSource !== 'mock' && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
                   Dados de: {
                     dataSource === 'infojobs' ? 'InfoJobs.com.br' : 
                     dataSource === 'cache' ? 'Cache (dados recentes)' :
                     dataSource === 'themuse' ? 'TheMuse API' : 
                     dataSource === 'adzuna' ? 'Adzuna API' : 
                     'Dados de exemplo'
                   }
            </div>
          )}
        </div>
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            Nenhuma oportunidade encontrada
          </div>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            Tente ajustar os filtros ou verifique novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Oportunidades ({jobs.length})
          </h2>
          {dataSource !== 'mock' && (
            <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-700 dark:text-purple-300">
              Dados de: {
                dataSource === 'infojobs' ? 'InfoJobs.com.br' : 
                dataSource === 'cache' ? 'Cache (dados recentes)' :
                dataSource === 'themuse' ? 'TheMuse API' : 
                dataSource === 'adzuna' ? 'Adzuna API' : 
                'Dados de exemplo'
              }
            </Badge>
          )}
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center space-x-2 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20 dark:hover:border-purple-700 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Atualizar</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              job.matchScore >= 90 
                ? 'border-green-200 dark:border-green-800 shadow-green-100 dark:shadow-green-900/20' 
                : job.userApplied
                ? 'border-green-400 dark:border-green-500 shadow-green-100 dark:shadow-green-900/20'
                : 'border-gray-200 dark:border-gray-700 shadow-gray-100 dark:shadow-gray-900/20'
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Company Logo and Basic Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <img
                      src={getExperienceImage(job.experience)}
                      alt={`Nível ${getExperienceLabel(job.experience)}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent truncate">
                          {job.title}
                        </h3>
                        <p className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">
                          {job.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {job.isNew && (
                          <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg text-xs">
                            {t('opportunities.job.new')}
                          </Badge>
                        )}
                        {job.isUrgent && (
                          <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg text-xs">
                            {t('opportunities.job.urgent')}
                          </Badge>
                        )}
                        {job.remote && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 text-xs">
                            {t('opportunities.job.remote')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{job.postedAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{getExperienceLabel(job.experience)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{job.contractType}</span>
                      </div>
                    </div>

                    {/* Salary */}
                    {job.salary && (
                      <div className="text-base font-semibold text-green-600 dark:text-green-400 mb-3">
                        {formatSalary(job.salary.min, job.salary.max)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Score and Actions */}
              <div className="flex-shrink-0 w-full lg:w-72 xl:w-80">
                {/* Match Score */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t('opportunities.job.matchScore')}
                    </span>
                    <Badge className={`${getMatchColor(job.matchScore)} text-xs`}>
                      {job.matchScore}%
                    </Badge>
                  </div>
                  <Progress 
                    value={job.matchScore} 
                    className="h-2 mb-2 bg-gray-200 dark:bg-gray-700"
                  />
                  
                  {/* Match Breakdown */}
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span className="truncate">{t('opportunities.job.skills')}</span>
                      <span className="ml-2">{job.matchBreakdown.skills}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="truncate">{t('opportunities.job.experience')}</span>
                      <span className="ml-2">{job.matchBreakdown.experience}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="truncate">{t('opportunities.job.location')}</span>
                      <span className="ml-2">{job.matchBreakdown.location}%</span>
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {job.technologies.slice(0, 4).map((tech) => (
                      <Badge
                        key={tech}
                        variant={userSkills.includes(tech) ? 'default' : 'secondary'}
                        className={`text-xs transition-all duration-200 hover:scale-105 ${
                          userSkills.includes(tech) 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border border-green-200 dark:border-green-700' 
                            : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 dark:from-gray-800 dark:to-slate-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {tech}
                        {userSkills.includes(tech) && ' ✓'}
                      </Badge>
                    ))}
                    {job.technologies.length > 4 && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        +{job.technologies.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 sm:gap-2">
                  {job.userApplied ? (
                    <Button disabled className="flex-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs sm:text-sm">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{t('opportunities.job.applied')}</span>
                      <span className="sm:hidden">Aplicado</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => window.open(job.url, '_blank')}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">{t('opportunities.job.apply')}</span>
                      <span className="sm:hidden">Candidatar</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFavorite(job.id)}
                    className={`transition-all duration-200 hover:scale-110 p-1 sm:p-2 ${
                      job.userFavorited 
                        ? 'text-red-600 border-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400' 
                        : 'hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${job.userFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShareJob(job)}
                    title="Compartilhar vaga"
                    className="transition-all duration-200 hover:scale-110 hover:border-green-300 hover:text-green-600 p-1 sm:p-2"
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
                {job.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
