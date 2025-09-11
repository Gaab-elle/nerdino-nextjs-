'use client';

import React from 'react';
import { Search, MapPin, Filter, SortAsc, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Filters {
  search: string;
  location: string;
  experience: string;
  stack: string;
  technologies: string[];
  salaryMin: number;
  salaryMax: number;
  contractType: string;
  sortBy: string;
}

interface OpportunitiesFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  userSkills: string[];
}

export const OpportunitiesFilters: React.FC<OpportunitiesFiltersProps> = ({
  filters,
  setFilters,
  userSkills
}) => {
  const { t } = useLanguage();

  // Termos de busca específicos para melhorar resultados
  const searchTerms = [
    { value: 'desenvolvedor', label: 'Desenvolvedor', icon: '💻' },
    { value: 'programador', label: 'Programador', icon: '👨‍💻' },
    { value: 'frontend', label: 'Frontend', icon: '🎨' },
    { value: 'backend', label: 'Backend', icon: '⚙️' },
    { value: 'fullstack', label: 'Full Stack', icon: '🔄' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'nodejs', label: 'Node.js', icon: '🟢' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'devops', label: 'DevOps', icon: '🔧' },
    { value: 'mobile', label: 'Mobile', icon: '📱' },
    { value: 'ui-ux', label: 'UI/UX', icon: '🎨' },
    { value: 'data-science', label: 'Data Science', icon: '📊' },
    { value: 'machine-learning', label: 'Machine Learning', icon: '🤖' }
  ];

  const locations = [
    { value: 'all', label: t('opportunities.filters.allLocations') },
    { value: 'remote', label: t('opportunities.filters.remote') },
    { value: 'São Paulo', label: 'São Paulo, SP' },
    { value: 'Rio de Janeiro', label: 'Rio de Janeiro, RJ' },
    { value: 'Belo Horizonte', label: 'Belo Horizonte, MG' }
  ];

  const experiences = [
    { value: 'all', label: t('opportunities.filters.allLevels') },
    { value: 'junior', label: t('opportunities.filters.junior') },
    { value: 'pleno', label: t('opportunities.filters.pleno') },
    { value: 'senior', label: t('opportunities.filters.senior') },
    { value: 'tech-lead', label: t('opportunities.filters.techLead') }
  ];

  const stacks = [
    { value: 'all', label: t('opportunities.filters.allStacks') },
    { value: 'frontend', label: t('opportunities.filters.frontend') },
    { value: 'backend', label: t('opportunities.filters.backend') },
    { value: 'fullstack', label: t('opportunities.filters.fullstack') },
    { value: 'mobile', label: t('opportunities.filters.mobile') },
    { value: 'devops', label: t('opportunities.filters.devops') }
  ];

  const contractTypes = [
    { value: 'all', label: t('opportunities.filters.allContracts') },
    { value: 'CLT', label: 'CLT' },
    { value: 'PJ', label: 'PJ' },
    { value: 'freelance', label: t('opportunities.filters.freelance') },
    { value: 'estagio', label: t('opportunities.filters.internship') }
  ];

  const sortOptions = [
    { value: 'relevance', label: t('opportunities.filters.relevance') },
    { value: 'recent', label: t('opportunities.filters.recent') },
    { value: 'salary', label: t('opportunities.filters.salary') },
    { value: 'match', label: t('opportunities.filters.match') }
  ];

  const popularTechnologies = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
    'Kubernetes', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Vue.js', 'Angular'
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const addTechnology = (tech: string) => {
    if (!filters.technologies.includes(tech)) {
      setFilters({ ...filters, technologies: [...filters.technologies, tech] });
    }
  };

  const removeTechnology = (tech: string) => {
    setFilters({ 
      ...filters, 
      technologies: filters.technologies.filter(t => t !== tech) 
    });
  };

  const clearAllFilters = () => {
    setFilters({
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
  };

  const hasActiveFilters = filters.search || 
    filters.location !== 'all' || 
    filters.experience !== 'all' || 
    filters.stack !== 'all' || 
    filters.technologies.length > 0 || 
    filters.contractType !== 'all';

  // Verifica se está filtrando por vagas compatíveis
  const isFilteringCompatibleJobs = filters.technologies.length > 0 && 
    filters.technologies.every(tech => userSkills.includes(tech)) &&
    filters.search === '' && 
    filters.location === 'all' && 
    filters.experience === 'all' && 
    filters.stack === 'all' &&
    filters.salaryMin === 0 && 
    filters.salaryMax === 0 &&
    filters.contractType === 'all';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t('opportunities.filters.title')}
        </h2>
        {isFilteringCompatibleJobs && (
          <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
            🎯 Vagas Compatíveis
          </Badge>
        )}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            {t('opportunities.filters.clearAll')}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('opportunities.filters.search')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={t('opportunities.filters.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {/* Quick Search Terms */}
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Busca rápida:</p>
            <div className="flex flex-wrap gap-2">
              {searchTerms.map((term) => (
                <Button
                  key={term.value}
                  variant={filters.search === term.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange('search', term.value)}
                  className="text-xs"
                >
                  <span className="mr-1">{term.icon}</span>
                  {term.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Location and Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              {t('opportunities.filters.location')}
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {locations.map((location) => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('opportunities.filters.experience')}
            </label>
            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {experiences.map((exp) => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stack and Contract Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('opportunities.filters.stack')}
            </label>
            <select
              value={filters.stack}
              onChange={(e) => handleFilterChange('stack', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {stacks.map((stack) => (
                <option key={stack.value} value={stack.value}>
                  {stack.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('opportunities.filters.contractType')}
            </label>
            <select
              value={filters.contractType}
              onChange={(e) => handleFilterChange('contractType', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {contractTypes.map((contract) => (
                <option key={contract.value} value={contract.value}>
                  {contract.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('opportunities.filters.salaryRange')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                placeholder={t('opportunities.filters.minSalary')}
                value={filters.salaryMin}
                onChange={(e) => handleFilterChange('salaryMin', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder={t('opportunities.filters.maxSalary')}
                value={filters.salaryMax}
                onChange={(e) => handleFilterChange('salaryMax', parseInt(e.target.value) || 50000)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('opportunities.filters.technologies')}
          </label>
          
          {/* Selected Technologies */}
          {filters.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {filters.technologies.map((tech) => (
                <Badge 
                  key={tech} 
                  variant="default" 
                  className="flex items-center gap-1"
                >
                  {tech}
                  <button
                    onClick={() => removeTechnology(tech)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Popular Technologies */}
          <div className="flex flex-wrap gap-2">
            {popularTechnologies.map((tech) => (
              <button
                key={tech}
                onClick={() => addTechnology(tech)}
                disabled={filters.technologies.includes(tech)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filters.technologies.includes(tech)
                    ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('opportunities.filters.sortBy')}:
            </span>
          </div>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
