import { useState, useEffect, useCallback } from 'react';

interface TrendingTechnology {
  name: string;
  jobs: number;
  growth: number;
  description: string;
}

interface SalaryRange {
  role: string;
  min: number;
  max: number;
  average: number;
  currency: string;
  experience: string;
}

interface MarketInsights {
  totalJobs: number;
  averageSalary: number;
  remoteWorkPercentage: number;
  mostDemandedSkills: string[];
  fastestGrowing: string[];
  lastUpdated: string;
}

interface MarketIntelligenceData {
  trendingTechnologies: TrendingTechnology[];
  salaryRanges: SalaryRange[];
  marketInsights: MarketInsights;
}

interface UseMarketIntelligenceOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // em milissegundos
}

interface UseMarketIntelligenceReturn {
  data: MarketIntelligenceData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastUpdated: string | null;
  sources?: {
    github: string;
    stackOverflow: string;
    jobMarket: string;
    salary: string;
  };
}

export const useMarketIntelligence = (options: UseMarketIntelligenceOptions = {}): UseMarketIntelligenceReturn => {
  const { autoFetch = true, refreshInterval = 300000 } = options; // 5 minutos por padrão
  
  const [data, setData] = useState<MarketIntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sources, setSources] = useState<{
    github: string;
    stackOverflow: string;
    jobMarket: string;
    salary: string;
  } | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/market-intelligence');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastUpdated(result.lastUpdated);
        setSources(result.sources);
        console.log('📊 Dados de inteligência de mercado carregados:', result.data);
        console.log('📡 Fontes de dados:', result.sources);
      } else {
        throw new Error(result.error || 'Erro ao buscar dados de mercado');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao buscar dados de inteligência de mercado:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  useEffect(() => {
    if (refreshInterval > 0 && autoFetch) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refreshData,
    lastUpdated,
    sources
  };
};
