'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, MapPin, Award, Users, TrendingUp, Plus, Edit3, X, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { useProfileData } from '@/hooks/useProfileData';

export const ExperienceTimeline: React.FC = () => {
  const { t } = useLanguage();
  const { isEditing, editingSection, startEditSection, stopEditSection } = useProfileEdit();
  const { profileData, hasExperience } = useProfileData();

  // Estados locais para edição
  const [editedExperiences, setEditedExperiences] = useState<Array<{ id: number; title: string; company: string; location: string; period: string; duration: string; type: string; description: string; achievements: string[]; technologies: string[]; current: boolean }>>([]);
  const [savedExperiences, setSavedExperiences] = useState<Array<{ id: number; title: string; company: string; location: string; period: string; duration: string; type: string; description: string; achievements: string[]; technologies: string[]; current: boolean }>>([]);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    period: '',
    duration: '',
    type: 'Tempo Integral',
    description: '',
    achievements: [''],
    technologies: [''],
    current: false
  });

  // Estados para educação
  const [editedEducation, setEditedEducation] = useState<Array<{ id: number; title: string; institution: string; period: string; description: string; achievements: string[] }>>([]);
  const [savedEducation, setSavedEducation] = useState<Array<{ id: number; title: string; institution: string; period: string; description: string; achievements: string[] }>>([]);
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
  const [showAddEducationForm, setShowAddEducationForm] = useState(false);
  const [newEducation, setNewEducation] = useState({
    title: '',
    institution: '',
    period: '',
    description: '',
    achievements: ['']
  });

  // Estados para certificações
  const [editedCertifications, setEditedCertifications] = useState<Array<{ id: number; title: string; issuer: string; date: string; credential: string }>>([]);
  const [savedCertifications, setSavedCertifications] = useState<Array<{ id: number; title: string; issuer: string; date: string; credential: string }>>([]);
  const [editingCertificationId, setEditingCertificationId] = useState<number | null>(null);
  const [showAddCertificationForm, setShowAddCertificationForm] = useState(false);
  const [newCertification, setNewCertification] = useState({
    title: '',
    issuer: '',
    date: '',
    credential: ''
  });

  // Dados mock para demonstração
  const mockExperiences = [
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

  // Dados mock para educação
  const mockEducation = [
    {
      id: 1,
      title: "Bacharelado em Ciência da Computação",
      institution: "Universidade de São Paulo (USP)",
      period: "2014 - 2018",
      description: "Formação sólida em fundamentos da computação, algoritmos, estruturas de dados e engenharia de software.",
      achievements: ["TCC com nota máxima", "Monitor de disciplinas", "Participação em projetos de pesquisa"]
    }
  ];

  // Dados mock para certificações
  const mockCertifications = [
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

  // Carregar dados salvos do localStorage
  useEffect(() => {
    // Carregar experiências
    const savedExp = localStorage.getItem('experienceData');
    if (savedExp) {
      try {
        const parsedData = JSON.parse(savedExp);
        setSavedExperiences(parsedData);
        setEditedExperiences(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados de experiência:', error);
      }
    } else {
      setEditedExperiences(mockExperiences);
    }

    // Carregar educação
    const savedEdu = localStorage.getItem('educationData');
    if (savedEdu) {
      try {
        const parsedData = JSON.parse(savedEdu);
        setSavedEducation(parsedData);
        setEditedEducation(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados de educação:', error);
      }
    } else {
      setEditedEducation(mockEducation);
    }

    // Carregar certificações
    const savedCert = localStorage.getItem('certificationsData');
    if (savedCert) {
      try {
        const parsedData = JSON.parse(savedCert);
        setSavedCertifications(parsedData);
        setEditedCertifications(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados de certificações:', error);
      }
    } else {
      setEditedCertifications(mockCertifications);
    }
  }, []);

  // Use dados editados se disponíveis, senão use dados do perfil ou mock
  const experiences = editedExperiences.length > 0 ? editedExperiences : (profileData?.experience || mockExperiences);
  const education = editedEducation.length > 0 ? editedEducation : (profileData?.education || mockEducation);
  const certifications = editedCertifications.length > 0 ? editedCertifications : (profileData?.certifications || mockCertifications);

  // Funções de gerenciamento de dados
  const saveAllData = () => {
    try {
      // Salvar experiências
      localStorage.setItem('experienceData', JSON.stringify(editedExperiences));
      setSavedExperiences(editedExperiences);
      
      // Salvar educação
      localStorage.setItem('educationData', JSON.stringify(editedEducation));
      setSavedEducation(editedEducation);
      
      // Salvar certificações
      localStorage.setItem('certificationsData', JSON.stringify(editedCertifications));
      setSavedCertifications(editedCertifications);
      
      // Resetar estados de edição
      setEditingExperienceId(null);
      setEditingEducationId(null);
      setEditingCertificationId(null);
      setShowAddForm(false);
      setShowAddEducationForm(false);
      setShowAddCertificationForm(false);
      
      console.log('Todos os dados salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };


  // Funções para experiências
  const startEditExperience = (id: number) => {
    setEditingExperienceId(id);
  };

  // Funções para educação
  const startEditEducation = (id: number) => {
    setEditingEducationId(id);
  };

  const updateEducation = (id: number, field: string, value: string | string[]) => {                                                                                                        
    setEditedEducation(prev => 
      prev.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const addEducationAchievement = (id: number) => {
    const edu = education.find(e => e.id === id);
    if (edu) {
      updateEducation(id, 'achievements', [...edu.achievements, '']);
    }
  };

  const removeEducationAchievement = (id: number, index: number) => {
    const edu = education.find(e => e.id === id);
    if (edu) {
      const newAchievements = edu.achievements.filter((_: string, i: number) => i !== index);
      updateEducation(id, 'achievements', newAchievements);
    }
  };

  const updateEducationAchievement = (id: number, index: number, value: string) => {
    const edu = education.find(e => e.id === id);
    if (edu) {
      const newAchievements = [...edu.achievements];
      newAchievements[index] = value;
      updateEducation(id, 'achievements', newAchievements);
    }
  };

  const removeEducation = (id: number) => {
    setEditedEducation(prev => prev.filter(edu => edu.id !== id));
  };

  const addNewEducation = () => {
    const newId = Math.max(...editedEducation.map(e => e.id), 0) + 1;
    const educationToAdd = {
      ...newEducation,
      id: newId
    };
    setEditedEducation(prev => [educationToAdd, ...prev]);
    setShowAddEducationForm(false);
    setNewEducation({
      title: '',
      institution: '',
      period: '',
      description: '',
      achievements: ['']
    });
  };

  // Funções para certificações
  const startEditCertification = (id: number) => {
    setEditingCertificationId(id);
  };

  const updateCertification = (id: number, field: string, value: string | string[]) => {
    setEditedCertifications(prev => 
      prev.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );
  };

  const removeCertification = (id: number) => {
    setEditedCertifications(prev => prev.filter(cert => cert.id !== id));
  };

  const addNewCertification = () => {
    const newId = Math.max(...editedCertifications.map(c => c.id), 0) + 1;
    const certificationToAdd = {
      ...newCertification,
      id: newId
    };
    setEditedCertifications(prev => [certificationToAdd, ...prev]);
    setShowAddCertificationForm(false);
    setNewCertification({
      title: '',
      issuer: '',
      date: '',
      credential: ''
    });
  };

  const updateExperience = (id: number, field: string, value: string | string[]) => {
    setEditedExperiences(prev => 
      prev.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const addAchievement = (id: number) => {
    updateExperience(id, 'achievements', [...experiences.find(e => e.id === id)?.achievements || [], '']);
  };

  const removeAchievement = (id: number, index: number) => {
    const exp = experiences.find(e => e.id === id);
    if (exp) {
      const newAchievements = exp.achievements.filter((_: string, i: number) => i !== index);
      updateExperience(id, 'achievements', newAchievements);
    }
  };

  const updateAchievement = (id: number, index: number, value: string) => {
    const exp = experiences.find(e => e.id === id);
    if (exp) {
      const newAchievements = [...exp.achievements];
      newAchievements[index] = value;
      updateExperience(id, 'achievements', newAchievements);
    }
  };

  const addTechnology = (id: number) => {
    updateExperience(id, 'technologies', [...experiences.find(e => e.id === id)?.technologies || [], '']);
  };

  const removeTechnology = (id: number, index: number) => {
    const exp = experiences.find(e => e.id === id);
    if (exp) {
      const newTechnologies = exp.technologies.filter((_: string, i: number) => i !== index);
      updateExperience(id, 'technologies', newTechnologies);
    }
  };

  const updateTechnology = (id: number, index: number, value: string) => {
    const exp = experiences.find(e => e.id === id);
    if (exp) {
      const newTechnologies = [...exp.technologies];
      newTechnologies[index] = value;
      updateExperience(id, 'technologies', newTechnologies);
    }
  };

  const removeExperience = (id: number) => {
    setEditedExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  const addNewExperience = () => {
    const newId = Math.max(...editedExperiences.map(e => e.id), 0) + 1;
    const experienceToAdd = {
      ...newExperience,
      id: newId
    };
    setEditedExperiences(prev => [experienceToAdd, ...prev]);
    setShowAddForm(false);
    setNewExperience({
      title: '',
      company: '',
      location: '',
      period: '',
      duration: '',
      type: 'Tempo Integral',
      description: '',
      achievements: [''],
      technologies: [''],
      current: false
    });
  };



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
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  onClick={saveAllData}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </>
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
        {/* Formulário para adicionar nova experiência */}
        {showAddForm && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Adicionar Nova Experiência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                value={newExperience.title}
                onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Cargo/Título"
                className="border-gray-300 dark:border-gray-600"
              />
              <Input
                value={newExperience.company}
                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Empresa"
                className="border-gray-300 dark:border-gray-600"
              />
              <Input
                value={newExperience.location}
                onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Localização"
                className="border-gray-300 dark:border-gray-600"
              />
              <Input
                value={newExperience.period}
                onChange={(e) => setNewExperience(prev => ({ ...prev, period: e.target.value }))}
                placeholder="Período (ex: Jan 2022 - Presente)"
                className="border-gray-300 dark:border-gray-600"
              />
              <Input
                value={newExperience.duration}
                onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Duração (ex: 2+ anos)"
                className="border-gray-300 dark:border-gray-600"
              />
              <Input
                value={newExperience.type}
                onChange={(e) => setNewExperience(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Tipo de trabalho"
                className="border-gray-300 dark:border-gray-600"
              />
            </div>
            <Textarea
              value={newExperience.description}
              onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da experiência..."
              className="mb-4 border-gray-300 dark:border-gray-600"
              rows={3}
            />
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="current"
                checked={newExperience.current}
                onChange={(e) => setNewExperience(prev => ({ ...prev, current: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="current" className="text-sm text-gray-600 dark:text-gray-400">
                Trabalho atual
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={addNewExperience} className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

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
                    <div className="flex-1">
                      {editingExperienceId === exp.id ? (
                        <div className="space-y-3">
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                            placeholder="Cargo/Título"
                            className="text-lg font-semibold border-gray-300 dark:border-gray-600"
                          />
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Empresa"
                            className="text-purple-600 font-medium border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {exp.title}
                          </h3>
                          <p className="text-purple-600 font-medium">
                            {exp.company}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 lg:mt-0">
                      {editingExperienceId === exp.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingExperienceId(null)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          {exp.current && (
                            <Badge className="bg-green-500 text-white">
                              Atual
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {exp.duration}
                          </Badge>
                          {editingSection === 'experience' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditExperience(exp.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {editingExperienceId === exp.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-500" />
                        <Input
                          value={exp.period}
                          onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                          placeholder="Período"
                          className="h-8 text-sm border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-500" />
                        <Input
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          placeholder="Localização"
                          className="h-8 text-sm border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-500" />
                        <Input
                          value={exp.type}
                          onChange={(e) => updateExperience(exp.id, 'type', e.target.value)}
                          placeholder="Tipo"
                          className="h-8 text-sm border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  ) : (
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
                  )}
                  
                  {editingExperienceId === exp.id ? (
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="Descrição da experiência..."
                      className="mb-4 border-gray-300 dark:border-gray-600"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  
                  {/* Conquistas */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                      <Award size={14} />
                      Principais Conquistas:
                      {editingExperienceId === exp.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addAchievement(exp.id)}
                          className="h-6 w-6 p-0 ml-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </h4>
                    {editingExperienceId === exp.id ? (
                      <div className="space-y-2">
                        {exp.achievements.map((achievement: string, achIndex: number) => (
                          <div key={achIndex} className="flex items-center gap-2">
                            <Input
                              value={achievement}
                              onChange={(e) => updateAchievement(exp.id, achIndex, e.target.value)}
                              placeholder="Conquista..."
                              className="flex-1 h-8 text-sm border-gray-300 dark:border-gray-600"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAchievement(exp.id, achIndex)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement: string, achIndex: number) => (
                          <li key={achIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Tecnologias */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tecnologias:</span>
                      {editingExperienceId === exp.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addTechnology(exp.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {editingExperienceId === exp.id ? (
                      <div className="space-y-2">
                        {exp.technologies.map((tech: string, techIndex: number) => (
                          <div key={techIndex} className="flex items-center gap-2">
                            <Input
                              value={tech}
                              onChange={(e) => updateTechnology(exp.id, techIndex, e.target.value)}
                              placeholder="Tecnologia..."
                              className="flex-1 h-8 text-sm border-gray-300 dark:border-gray-600"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeTechnology(exp.id, techIndex)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech: string, techIndex: number) => (
                          <Badge key={techIndex} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Educação */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Formação Acadêmica
            </h3>
            {editingSection === 'experience' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddEducationForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>

          {/* Formulário para adicionar nova educação */}
          {showAddEducationForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Adicionar Nova Formação
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  value={newEducation.title}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Curso/Graduação"
                  className="border-gray-300 dark:border-gray-600"
                />
                <Input
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="Instituição"
                  className="border-gray-300 dark:border-gray-600"
                />
                <Input
                  value={newEducation.period}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, period: e.target.value }))}
                  placeholder="Período (ex: 2014 - 2018)"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
              <Textarea
                value={newEducation.description}
                onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da formação..."
                className="mb-3 border-gray-300 dark:border-gray-600"
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={addNewEducation} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
                <Button onClick={() => setShowAddEducationForm(false)} variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {editingEducationId === edu.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={edu.title}
                        onChange={(e) => updateEducation(edu.id, 'title', e.target.value)}
                        placeholder="Curso/Graduação"
                        className="border-gray-300 dark:border-gray-600"
                      />
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="Instituição"
                        className="border-gray-300 dark:border-gray-600"
                      />
                      <Input
                        value={edu.period}
                        onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                        placeholder="Período"
                        className="border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <Textarea
                      value={edu.description}
                      onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                      placeholder="Descrição da formação..."
                      className="border-gray-300 dark:border-gray-600"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conquistas:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addEducationAchievement(edu.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {edu.achievements.map((achievement: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={achievement}
                            onChange={(e) => updateEducationAchievement(edu.id, index, e.target.value)}
                            placeholder="Conquista..."
                            className="flex-1 h-8 text-sm border-gray-300 dark:border-gray-600"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEducationAchievement(edu.id, index)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingEducationId(null)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeEducation(edu.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                          {edu.achievements.map((achievement: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {editingSection === 'experience' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditEducation(edu.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Certificações */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Certificações
            </h3>
            {editingSection === 'experience' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddCertificationForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>

          {/* Formulário para adicionar nova certificação */}
          {showAddCertificationForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Adicionar Nova Certificação
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  value={newCertification.title}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nome da Certificação"
                  className="border-gray-300 dark:border-gray-600"
                />
                <Input
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                  placeholder="Emissor"
                  className="border-gray-300 dark:border-gray-600"
                />
                <Input
                  value={newCertification.date}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="Data (ex: 2023)"
                  className="border-gray-300 dark:border-gray-600"
                />
                <Input
                  value={newCertification.credential}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, credential: e.target.value }))}
                  placeholder="ID/Credencial"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addNewCertification} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
                <Button onClick={() => setShowAddCertificationForm(false)} variant="outline">
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                {editingCertificationId === cert.id ? (
                  <div className="space-y-3">
                    <Input
                      value={cert.title}
                      onChange={(e) => updateCertification(cert.id, 'title', e.target.value)}
                      placeholder="Nome da Certificação"
                      className="border-gray-300 dark:border-gray-600"
                    />
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                      placeholder="Emissor"
                      className="border-gray-300 dark:border-gray-600"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={cert.date}
                        onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                        placeholder="Data"
                        className="border-gray-300 dark:border-gray-600"
                      />
                      <Input
                        value={cert.credential}
                        onChange={(e) => updateCertification(cert.id, 'credential', e.target.value)}
                        placeholder="ID"
                        className="border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingCertificationId(null)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCertification(cert.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                      {editingSection === 'experience' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditCertification(cert.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
