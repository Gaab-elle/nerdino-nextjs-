'use client';

import React, { useState, useEffect } from 'react';
import { User, Award, Target, Heart, Edit3, Save, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  const { data: githubData } = useGitHubProfile();
  const { profileData: userData } = useUserProfile();
  const { editingSection, startEditSection, stopEditSection } = useProfileEdit();

  // Estados para edição
  const [editedAbout, setEditedAbout] = useState({
    professionalBio: '',
    personalBio: '',
    interests: [] as string[],
    principles: [] as string[]
  });
  const [savedAbout, setSavedAbout] = useState<any>(null);
  const [newInterest, setNewInterest] = useState('');
  const [newPrinciple, setNewPrinciple] = useState('');

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aboutData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedAbout(parsed);
      } catch (error) {
        console.error('Erro ao carregar dados sobre:', error);
      }
    }
  }, []);

  // Atualizar dados editados quando os dados originais mudarem
  useEffect(() => {
    const professionalBio = userData?.bio || githubData?.bio || t('profile.about.professionalBio');
    const personalBio = t('profile.about.personalBio');
    const interests = generateInterests();
    const principles = [
      "Código limpo e bem documentado",
      "Colaboração e trabalho em equipe",
      "Aprendizado contínuo",
      "Impacto social através da tecnologia"
    ];

    if (savedAbout) {
      setEditedAbout({
        professionalBio: savedAbout.professionalBio || professionalBio,
        personalBio: savedAbout.personalBio || personalBio,
        interests: savedAbout.interests || interests,
        principles: savedAbout.principles || principles
      });
    } else {
      setEditedAbout({
        professionalBio,
        personalBio,
        interests,
        principles
      });
    }
  }, [userData, savedAbout, githubData, t]);

  // Função para salvar dados sobre
  const saveAboutData = () => {
    const dataToSave = {
      ...editedAbout,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('aboutData', JSON.stringify(dataToSave));
      setSavedAbout(dataToSave);
      stopEditSection();
      console.log('Dados sobre salvos com sucesso:', dataToSave);
    } catch (error) {
      console.error('Erro ao salvar dados sobre:', error);
    }
  };

  // Função para cancelar edição
  const cancelAboutEdit = () => {
    if (savedAbout) {
      setEditedAbout({
        professionalBio: savedAbout.professionalBio || '',
        personalBio: savedAbout.personalBio || '',
        interests: savedAbout.interests || [],
        principles: savedAbout.principles || []
      });
    }
    stopEditSection();
  };

  // Funções para gerenciar interesses
  const addInterest = () => {
    if (newInterest.trim() && !editedAbout.interests.includes(newInterest.trim())) {
      setEditedAbout(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setEditedAbout(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  // Funções para gerenciar princípios
  const addPrinciple = () => {
    if (newPrinciple.trim() && !editedAbout.principles.includes(newPrinciple.trim())) {
      setEditedAbout(prev => ({
        ...prev,
        principles: [...prev.principles, newPrinciple.trim()]
      }));
      setNewPrinciple('');
    }
  };

  const removePrinciple = (index: number) => {
    setEditedAbout(prev => ({
      ...prev,
      principles: prev.principles.filter((_, i) => i !== index)
    }));
  };

  // Generate dynamic content based on user data and GitHub data
  const generateProfessionalHighlights = () => {
    if (!githubData && !userData) return [
      "Liderança de equipes técnicas de até 8 desenvolvedores",
      "Especialista em arquiteturas cloud e microserviços",
      "Contribuidor ativo em projetos open source",
      "Mentor de desenvolvedores júnior e pleno"
    ];

    const highlights = [];
    if (githubData?.stats?.projects && githubData.stats.projects > 10) {
      highlights.push(`Desenvolveu ${githubData.stats.projects} projetos públicos`);
    }
    if (githubData?.stats?.stars && githubData.stats.stars > 0) {
      highlights.push(`Recebeu ${githubData.stats.stars} estrelas em repositórios`);
    }
    if (githubData?.stats?.languages && githubData.stats.languages > 5) {
      highlights.push(`Especialista em ${githubData.stats.languages} linguagens de programação`);
    }
    if (githubData?.stats?.commits && githubData.stats.commits > 20) {
      highlights.push(`Contribuiu com ${githubData.stats.commits} commits recentes`);
    }
    
    return highlights.length > 0 ? highlights : [
      "Desenvolvedor ativo no GitHub",
      "Contribuidor em projetos open source",
      "Especialista em múltiplas tecnologias",
      "Focado em qualidade de código"
    ];
  };

  const generateInterests = () => {
    if (!githubData) return ["Open Source", "Mentoria", "Arquitetura de Software", "Comunidade Tech"];
    
    const interests = ["Open Source", "Desenvolvimento"];
    if (githubData.languages?.includes("JavaScript") || githubData.languages?.includes("TypeScript")) {
      interests.push("JavaScript/TypeScript");
    }
    if (githubData.languages?.includes("Python")) {
      interests.push("Python");
    }
    if (githubData.languages?.includes("React") || githubData.languages?.includes("Vue")) {
      interests.push("Frontend");
    }
    if (githubData.languages?.includes("Node.js") || githubData.languages?.includes("PHP")) {
      interests.push("Backend");
    }
    
    return interests.slice(0, 4);
  };

  const aboutData = {
    professional: {
      title: t('profile.about.aboutMe'),
      content: editedAbout.professionalBio || userData?.bio || githubData?.bio || t('profile.about.professionalBio'),
      highlights: generateProfessionalHighlights()
    },
    personal: {
      title: t('profile.about.beyondCode'),
      content: editedAbout.personalBio || t('profile.about.personalBio'),
      interests: editedAbout.interests.length > 0 ? editedAbout.interests : generateInterests()
    },
    values: {
      title: t('profile.about.valuesPhilosophy'),
      content: t('profile.about.valuesBio'),
      principles: editedAbout.principles.length > 0 ? editedAbout.principles : [
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
          {editingSection === 'about' ? (
            <Textarea
              value={editedAbout.professionalBio}
              onChange={(e) => setEditedAbout(prev => ({ ...prev, professionalBio: e.target.value }))}
              placeholder="Escreva sua biografia profissional..."
              className="mb-4 border-gray-300 dark:border-gray-600 resize-none"
              rows={3}
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {aboutData.professional.content}
            </p>
          )}
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
          {editingSection === 'about' ? (
            <Textarea
              value={editedAbout.personalBio}
              onChange={(e) => setEditedAbout(prev => ({ ...prev, personalBio: e.target.value }))}
              placeholder="Escreva sua biografia pessoal..."
              className="mb-4 border-gray-300 dark:border-gray-600 resize-none"
              rows={3}
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {aboutData.personal.content}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {aboutData.personal.interests.map((interest, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-2"
              >
                {interest}
                {editingSection === 'about' && (
                  <button
                    onClick={() => removeInterest(index)}
                    className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {editingSection === 'about' && (
            <div className="flex gap-2 mt-3">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                placeholder="Adicionar interesse..."
                className="flex-1 h-8 text-sm border-gray-300 dark:border-gray-600"
              />
              <Button
                onClick={addInterest}
                size="sm"
                className="h-8 px-3"
              >
                <Plus size={14} />
              </Button>
            </div>
          )}
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
                <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{principle}</span>
                {editingSection === 'about' && (
                  <button
                    onClick={() => removePrinciple(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {editingSection === 'about' && (
            <div className="flex gap-2 mt-3">
              <Input
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPrinciple()}
                placeholder="Adicionar princípio..."
                className="flex-1 h-8 text-sm border-gray-300 dark:border-gray-600"
              />
              <Button
                onClick={addPrinciple}
                size="sm"
                className="h-8 px-3"
              >
                <Plus size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* Botões de ação para edição */}
        {editingSection === 'about' && (
          <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={saveAboutData} size="sm" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={cancelAboutEdit} variant="outline" size="sm" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
