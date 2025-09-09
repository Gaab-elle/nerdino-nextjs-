'use client';

import React from 'react';
import { Code, Database, Cloud, Palette, Smartphone, Globe, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';
import { useProfileEdit } from '@/contexts/ProfileEditContext';

export const SkillsSection: React.FC = () => {
  const { t } = useLanguage();
  const { data: profileData } = useGitHubProfile();
  const { editingSection, startEditSection, stopEditSection } = useProfileEdit();

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
      frontend: { skills: [], title: "Frontend", icon: <Palette className="h-5 w-5" />, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
      backend: { skills: [], title: "Backend", icon: <Database className="h-5 w-5" />, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
      database: { skills: [], title: "Database", icon: <Database className="h-5 w-5" />, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
      other: { skills: [], title: "Outros", icon: <Code className="h-5 w-5" />, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800" }
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

  const skillCategories = categorizeLanguages();

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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

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
