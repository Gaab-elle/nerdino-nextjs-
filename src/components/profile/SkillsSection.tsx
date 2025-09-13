'use client';

import React, { useState, useEffect } from 'react';
import { Code, Database, Cloud, Palette, Smartphone, Globe, Edit3, Save, X, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';
import { useProfileEdit } from '@/contexts/ProfileEditContext';

export const SkillsSection: React.FC = () => {
  const { t } = useLanguage();
  const { data: profileData } = useGitHubProfile();
  const { editingSection, startEditSection, stopEditSection } = useProfileEdit();

  // Estados para edição
  const [editedSkills, setEditedSkills] = useState<Array<{
    title: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    skills: Array<{name: string, level: string, years: string}>;
  }>>([]);
  const [savedSkills, setSavedSkills] = useState<Array<{
    title: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    skills: Array<{name: string, level: string, years: string}>;
  }> | null>(null);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner', years: '1+ anos', category: 'frontend' });

  // Função para obter o tipo do ícone baseado no título da categoria
  const getIconType = (title: string) => {
    switch (title.toLowerCase()) {
      case 'frontend':
        return 'palette';
      case 'backend':
        return 'database';
      case 'database':
        return 'database';
      case 'cloud & devops':
        return 'cloud';
      case 'mobile':
        return 'smartphone';
      case 'design':
        return 'palette';
      case 'outros':
        return 'code';
      default:
        return 'code';
    }
  };

  // Função para renderizar ícone baseado no tipo
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'palette':
        return <Palette className="h-5 w-5" />;
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'cloud':
        return <Cloud className="h-5 w-5" />;
      case 'smartphone':
        return <Smartphone className="h-5 w-5" />;
      case 'code':
        return <Code className="h-5 w-5" />;
      default:
        return <Code className="h-5 w-5" />;
    }
  };

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('skillsData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('📦 Loaded from localStorage:', parsed);
        console.log('📊 Is array?', Array.isArray(parsed));
        
        // Se não for um array, limpar e usar dados padrão
        if (!Array.isArray(parsed)) {
          console.log('🧹 Corrupted data detected, clearing localStorage');
          localStorage.removeItem('skillsData');
          setSavedSkills(null);
        } else {
          // Reconstruir ícones dos dados salvos
          const reconstructedData = parsed.map((category: { name: string; skills: string[]; iconType?: string; color?: string; bgColor?: string }) => ({
            title: category.name,
            icon: renderIcon(category.iconType || getIconType(category.name)),
            color: category.color || '#3B82F6',
            bgColor: category.bgColor || '#EFF6FF',
            skills: category.skills
          }));
          setSavedSkills(reconstructedData.map(cat => ({
            title: cat.title,
            icon: cat.icon,
            color: cat.color,
            bgColor: cat.bgColor,
            skills: cat.skills.map(skill => ({
              name: skill,
              level: 'Intermediário',
              years: '2-3 anos'
            }))
          })));
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados de habilidades:', error);
        localStorage.removeItem('skillsData');
        setSavedSkills(null);
      }
    }
  }, []);

  // Atualizar dados editados quando os dados originais mudarem
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { profileData, savedSkills });
    const defaultSkills = categorizeLanguages();
    console.log('📊 Default skills:', defaultSkills);
    if (savedSkills) {
      console.log('💾 Using saved skills:', savedSkills);
      setEditedSkills(savedSkills);
    } else {
      console.log('🆕 Using default skills:', defaultSkills);
      setEditedSkills(defaultSkills);
    }
  }, [profileData, savedSkills]);

  // Função para salvar dados de habilidades
  const saveSkillsData = () => {
    console.log('💾 Saving skills data:', editedSkills);
    if (!Array.isArray(editedSkills)) {
      console.error('❌ editedSkills is not an array when saving:', editedSkills);
      return;
    }
    
    // Garantir que é um array limpo, sem propriedades extras
    const dataToSave = editedSkills.map(category => ({
      title: category.title,
      iconType: getIconType(category.title), // Salvar tipo do ícone em vez do objeto React
      color: category.color,
      bgColor: category.bgColor,
      skills: category.skills
    }));

    try {
      localStorage.setItem('skillsData', JSON.stringify(dataToSave));
      setSavedSkills(editedSkills);
      stopEditSection();
      console.log('✅ Dados de habilidades salvos com sucesso:', dataToSave);
    } catch (error) {
      console.error('❌ Erro ao salvar dados de habilidades:', error);
    }
  };

  // Função para cancelar edição
  const cancelSkillsEdit = () => {
    if (savedSkills) {
      setEditedSkills(savedSkills);
    }
    stopEditSection();
  };

  // Funções para gerenciar habilidades
  const addSkill = () => {
    console.log('➕ addSkill called:', { newSkill, editedSkills });
    if (!Array.isArray(editedSkills) || !newSkill.name.trim()) {
      console.log('❌ Cannot add skill:', { isArray: Array.isArray(editedSkills), hasName: !!newSkill.name.trim() });
      return;
    }
    
    // Mapear valores do select para títulos das categorias
    const categoryMapping: { [key: string]: string } = {
      'frontend': 'Frontend',
      'backend': 'Backend', 
      'database': 'Database',
      'other': 'Outros'
    };
    
    const categoryTitle = categoryMapping[newSkill.category] || newSkill.category;
    const categoryIndex = editedSkills.findIndex(cat => 
      cat.title.toLowerCase() === categoryTitle.toLowerCase()
    );
    
    console.log('🔍 Looking for category:', categoryTitle, 'Index found:', categoryIndex);
    
    if (categoryIndex !== -1) {
      const updatedSkills = [...editedSkills];
      updatedSkills[categoryIndex].skills.push({
        name: newSkill.name.trim(),
        level: newSkill.level,
        years: newSkill.years
      });
      setEditedSkills(updatedSkills);
      setNewSkill({ name: '', level: 'beginner', years: '1+ anos', category: 'frontend' });
      console.log('✅ Skill added successfully');
    } else {
      console.log('❌ Category not found:', categoryTitle, 'Available categories:', editedSkills.map(cat => cat.title));
    }
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    console.log('🗑️ removeSkill called:', { categoryIndex, skillIndex, editedSkills });
    if (!Array.isArray(editedSkills)) {
      console.log('❌ editedSkills is not an array:', editedSkills);
      return;
    }
    const updatedSkills = [...editedSkills];
    console.log('📝 Before splice:', updatedSkills[categoryIndex].skills);
    updatedSkills[categoryIndex].skills.splice(skillIndex, 1);
    console.log('📝 After splice:', updatedSkills[categoryIndex].skills);
    setEditedSkills(updatedSkills);
    console.log('✅ Skills updated');
  };

  const updateSkill = (categoryIndex: number, skillIndex: number, field: string, value: string) => {
    if (!Array.isArray(editedSkills)) return;
    const updatedSkills = [...editedSkills];
    updatedSkills[categoryIndex].skills[skillIndex] = {
      ...updatedSkills[categoryIndex].skills[skillIndex],
      [field]: value
    };
    setEditedSkills(updatedSkills);
  };

  // Categorize languages from GitHub
  const categorizeLanguages = () => {
    if (!profileData?.languages) {
      return [
        {
          title: "Frontend",
          icon: <Palette className="h-5 w-5" />,
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          skills: [
            { name: "React", level: "expert", years: "4+ anos" },
            { name: "TypeScript", level: "expert", years: "3+ anos" },
            { name: "Next.js", level: "expert", years: "3+ anos" },
            { name: "Vue.js", level: "intermediate", years: "2+ anos" },
            { name: "Tailwind CSS", level: "expert", years: "3+ anos" },
            { name: "Sass", level: "intermediate", years: "2+ anos" }
          ]
        },
        {
          title: "Backend",
          icon: <Database className="h-5 w-5" />,
          color: "text-green-600",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          skills: [
            { name: "Node.js", level: "expert", years: "4+ anos" },
            { name: "Python", level: "expert", years: "3+ anos" },
            { name: "Express.js", level: "expert", years: "4+ anos" },
            { name: "FastAPI", level: "intermediate", years: "2+ anos" },
            { name: "PostgreSQL", level: "expert", years: "4+ anos" },
            { name: "MongoDB", level: "intermediate", years: "2+ anos" }
          ]
        },
        {
          title: "Cloud & DevOps",
          icon: <Cloud className="h-5 w-5" />,
          color: "text-purple-600",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
          skills: [
            { name: "AWS", level: "expert", years: "3+ anos" },
            { name: "Docker", level: "expert", years: "3+ anos" },
            { name: "Kubernetes", level: "intermediate", years: "2+ anos" },
            { name: "Terraform", level: "intermediate", years: "1+ anos" },
            { name: "CI/CD", level: "expert", years: "3+ anos" },
            { name: "Monitoring", level: "intermediate", years: "2+ anos" }
          ]
        }
      ];
    }

    const frontendLanguages = ['JavaScript', 'TypeScript', 'React', 'Vue', 'HTML', 'CSS', 'Sass', 'SCSS'];
    const backendLanguages = ['Node.js', 'Python', 'PHP', 'Java', 'C#', 'Go', 'Rust'];
    const databaseLanguages = ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB'];
    const otherLanguages = ['Shell', 'PowerShell', 'Dockerfile', 'YAML', 'JSON'];

    const categorizeSkill = (lang: string) => {
      if (frontendLanguages.some(l => lang.toLowerCase().includes(l.toLowerCase()))) {
        return 'frontend';
      } else if (backendLanguages.some(l => lang.toLowerCase().includes(l.toLowerCase()))) {
        return 'backend';
      } else if (databaseLanguages.some(l => lang.toLowerCase().includes(l.toLowerCase()))) {
        return 'database';
      } else {
        return 'other';
      }
    };

    const categories = {
      frontend: { skills: [] as Array<{name: string, level: string, years: string}>, title: "Frontend", icon: <Palette className="h-5 w-5" />, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
      backend: { skills: [] as Array<{name: string, level: string, years: string}>, title: "Backend", icon: <Database className="h-5 w-5" />, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
      database: { skills: [] as Array<{name: string, level: string, years: string}>, title: "Database", icon: <Database className="h-5 w-5" />, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
      other: { skills: [] as Array<{name: string, level: string, years: string}>, title: "Outros", icon: <Code className="h-5 w-5" />, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" }
    };

    profileData.languages.forEach(lang => {
      const category = categorizeSkill(lang);
      const level = Math.random() > 0.5 ? 'expert' : Math.random() > 0.3 ? 'intermediate' : 'beginner';
      const years = level === 'expert' ? '3+ anos' : level === 'intermediate' ? '2+ anos' : '1+ anos';
      
      categories[category].skills.push({
        name: lang,
        level,
        years
      });
    });

    return Object.values(categories).filter(cat => cat.skills.length > 0);
  };

  const skillCategories = editedSkills.length > 0 ? editedSkills : categorizeLanguages();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-green-500 text-white';
      case 'intermediate':
        return 'bg-yellow-500 text-white';
      case 'beginner':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'expert':
        return 'Expert';
      case 'intermediate':
        return 'Intermediário';
      case 'beginner':
        return 'Iniciante';
      default:
        return level;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            Habilidades Técnicas
            {editingSection === 'skills' && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Editando
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editingSection === 'skills' ? stopEditSection() : startEditSection('skills')}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <div className={category.color}>
                    {category.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {category.title}
                </h3>
              </div>
              
              <div className="space-y-3">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingSection === 'skills' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={skill.name}
                              onChange={(e) => updateSkill(categoryIndex, skillIndex, 'name', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Nome da habilidade"
                            />
                            <Button
                              onClick={() => removeSkill(categoryIndex, skillIndex)}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={skill.level}
                              onValueChange={(value) => updateSkill(categoryIndex, skillIndex, 'level', value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Iniciante</SelectItem>
                                <SelectItem value="intermediate">Intermediário</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={skill.years}
                              onValueChange={(value) => updateSkill(categoryIndex, skillIndex, 'years', value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="-1 ano">-1 ano</SelectItem>
                                <SelectItem value="1+ anos">1+ anos</SelectItem>
                                <SelectItem value="2+ anos">2+ anos</SelectItem>
                                <SelectItem value="3+ anos">3+ anos</SelectItem>
                                <SelectItem value="4+ anos">4+ anos</SelectItem>
                                <SelectItem value="5+ anos">5+ anos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {skill.name}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getLevelColor(skill.level)}`}
                            >
                              {getLevelText(skill.level)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {skill.years}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Formulário para adicionar nova habilidade */}
        {editingSection === 'skills' && (
          <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Adicionar Nova Habilidade
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input
                value={newSkill.name}
                onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da habilidade"
                className="h-8 text-sm"
              />
              <Select
                value={newSkill.category}
                onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newSkill.level}
                onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newSkill.years}
                onValueChange={(value) => setNewSkill(prev => ({ ...prev, years: value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1 ano">-1 ano</SelectItem>
                  <SelectItem value="1+ anos">1+ anos</SelectItem>
                  <SelectItem value="2+ anos">2+ anos</SelectItem>
                  <SelectItem value="3+ anos">3+ anos</SelectItem>
                  <SelectItem value="4+ anos">4+ anos</SelectItem>
                  <SelectItem value="5+ anos">5+ anos</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={addSkill}
                size="sm"
                className="h-8"
              >
                <Plus size={14} className="mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {/* Botões de ação para edição */}
        {editingSection === 'skills' && (
          <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={saveSkillsData} size="sm" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={cancelSkillsEdit} variant="outline" size="sm" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}

        {/* Resumo de Competências */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Resumo de Competências
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {profileData?.languages?.length || 15}+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Linguagens Conhecidas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {skillCategories.reduce((acc, cat) => acc + cat.skills.filter(s => s.level === 'expert').length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Nível Expert</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {profileData?.stats?.experience || '5+'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Anos de Experiência</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
