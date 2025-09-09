'use client';

import React from 'react';
import { Briefcase, Calendar, MapPin, Award, Users, TrendingUp, Plus, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { useProfileData } from '@/hooks/useProfileData';

export const ExperienceTimeline: React.FC = () => {
  const { t } = useLanguage();
  const { isEditing, editingSection, startEditSection, stopEditSection } = useProfileEdit();
  const { profileData, hasExperience } = useProfileData();

  // Use real data if available, otherwise use mock data for editing
  const experiences = profileData?.experience || [
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
      company: "InnovateLab",
      location: "São Paulo, SP",
      period: "Mar 2020 - Dez 2021",
      duration: "1 ano 10 meses",
      type: "Tempo Integral",
      description: "Desenvolvi aplicações web complexas e APIs robustas para startups em crescimento. Trabalhei diretamente com stakeholders para definir requisitos e entregar soluções técnicas.",
      achievements: [
        "Desenvolvimento de plataforma que processa 1M+ transações/mês",
        "Implementação de testes automatizados que reduziram bugs em 70%",
        "Otimização de performance que melhorou tempo de resposta em 50%",
        "Contribuição para 3 projetos open source com 500+ stars"
      ],
      technologies: ["Vue.js", "Python", "FastAPI", "MongoDB", "Redis", "Docker"],
      current: false
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Digital Agency Pro",
      location: "Rio de Janeiro, RJ",
      period: "Jun 2019 - Fev 2020",
      duration: "8 meses",
      type: "Tempo Integral",
      description: "Criação de sites e aplicações web para clientes diversos. Trabalhei em projetos de e-commerce, dashboards administrativos e landing pages responsivas.",
      achievements: [
        "Desenvolvimento de 20+ projetos para clientes de diversos setores",
        "Implementação de SEO que aumentou tráfego orgânico em 200%",
        "Criação de sistema de CMS personalizado",
        "Mentoria de 2 desenvolvedores júnior"
      ],
      technologies: ["React", "Laravel", "MySQL", "Bootstrap", "jQuery"],
      current: false
    },
    {
      id: 4,
      title: "Frontend Developer",
      company: "StartupTech",
      location: "São Paulo, SP",
      period: "Jan 2018 - Mai 2019",
      duration: "1 ano 5 meses",
      type: "Tempo Integral",
      description: "Primeira experiência profissional focada no desenvolvimento frontend. Trabalhei em uma startup em crescimento, aprendendo sobre desenvolvimento ágil e colaboração em equipe.",
      achievements: [
        "Desenvolvimento de interface responsiva para aplicação mobile",
        "Implementação de PWA que aumentou engajamento em 150%",
        "Participação em 3 hackathons com projetos vencedores",
        "Contribuição para documentação técnica da equipe"
      ],
      technologies: ["React", "JavaScript", "CSS3", "HTML5", "Git"],
      current: false
    }
  ];

  const education = profileData?.education || [
    {
      id: 1,
      title: "Bacharelado em Ciência da Computação",
      institution: "Universidade de São Paulo (USP)",
      period: "2014 - 2018",
      description: "Formação sólida em fundamentos da computação, algoritmos, estruturas de dados e engenharia de software.",
      achievements: ["TCC com nota máxima", "Monitor de disciplinas", "Participação em projetos de pesquisa"]
    }
  ];

  const certifications = profileData?.certifications || [
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
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            Experiência Profissional
            {editingSection === 'experience' && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Editando
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editingSection === 'experience' && (
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editingSection === 'experience' ? stopEditSection() : startEditSection('experience')}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Timeline de Experiência */}
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="relative">
              {/* Linha da timeline */}
              {index < experiences.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
              )}
              
              <div className="flex gap-4">
                {/* Ícone */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  exp.current 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <Briefcase size={20} />
                </div>
                
                {/* Conteúdo */}
                <div className="flex-1 pb-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {exp.title}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {exp.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 lg:mt-0">
                      {exp.current && (
                        <Badge className="bg-green-500 text-white">
                          Atual
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {exp.duration}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{exp.period}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{exp.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{exp.type}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {exp.description}
                  </p>
                  
                  {/* Conquistas */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                      <Award size={14} />
                      Principais Conquistas:
                    </h4>
                    <ul className="space-y-1">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Tecnologias */}
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Educação */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Formação Acadêmica
          </h3>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {edu.title}
                </h4>
                <p className="text-purple-600 font-medium mb-2">
                  {edu.institution}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {edu.period}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {edu.description}
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400">
                  {edu.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Certificações */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Certificações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {cert.title}
                </h4>
                <p className="text-purple-600 text-sm mb-2">
                  {cert.issuer}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {cert.date} • {cert.credential}
                </p>
                <Badge variant="outline" className="text-xs">
                  Verificado
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
