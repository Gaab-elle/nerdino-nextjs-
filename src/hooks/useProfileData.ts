'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface ExperienceData {
  id: number;
  title: string;
  company: string;
  location: string;
  period: string;
  duration: string;
  type: string;
  description: string;
  achievements: string[];
  technologies: string[];
  current: boolean;
}

export interface EducationData {
  id: number;
  title: string;
  institution: string;
  period: string;
  description: string;
  achievements: string[];
}

export interface CertificationData {
  id: number;
  title: string;
  issuer: string;
  date: string;
  credential: string;
}

export interface PersonalInfoData {
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  interests?: string[];
  values?: string[];
}

export interface ProfileData {
  personalInfo: PersonalInfoData;
  experience: ExperienceData[];
  education: EducationData[];
  certifications: CertificationData[];
}

// Mock data as examples
const mockProfileData: ProfileData = {
  personalInfo: {
    bio: "Desenvolvedor apaixonado por tecnologia e inovação. Especialista em criar soluções escaláveis e eficientes que impactam positivamente a vida das pessoas.",
    location: "São Paulo, SP",
    website: "https://gabriel.dev",
    phone: "+55 11 99999-9999",
    interests: ["Open Source", "Mentoria", "Arquitetura de Software", "Comunidade Tech"],
    values: ["Código limpo e bem documentado", "Colaboração e trabalho em equipe", "Aprendizado contínuo", "Impacto social através da tecnologia"]
  },
  experience: [
    {
      id: 1,
      title: "Tech Lead & Senior Full Stack Developer",
      company: "TechCorp Solutions",
      location: "São Paulo, SP",
      period: "Jan 2022 - Presente",
      duration: "2+ anos",
      type: "Tempo Integral",
      description: "Lidero uma equipe de 8 desenvolvedores na criação de soluções escaláveis para clientes enterprise. Responsável pela arquitetura de sistemas, mentoria técnica e tomada de decisões estratégicas.",
      achievements: [
        "Liderança de equipe que entregou 15+ projetos com 99.9% de uptime",
        "Implementação de arquitetura de microserviços que reduziu custos em 40%",
        "Mentoria de 5 desenvolvedores júnior que foram promovidos",
        "Criação de padrões de código que aumentaram produtividade em 60%"
      ],
      technologies: ["React", "Node.js", "AWS", "Kubernetes", "PostgreSQL", "Docker"],
      current: true
    },
    {
      id: 2,
      title: "Senior Full Stack Developer",
      company: "InnovateTech",
      location: "São Paulo, SP",
      period: "Mar 2020 - Dez 2021",
      duration: "1 ano 10 meses",
      type: "Tempo Integral",
      description: "Desenvolvimento de aplicações web e mobile para startups em crescimento. Trabalhei com tecnologias modernas e metodologias ágeis.",
      achievements: [
        "Desenvolvimento de 8 aplicações web responsivas",
        "Implementação de CI/CD que reduziu tempo de deploy em 70%",
        "Contribuição para 3 projetos open source",
        "Mentoria de 2 desenvolvedores júnior"
      ],
      technologies: ["Vue.js", "Laravel", "MySQL", "Docker", "GitLab CI"],
      current: false
    }
  ],
  education: [
    {
      id: 1,
      title: "Bacharelado em Ciência da Computação",
      institution: "Universidade de São Paulo (USP)",
      period: "2014 - 2018",
      description: "Formação sólida em fundamentos da computação, algoritmos, estruturas de dados e engenharia de software.",
      achievements: ["TCC com nota máxima", "Monitor de disciplinas", "Participação em projetos de pesquisa"]
    }
  ],
  certifications: [
    {
      id: 1,
      title: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      credential: "AWS-SAA-2023"
    },
    {
      id: 2,
      title: "Google Cloud Professional Developer",
      issuer: "Google Cloud",
      date: "2022",
      credential: "GCP-PD-2022"
    },
    {
      id: 3,
      title: "Certified Kubernetes Administrator",
      issuer: "Cloud Native Computing Foundation",
      date: "2022",
      credential: "CKA-2022"
    }
  ]
};

export const useProfileData = () => {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      // In a real app, this would fetch from the database
      // For now, we'll use mock data as examples
      setProfileData(mockProfileData);
      setLoading(false);
    }
  }, [session]);

  const updateProfileData = (newData: Partial<ProfileData>) => {
    setProfileData(prev => prev ? { ...prev, ...newData } : null);
  };

  const hasPersonalData = () => {
    if (!profileData) return false;
    
    return !!(
      profileData.personalInfo.bio ||
      profileData.personalInfo.location ||
      profileData.personalInfo.website ||
      profileData.personalInfo.phone ||
      profileData.personalInfo.interests?.length ||
      profileData.personalInfo.values?.length
    );
  };

  const hasExperience = () => {
    return profileData?.experience && profileData.experience.length > 0;
  };

  const hasEducation = () => {
    return profileData?.education && profileData.education.length > 0;
  };

  const hasCertifications = () => {
    return profileData?.certifications && profileData.certifications.length > 0;
  };

  return {
    profileData,
    loading,
    updateProfileData,
    hasPersonalData,
    hasExperience,
    hasEducation,
    hasCertifications
  };
};
