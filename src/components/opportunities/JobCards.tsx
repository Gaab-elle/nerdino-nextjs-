'use client';

import React from 'react';
import { MapPin, Clock, Heart, ExternalLink, Star, TrendingUp, Users, Calendar, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  remote: boolean;
  salary: { min: number; max: number };
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
}

interface JobCardsProps {
  jobs: Job[];
  userSkills: string[];
  onApply: (jobId: number) => void;
  onFavorite: (jobId: number) => void;
}

export const JobCards: React.FC<JobCardsProps> = ({ jobs, userSkills, onApply, onFavorite }) => {
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

  const formatSalary = (min: number, max: number) => {
    return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          {t('opportunities.job.noJobs')}
        </div>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          {t('opportunities.job.noJobsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('opportunities.job.results')} ({jobs.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg ${
              job.matchScore >= 90 
                ? 'border-yellow-400 dark:border-yellow-500' 
                : job.userApplied
                ? 'border-green-400 dark:border-green-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Company Logo and Basic Info */}
              <div className="flex-shrink-0">
                <div className="flex items-start gap-4">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                          {job.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.isNew && (
                          <Badge variant="default" className="bg-green-500">
                            {t('opportunities.job.new')}
                          </Badge>
                        )}
                        {job.isUrgent && (
                          <Badge variant="destructive">
                            {t('opportunities.job.urgent')}
                          </Badge>
                        )}
                        {job.remote && (
                          <Badge variant="secondary">
                            {t('opportunities.job.remote')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.postedAt}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {getExperienceLabel(job.experience)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {job.contractType}
                      </div>
                    </div>

                    {/* Salary */}
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                      {formatSalary(job.salary.min, job.salary.max)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Score and Actions */}
              <div className="flex-shrink-0 lg:w-80">
                {/* Match Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('opportunities.job.matchScore')}
                    </span>
                    <Badge className={getMatchColor(job.matchScore)}>
                      {job.matchScore}%
                    </Badge>
                  </div>
                  <Progress 
                    value={job.matchScore} 
                    className="h-2 mb-2"
                  />
                  
                  {/* Match Breakdown */}
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>{t('opportunities.job.skills')}</span>
                      <span>{job.matchBreakdown.skills}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('opportunities.job.experience')}</span>
                      <span>{job.matchBreakdown.experience}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('opportunities.job.location')}</span>
                      <span>{job.matchBreakdown.location}%</span>
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {job.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant={userSkills.includes(tech) ? 'default' : 'secondary'}
                        className={`text-xs ${
                          userSkills.includes(tech) 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : ''
                        }`}
                      >
                        {tech}
                        {userSkills.includes(tech) && ' ✓'}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {job.userApplied ? (
                    <Button disabled className="flex-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('opportunities.job.applied')}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => onApply(job.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {t('opportunities.job.apply')}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFavorite(job.id)}
                    className={job.userFavorited ? 'text-red-600 border-red-300' : ''}
                  >
                    <Heart className={`h-4 w-4 ${job.userFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {job.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
