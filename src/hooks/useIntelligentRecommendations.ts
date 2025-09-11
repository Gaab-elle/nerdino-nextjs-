'use client';

import { useState, useEffect } from 'react';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  impact: string;
  type: 'skill' | 'profile' | 'certification';
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface UserProfile {
  skills: string[];
  experience: string;
  location: string;
  available: boolean;
}

interface MarketData {
  trendingTechnologies: Array<{
    name: string;
    jobs: number;
    growth: number;
    description: string;
    category: string;
  }>;
  salaryRanges: Array<{
    role: string;
    min: number;
    max: number;
  }>;
}

export const useIntelligentRecommendations = (userProfile: UserProfile) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRecommendations = async () => {
      try {
        setLoading(true);

        // Buscar dados de inteligência de mercado
        const response = await fetch('/api/market-intelligence');
        const marketData: MarketData = await response.json();

        if (marketData.success) {
          const intelligentRecs = generateIntelligentRecommendations(userProfile, marketData.data);
          setRecommendations(intelligentRecs);
        } else {
          // Fallback para recomendações padrão
          setRecommendations(getDefaultRecommendations());
        }
      } catch (error) {
        console.error('Erro ao gerar recomendações inteligentes:', error);
        setRecommendations(getDefaultRecommendations());
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [userProfile]);

  return { recommendations, loading };
};

// Função para gerar recomendações baseadas na inteligência de mercado
const generateIntelligentRecommendations = (userProfile: UserProfile, marketData: MarketData): Recommendation[] => {
  const recs: Recommendation[] = [];
  const userSkills = userProfile.skills.map(skill => skill.toLowerCase());

  // 1. Recomendações baseadas em profissões em alta
  marketData.trendingTechnologies.slice(0, 3).forEach((profession, index) => {
    const professionName = profession.name.toLowerCase();
    
    // Verificar se o usuário já tem skills relacionadas
    const hasRelatedSkills = userSkills.some(skill => 
      professionName.includes(skill) || 
      skill.includes(professionName) ||
      getRelatedSkills(professionName).some(relatedSkill => 
        userSkills.includes(relatedSkill)
      )
    );

    if (!hasRelatedSkills) {
      const impact = calculateImpact(profession.growth, profession.jobs);
      recs.push({
        id: index + 1,
        title: `Aprenda ${profession.name}`,
        description: `Aumente suas chances em ${impact}% - ${profession.jobs} vagas disponíveis`,
        impact: `+${impact}%`,
        type: 'skill',
        category: profession.category,
        priority: impact > 20 ? 'high' : impact > 10 ? 'medium' : 'low'
      });
    }
  });

  // 2. Recomendação de certificação baseada na profissão mais em alta
  if (marketData.trendingTechnologies.length > 0) {
    const topProfession = marketData.trendingTechnologies[0];
    const certification = getCertificationForProfession(topProfession.name);
    
    if (certification) {
      recs.push({
        id: recs.length + 1,
        title: `Certificação ${certification.name}`,
        description: `Aumente suas chances em 25% - Diferencial competitivo`,
        impact: '+25%',
        type: 'certification',
        category: 'certification',
        priority: 'high'
      });
    }
  }

  // 3. Recomendação de atualização de perfil baseada na completude
  const profileCompleteness = calculateProfileCompleteness(userProfile);
  if (profileCompleteness < 80) {
    recs.push({
      id: recs.length + 1,
      title: 'Atualize seu perfil',
      description: `Aumente suas chances em 15% - Perfil ${profileCompleteness}% completo`,
      impact: '+15%',
      type: 'profile',
      category: 'profile',
      priority: 'medium'
    });
  }

  // Ordenar por prioridade e impacto
  return recs
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return parseInt(b.impact.replace('+', '').replace('%', '')) - parseInt(a.impact.replace('+', '').replace('%', ''));
    })
    .slice(0, 3); // Limitar a 3 recomendações
};

// Função para calcular impacto baseado em crescimento e número de vagas
const calculateImpact = (growth: number, jobs: number): number => {
  const growthImpact = Math.min(growth, 30); // Max 30% do crescimento
  const jobsImpact = Math.min(jobs / 10, 20); // Max 20% baseado em vagas
  return Math.round(growthImpact + jobsImpact);
};

// Função para obter skills relacionadas a uma profissão
const getRelatedSkills = (profession: string): string[] => {
  const skillMap: { [key: string]: string[] } = {
    'blockchain': ['solidity', 'web3', 'ethereum', 'smart contracts'],
    'ai/ml': ['python', 'tensorflow', 'pytorch', 'machine learning', 'deep learning'],
    'data scientist': ['python', 'r', 'sql', 'statistics', 'machine learning'],
    'cybersecurity': ['security', 'penetration testing', 'network security', 'ethical hacking'],
    'devops': ['docker', 'kubernetes', 'aws', 'azure', 'ci/cd'],
    'cloud architect': ['aws', 'azure', 'gcp', 'cloud', 'infrastructure'],
    'product manager': ['agile', 'scrum', 'product strategy', 'user research'],
    'tech lead': ['leadership', 'architecture', 'mentoring', 'team management']
  };

  for (const [key, skills] of Object.entries(skillMap)) {
    if (profession.includes(key)) {
      return skills;
    }
  }
  return [];
};

// Função para obter certificação recomendada para uma profissão
const getCertificationForProfession = (profession: string): { name: string } | null => {
  const certificationMap: { [key: string]: string } = {
    'blockchain': 'Blockchain Developer',
    'ai/ml': 'AWS Machine Learning',
    'data scientist': 'Google Data Analytics',
    'cybersecurity': 'CISSP',
    'devops': 'AWS DevOps Engineer',
    'cloud architect': 'AWS Solutions Architect',
    'product manager': 'Google Product Management',
    'tech lead': 'AWS Solutions Architect'
  };

  for (const [key, cert] of Object.entries(certificationMap)) {
    if (profession.toLowerCase().includes(key)) {
      return { name: cert };
    }
  }
  return null;
};

// Função para calcular completude do perfil
const calculateProfileCompleteness = (userProfile: UserProfile): number => {
  let completeness = 0;
  
  if (userProfile.skills && userProfile.skills.length > 0) {
    completeness += Math.min(userProfile.skills.length * 15, 60);
  }
  
  if (userProfile.experience && userProfile.experience.trim() !== '') {
    completeness += 25;
  }
  
  if (userProfile.location && userProfile.location.trim() !== '') {
    completeness += 15;
  }
  
  return Math.min(completeness, 100);
};

// Recomendações padrão como fallback
const getDefaultRecommendations = (): Recommendation[] => [
  {
    id: 1,
    title: 'Aprenda Python',
    description: 'Aumente suas chances em 20% - Linguagem em alta demanda',
    impact: '+20%',
    type: 'skill',
    category: 'programming',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Certificação AWS',
    description: 'Aumente suas chances em 25% - Cloud computing essencial',
    impact: '+25%',
    type: 'certification',
    category: 'cloud',
    priority: 'high'
  },
  {
    id: 3,
    title: 'Atualize seu perfil',
    description: 'Aumente suas chances em 10% - Perfil mais completo',
    impact: '+10%',
    type: 'profile',
    category: 'profile',
    priority: 'medium'
  }
];
