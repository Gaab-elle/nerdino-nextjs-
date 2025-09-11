'use client';

import React from 'react';
import { TrendingUp, DollarSign, RefreshCw, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMarketIntelligence } from '@/hooks/useMarketIntelligence';
import { useLanguage } from '@/contexts/LanguageContext';

export const MarketIntelligence: React.FC = () => {
  const { t } = useLanguage();
  const { data, loading, error, refreshData, lastUpdated, sources } = useMarketIntelligence({
    autoFetch: true,
    refreshInterval: 300000 // 5 minutos
  });

  // Debug logs
  console.log('🔍 MarketIntelligence Debug:', {
    data: data ? 'loaded' : 'null',
    loading,
    error,
    hasTrendingTechs: data?.trendingTechnologies?.length || 0,
    hasSalaryRanges: data?.salaryRanges?.length || 0
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 25) return 'text-green-600 dark:text-green-400';
    if (growth >= 15) return 'text-blue-600 dark:text-blue-400';
    if (growth >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getGrowthBgColor = (growth: number) => {
    if (growth >= 25) return 'bg-green-100 dark:bg-green-900/30';
    if (growth >= 15) return 'bg-blue-100 dark:bg-blue-900/30';
    if (growth >= 10) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-orange-100 dark:bg-orange-900/30';
  };

  if (loading && !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando inteligência de mercado...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500 rounded-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">
          Inteligência de Mercado
        </h2>
      </div>

      <div className="space-y-6">
        {/* Profissões em Alta */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Profissões em Alta
          </h3>
          <div className="space-y-2">
            {data.trendingTechnologies.slice(0, 4).map((tech) => (
              <div key={tech.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-white text-sm font-medium">{tech.name}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faixas Salariais */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Faixas Salariais
          </h3>
          <div className="space-y-1.5">
            {data.salaryRanges.slice(0, 4).map((salary) => (
              <div key={salary.role} className="flex items-center justify-between">
                <span className="text-white text-xs font-medium flex-1 min-w-0">
                  {salary.role.replace('Desenvolvedor ', '')}
                </span>
                <span className="text-white text-xs whitespace-nowrap ml-2">
                  {formatCurrency(salary.min)} - {formatCurrency(salary.max)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
