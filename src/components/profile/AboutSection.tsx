'use client';

import React from 'react';
import { User, Award, Target, Heart, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';
import { useProfileEdit } from '@/contexts/ProfileEditContext';

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  const { data: profileData } = useGitHubProfile();
  const { editingSection, startEditSection, stopEditSection } = useProfileEdit();

  // Generate dynamic content based on GitHub data
  const generateProfessionalHighlights = () => {
    if (!profileData) return [
      "Liderança de equipes técnicas de até 8 desenvolvedores",
      "Especialista em arquiteturas cloud e microserviços",
      "Contribuidor ativo em projetos open source",
      "Mentor de desenvolvedores júnior e pleno"
    ];

    const highlights = [];
    if (profileData.stats.projects > 10) {
      highlights.push(`Desenvolveu ${profileData.stats.projects} projetos públicos`);
    }
    if (profileData.stats.stars > 0) {
      highlights.push(`Recebeu ${profileData.stats.stars} estrelas em repositórios`);
    }
    if (profileData.stats.languages > 5) {
      highlights.push(`Especialista em ${profileData.stats.languages} linguagens de programação`);
    }
    if (profileData.stats.commits > 20) {
      highlights.push(`Contribuiu com ${profileData.stats.commits} commits recentes`);
    }
    
    return highlights.length > 0 ? highlights : [
      "Desenvolvedor ativo no GitHub",
      "Contribuidor em projetos open source",
      "Especialista em múltiplas tecnologias",
      "Focado em qualidade de código"
    ];
  };

  const generateInterests = () => {
    if (!profileData) return ["Open Source", "Mentoria", "Arquitetura de Software", "Comunidade Tech"];
    
    const interests = ["Open Source", "Desenvolvimento"];
    if (profileData.languages.includes("JavaScript") || profileData.languages.includes("TypeScript")) {
      interests.push("JavaScript/TypeScript");
    }
    if (profileData.languages.includes("Python")) {
      interests.push("Python");
    }
    if (profileData.languages.includes("React") || profileData.languages.includes("Vue")) {
      interests.push("Frontend");
    }
    if (profileData.languages.includes("Node.js") || profileData.languages.includes("PHP")) {
      interests.push("Backend");
    }
    
    return interests.slice(0, 4);
  };

  const aboutData = {
    professional: {
      title: t('profile.about.aboutMe'),
      content: profileData?.bio || t('profile.about.professionalBio'),
      highlights: generateProfessionalHighlights()
    },
    personal: {
      title: t('profile.about.beyondCode'),
      content: t('profile.about.personalBio'),
      interests: generateInterests()
    },
    values: {
      title: t('profile.about.valuesPhilosophy'),
      content: t('profile.about.valuesBio'),
      principles: [
        "Código limpo e bem documentado",
        "Colaboração e trabalho em equipe",
        "Aprendizado contínuo",
        "Impacto social através da tecnologia"
      ]
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            {t('profile.about.title')}
            {editingSection === 'about' && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Editando
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editingSection === 'about' ? stopEditSection() : startEditSection('about')}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Biografia Profissional */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-600" />
            {aboutData.professional.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {aboutData.professional.content}
          </p>
          <ul className="space-y-2">
            {aboutData.professional.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Biografia Pessoal */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-purple-600" />
            {aboutData.personal.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {aboutData.personal.content}
          </p>
          <div className="flex flex-wrap gap-2">
            {aboutData.personal.interests.map((interest, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Valores e Filosofia */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            {aboutData.values.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {aboutData.values.content}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aboutData.values.principles.map((principle, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{principle}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
