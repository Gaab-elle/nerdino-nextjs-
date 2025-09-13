'use client';

import { useState, useEffect } from 'react';

interface PersonalProgressData {
  applications: number;
  responseRate: number;
  interviews: number;
  offers: number;
  profileCompleteness: number;
  skillMatchRate: number;
  marketDemand: number;
}

interface UserProfile {
  skills: string[];
  experience: string;
  location: string;
  available: boolean;
}

export const usePersonalProgress = (userProfile: UserProfile) => {
  const [progressData, setProgressData] = useState<PersonalProgressData>({
    applications: 0,
    responseRate: 0,
    interviews: 0,
    offers: 0,
    profileCompleteness: 0,
    skillMatchRate: 0,
    marketDemand: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateProgress = async () => {
      try {
        setLoading(true);

        // 1. Calcular completude do perfil
        const profileCompleteness = calculateProfileCompleteness(userProfile);
        
        // 2. Calcular taxa de match de habilidades
        const skillMatchRate = await calculateSkillMatchRate(userProfile.skills);
        
        // 3. Calcular demanda de mercado
        const marketDemand = await calculateMarketDemand(userProfile);
        
        // 4. Calcular estatísticas baseadas no perfil
        const stats = calculateStatsFromProfile(userProfile, profileCompleteness, skillMatchRate, marketDemand);

        setProgressData(stats);
      } catch (error) {
        console.error('Erro ao calcular progresso pessoal:', error);
        // Fallback para dados padrão
        setProgressData({
          applications: 0,
          responseRate: 0,
          interviews: 0,
          offers: 0,
          profileCompleteness: 0,
          skillMatchRate: 0,
          marketDemand: 0
        });
      } finally {
        setLoading(false);
      }
    };

    calculateProgress();
  }, [userProfile]);

  return { progressData, loading };
};

// Função para calcular completude do perfil
const calculateProfileCompleteness = (userProfile: UserProfile): number => {
  let completeness = 0;
  
  // Skills (40% do peso)
  if (userProfile.skills && userProfile.skills.length > 0) {
    completeness += Math.min(userProfile.skills.length * 8, 40); // Max 40%
  }
  
  // Experience (30% do peso)
  if (userProfile.experience && userProfile.experience.trim() !== '') {
    completeness += 30;
  }
  
  // Location (20% do peso)
  if (userProfile.location && userProfile.location.trim() !== '') {
    completeness += 20;
  }
  
  // Availability (10% do peso)
  if (userProfile.available !== undefined) {
    completeness += 10;
  }
  
  return Math.min(completeness, 100);
};

// Função para calcular taxa de match de habilidades
const calculateSkillMatchRate = async (skills: string[]): Promise<number> => {
  if (!skills || skills.length === 0) return 0;
  
  try {
    // Buscar dados de mercado para calcular match
    const response = await fetch('/api/market-intelligence');
    const data = await response.json();
    
    if (data.success && data.data.trendingTechnologies) {
      const trendingTechs = data.data.trendingTechnologies.map((tech: { name: string; count: number }) => 
        tech.name.toLowerCase()
      );
      
      const userSkillsLower = skills.map(skill => skill.toLowerCase());
      const matches = userSkillsLower.filter(skill => 
        trendingTechs.some((tech: string) => 
          tech.includes(skill) || skill.includes(tech)
        )
      );
      
      return Math.round((matches.length / skills.length) * 100);
    }
  } catch (error) {
    console.error('Erro ao calcular match de habilidades:', error);
  }
  
  // Fallback baseado no número de skills
  return Math.min(skills.length * 15, 100);
};

// Função para calcular demanda de mercado
const calculateMarketDemand = async (userProfile: UserProfile): Promise<number> => {
  try {
    // Buscar vagas compatíveis
    const response = await fetch('/api/opportunities/fetch?source=infojobs&page=0');
    const data = await response.json();
    
    if (data.success && data.data) {
      const totalJobs = data.data.length;
      const compatibleJobs = data.data.filter((job: { technologies: string[]; requirements: string }) => {
        if (!userProfile.skills || userProfile.skills.length === 0) return false;
        
        const jobTechs = job.technologies || [];
        const userSkillsLower = userProfile.skills.map(skill => skill.toLowerCase());
        const jobTechsLower = jobTechs.map((tech: string) => tech.toLowerCase());
        
        return userSkillsLower.some(skill => 
          jobTechsLower.some(tech => 
            tech.includes(skill) || skill.includes(tech)
          )
        );
      });
      
      return Math.round((compatibleJobs.length / totalJobs) * 100);
    }
  } catch (error) {
    console.error('Erro ao calcular demanda de mercado:', error);
  }
  
  return 0;
};

// Função para calcular estatísticas baseadas no perfil
const calculateStatsFromProfile = (
  userProfile: UserProfile, 
  profileCompleteness: number, 
  skillMatchRate: number, 
  marketDemand: number
): PersonalProgressData => {
  
  // Aplicações: baseado na completude do perfil e skills
  const applications = Math.round(
    (profileCompleteness / 100) * 15 + // Max 15 aplicações
    (userProfile.skills?.length || 0) * 2 // +2 por skill
  );
  
  // Taxa de resposta: baseada no match de habilidades e completude
  const responseRate = Math.round(
    (skillMatchRate * 0.4) + // 40% do match de skills
    (profileCompleteness * 0.3) + // 30% da completude
    (marketDemand * 0.3) // 30% da demanda de mercado
  );
  
  // Entrevistas: baseado na taxa de resposta
  const interviews = Math.round((responseRate / 100) * 5); // Max 5 entrevistas
  
  // Ofertas: baseado nas entrevistas
  const offers = Math.round((interviews * 0.3)); // 30% das entrevistas viram ofertas
  
  return {
    applications: Math.max(applications, 0),
    responseRate: Math.min(Math.max(responseRate, 0), 100),
    interviews: Math.max(interviews, 0),
    offers: Math.max(offers, 0),
    profileCompleteness,
    skillMatchRate,
    marketDemand
  };
};
