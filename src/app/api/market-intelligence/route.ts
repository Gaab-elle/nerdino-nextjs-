import { NextResponse } from 'next/server';
import { getGitHubTrendingTechnologies } from '@/lib/data-sources/githubTrending';
import { getStackOverflowTrendingTags } from '@/lib/data-sources/stackOverflowTrending';
import { analyzeJobMarket, getSalaryData } from '@/lib/data-sources/jobMarketAnalysis';

// Dados de fallback caso as APIs falhem
const FALLBACK_DATA = {
  trendingTechnologies: [
    {
      name: 'Data Scientist',
      jobs: 3200,
      growth: 42,
      description: 'Data Science - Análise de dados e machine learning'
    },
    {
      name: 'DevOps Engineer',
      jobs: 2800,
      growth: 38,
      description: 'DevOps - Automação e infraestrutura'
    },
    {
      name: 'AI/ML Engineer',
      jobs: 2400,
      growth: 45,
      description: 'Artificial Intelligence - Inteligência artificial'
    },
    {
      name: 'Cloud Architect',
      jobs: 1900,
      growth: 35,
      description: 'Cloud - Arquitetura de nuvem'
    },
    {
      name: 'Cybersecurity Specialist',
      jobs: 2100,
      growth: 40,
      description: 'Security - Segurança da informação'
    },
    {
      name: 'Product Manager',
      jobs: 2600,
      growth: 28,
      description: 'Product - Gestão de produtos'
    },
    {
      name: 'Blockchain Developer',
      jobs: 1200,
      growth: 50,
      description: 'Blockchain - Desenvolvimento blockchain'
    },
    {
      name: 'Tech Lead',
      jobs: 1500,
      growth: 30,
      description: 'Leadership - Liderança técnica'
    }
  ],
  salaryRanges: [
    {
      role: 'AI/ML Engineer',
      min: 12000,
      max: 35000,
      average: 23500,
      currency: 'BRL',
      experience: 'Pleno a Sênior'
    },
    {
      role: 'Blockchain Developer',
      min: 15000,
      max: 40000,
      average: 27500,
      currency: 'BRL',
      experience: 'Pleno a Sênior'
    },
    {
      role: 'Cybersecurity Specialist',
      min: 10000,
      max: 30000,
      average: 20000,
      currency: 'BRL',
      experience: 'Pleno a Sênior'
    },
    {
      role: 'Data Scientist',
      min: 11000,
      max: 32000,
      average: 21500,
      currency: 'BRL',
      experience: 'Pleno a Sênior'
    },
    {
      role: 'DevOps Engineer',
      min: 10000,
      max: 25000,
      average: 17500,
      currency: 'BRL',
      experience: 'Pleno a Sênior'
    },
    {
      role: 'Cloud Architect',
      min: 15000,
      max: 35000,
      average: 25000,
      currency: 'BRL',
      experience: 'Sênior'
    },
    {
      role: 'Product Manager',
      min: 12000,
      max: 28000,
      average: 20000,
      currency: 'BRL',
      experience: 'Pleno a Sênior'
    },
    {
      role: 'Tech Lead',
      min: 18000,
      max: 40000,
      average: 29000,
      currency: 'BRL',
      experience: 'Sênior'
    }
  ],
  marketInsights: {
    totalJobs: 1247,
    averageSalary: 13500,
    remoteWorkPercentage: 68,
    mostDemandedSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS'],
    fastestGrowing: ['Kubernetes', 'GraphQL', 'TypeScript', 'Docker', 'AWS'],
    lastUpdated: new Date().toISOString()
  }
};

export async function GET() {
  try {
    console.log('🔄 Buscando dados reais de inteligência de mercado...');
    
    // Buscar dados de múltiplas fontes em paralelo
    const [githubTrending, stackOverflowTags, jobMarketData, salaryData] = await Promise.allSettled([
      getGitHubTrendingTechnologies(),
      getStackOverflowTrendingTags(),
      analyzeJobMarket(),
      getSalaryData()
    ]);

    console.log('📊 Resultados das fontes de dados:');
    console.log('  - GitHub Trending:', githubTrending.status);
    console.log('  - Stack Overflow:', stackOverflowTags.status);
    console.log('  - Job Market:', jobMarketData.status);
    console.log('  - Salary Data:', salaryData.status);

    // Combinar dados de diferentes fontes
    let trendingTechnologies: Array<{
      name: string;
      jobs: number;
      growth: number;
      description: string;
      category: string;
    }> = [];
    let salaryRanges: Array<{
      role: string;
      min: number;
      max: number;
      average: number;
      currency: string;
      experience: string;
    }> = [];

    // Usar dados do GitHub se disponível
    if (githubTrending.status === 'fulfilled' && githubTrending.value.length > 0) {
      trendingTechnologies = githubTrending.value.map(tech => ({
        name: tech.name,
        jobs: tech.stars / 100, // Converter stars para número de vagas estimado
        growth: tech.growth,
        description: tech.description,
        category: tech.category
      }));
      console.log('✅ Usando dados do GitHub:', trendingTechnologies.length, 'tecnologias');
    }

    // Usar dados do Stack Overflow se GitHub falhar
    if (trendingTechnologies.length === 0 && stackOverflowTags.status === 'fulfilled' && stackOverflowTags.value.length > 0) {
      trendingTechnologies = stackOverflowTags.value.map(tag => ({
        name: tag.name.charAt(0).toUpperCase() + tag.name.slice(1),
        jobs: Math.floor(tag.count / 1000), // Converter contagem para vagas estimadas
        growth: tag.growth,
        description: tag.description,
        category: 'Development'
      }));
      console.log('✅ Usando dados do Stack Overflow:', trendingTechnologies.length, 'tecnologias');
    }

    // Usar dados de análise de mercado se disponível
    if (jobMarketData.status === 'fulfilled' && jobMarketData.value.length > 0) {
      trendingTechnologies = jobMarketData.value.map(profession => ({
        name: profession.technology,
        jobs: profession.jobCount,
        growth: profession.growth,
        description: `${profession.technology} - ${profession.category}`,
        category: profession.category
      }));
      console.log('✅ Usando dados de profissões em alta:', trendingTechnologies.length, 'profissões');
    }

    // Usar dados de salário reais se disponível
    if (salaryData.status === 'fulfilled' && salaryData.value.length > 0) {
      salaryRanges = salaryData.value.map(salary => ({
        ...salary,
        currency: 'BRL',
        experience: 'Júnior a Sênior'
      }));
      console.log('✅ Usando dados de salário reais:', salaryRanges.length, 'faixas');
    }

    // Fallback para dados estáticos se todas as fontes falharem
    if (trendingTechnologies.length === 0) {
      console.log('⚠️ Usando dados de fallback');
      trendingTechnologies = FALLBACK_DATA.trendingTechnologies.map(tech => ({
        ...tech,
        category: tech.description.split(' - ')[1] || 'Development'
      }));
    }

    if (salaryRanges.length === 0) {
      console.log('⚠️ Usando dados de salário de fallback');
      salaryRanges = FALLBACK_DATA.salaryRanges;
    }

    // Calcular insights do mercado
    const totalJobs = trendingTechnologies.reduce((sum, tech) => sum + tech.jobs, 0);
    const averageSalary = salaryRanges.length > 0 
      ? Math.floor(salaryRanges.reduce((sum, salary) => sum + salary.average, 0) / salaryRanges.length)
      : FALLBACK_DATA.marketInsights.averageSalary;

    const marketInsights = {
      totalJobs,
      averageSalary,
      remoteWorkPercentage: 68, // Baseado em pesquisas reais
      mostDemandedSkills: trendingTechnologies
        .sort((a, b) => b.jobs - a.jobs)
        .slice(0, 5)
        .map(tech => tech.name),
      fastestGrowing: trendingTechnologies
        .sort((a, b) => b.growth - a.growth)
        .slice(0, 5)
        .map(tech => tech.name),
      lastUpdated: new Date().toISOString()
    };

    console.log('📈 Insights calculados:', marketInsights);

    return NextResponse.json({
      success: true,
      data: {
        trendingTechnologies: trendingTechnologies.slice(0, 8), // Top 8
        salaryRanges: salaryRanges.slice(0, 8), // Top 8
        marketInsights
      },
      lastUpdated: new Date().toISOString(),
      sources: {
        github: githubTrending.status,
        stackOverflow: stackOverflowTags.status,
        jobMarket: jobMarketData.status,
        salary: salaryData.status
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados de inteligência de mercado:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar dados de mercado',
        data: FALLBACK_DATA // Fallback para dados estáticos
      },
      { status: 500 }
    );
  }
}
