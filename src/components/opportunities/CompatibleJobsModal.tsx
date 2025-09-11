'use client';

import React from 'react';
import { X, MapPin, Clock, ExternalLink, Star, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompatibleJob {
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
  source?: string;
}

interface CompatibleJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  compatibleJobs: CompatibleJob[];
  userSkills: string[];
  loading?: boolean;
}

export const CompatibleJobsModal: React.FC<CompatibleJobsModalProps> = ({
  isOpen,
  onClose,
  compatibleJobs,
  userSkills,
  loading = false
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleApplyToJob = (jobId: string) => {
    // Implementar lógica de candidatura
    console.log('Aplicando para vaga:', jobId);
  };

  const handleFavoriteJob = (jobId: string) => {
    // Implementar lógica de favoritar
    console.log('Favoritando vaga:', jobId);
  };

  const handleShareJob = async (job: CompatibleJob) => {
    const shareData = {
      title: job.title,
      text: `Vaga de ${job.title} na ${job.company}`,
      url: job.url
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para desktop
      const text = `${job.title} - ${job.company}\n${job.url}`;
      await navigator.clipboard.writeText(text);
      alert('Link copiado para a área de transferência!');
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
        return '/junior.png';
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getMatchBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 80) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-orange-100 dark:bg-orange-900/30';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🎯 Vagas Compatíveis com Seu Perfil
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {compatibleJobs.length} vagas encontradas baseadas nas suas habilidades: {userSkills.join(', ')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Analisando vagas compatíveis...</p>
              </div>
            </div>
          ) : compatibleJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma vaga compatível encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar suas habilidades ou expandir sua busca.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {compatibleJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      <img
                        src={getExperienceImage(job.experience)}
                        alt={job.experience}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 truncate">
                            {job.company}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {job.location}
                            </span>
                            {job.remote && (
                              <Badge variant="outline" className="text-xs">
                                Remoto
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Match Score */}
                        <div className={`px-3 py-1 rounded-full ${getMatchBgColor(job.matchScore)}`}>
                          <span className={`text-sm font-semibold ${getMatchColor(job.matchScore)}`}>
                            {job.matchScore}% match
                          </span>
                        </div>
                      </div>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.technologies.slice(0, 6).map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {job.technologies.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.technologies.length - 6}
                          </Badge>
                        )}
                      </div>

                      {/* Match Breakdown */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Habilidades</span>
                          <span className="text-gray-900 dark:text-gray-100">{job.matchBreakdown.skills}%</span>
                        </div>
                        <Progress value={job.matchBreakdown.skills} className="h-2" />
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Experiência</span>
                          <span className="text-gray-900 dark:text-gray-100">{job.matchBreakdown.experience}%</span>
                        </div>
                        <Progress value={job.matchBreakdown.experience} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => window.open(job.url, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Candidatar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareJob(job)}
                        >
                          Compartilhar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFavoriteJob(job.id)}
                        >
                          <Star className={`h-4 w-4 ${job.userFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {compatibleJobs.length} vagas compatíveis encontradas
          </div>
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
