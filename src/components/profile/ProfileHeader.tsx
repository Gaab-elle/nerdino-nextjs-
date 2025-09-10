'use client';

import React, { useState } from 'react';
import { MapPin, Calendar, ExternalLink, Github, Linkedin, Mail, Twitter, RefreshCw, AlertCircle, Edit3, Plus, X, Code, GitCommit, Languages, Briefcase, Clock, Star, Users, FolderOpen } from 'lucide-react';
import TechIcon from '@/components/ui/TechIcon';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';


export const ProfileHeader: React.FC = () => {
  const { t } = useLanguage();
  const { data: githubData, loading: githubLoading, error, refetch, forceRefresh, lastSync } = useGitHubProfile();
  const { profileData: userData, loading: userLoading } = useUserProfile();
  const { isEditing, toggleEdit } = useProfileEdit();
  const { isVisible, loading: privacyLoading } = usePrivacySettings();

  // Estados locais para edição
  const [editedName, setEditedName] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedBadges, setEditedBadges] = useState<string[]>([]);
  const [newBadge, setNewBadge] = useState('');
  const [savedData, setSavedData] = useState<any>(null);

  // Carregar dados salvos do localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('profileHeaderData');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setSavedData(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  // Inicializar estados com dados reais do usuário
  React.useEffect(() => {
    if (userData) {
      // Priorizar dados do usuário (configurações salvas), depois dados salvos localmente, depois GitHub
      const name = userData.name || savedData?.name || githubData?.name || '';
      const title = userData.title || savedData?.title || githubData?.title || '';
      const location = userData.location || savedData?.location || githubData?.location || '';
      const bio = userData.bio || savedData?.bio || githubData?.bio || '';
      const badges = savedData?.badges || githubData?.badges || [];

      setEditedName(name);
      setEditedTitle(title);
      setEditedLocation(location);
      setEditedBio(bio);
      setEditedBadges(badges);
    }
  }, [userData, savedData, githubData]);

  // Funções para gerenciar badges
  const addBadge = () => {
    if (newBadge.trim() && !editedBadges.includes(newBadge.trim())) {
      setEditedBadges([...editedBadges, newBadge.trim()]);
      setNewBadge('');
    }
  };

  const removeBadge = (index: number) => {
    setEditedBadges(editedBadges.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBadge();
    }
  };

  // Função para salvar dados editados
  const saveEditedData = () => {
    const dataToSave = {
      name: editedName,
      title: editedTitle,
      location: editedLocation,
      bio: editedBio,
      badges: editedBadges,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('profileHeaderData', JSON.stringify(dataToSave));
      setSavedData(dataToSave);
      console.log('Dados salvos com sucesso:', dataToSave);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  // Função para cancelar edição (volta aos dados salvos ou originais)
  const cancelEdit = () => {
    if (savedData) {
      setEditedName(savedData.name || '');
      setEditedTitle(savedData.title || '');
      setEditedLocation(savedData.location || '');
      setEditedBio(savedData.bio || '');
      setEditedBadges(savedData.badges || []);
    } else if (userData) {
      setEditedName(userData.name || '');
      setEditedTitle(userData.title || '');
      setEditedLocation(userData.location || '');
      setEditedBio(userData.bio || '');
      setEditedBadges(githubData?.badges || []);
    }
  };

  // Loading state
  if (githubLoading || userLoading || privacyLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 dark:from-purple-800 dark:via-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-white">
              <RefreshCw className="animate-spin" size={24} />
              <span>Loading GitHub profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 dark:from-purple-800 dark:via-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-white">
              <AlertCircle className="mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Failed to load GitHub profile</h3>
              <p className="text-purple-100 mb-4">{error}</p>
              <Button 
                onClick={forceRefresh}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className="mr-2" size={16} />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!userData) {
    return (
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 dark:from-purple-800 dark:via-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-white">
              <Github className="mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Connect your GitHub account</h3>
              <p className="text-purple-100 mb-4">Link your GitHub to see your profile data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 dark:bg-gray-900 relative">
      {/* Barra superior fixa cinza claro */}
      <div className="bg-gray-300 dark:bg-gray-800 border-b border-gray-400 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editedName || 'Perfil'}
              </h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Clock className="w-3 h-3 mr-1" />
                Disponível
              </Badge>
            </div>
            
            {/* Botões de ação na barra superior */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => {
                      saveEditedData();
                      toggleEdit();
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => {
                      cancelEdit();
                      toggleEdit();
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={toggleEdit}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={forceRefresh}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seção principal: Avatar + Informações */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="w-20 h-20 border-3 border-gray-200 dark:border-gray-600">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="text-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Informações principais */}
            <div className="flex-1 min-w-0">
              {/* Nome e Título */}
              {isEditing ? (
                <div className="space-y-3 mb-4">
                  <Input
                    value={editedName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedName(e.target.value)}
                    placeholder="Nome completo"
                    className="text-2xl font-bold border-gray-300 dark:border-gray-600"
                  />
                  <Input
                    value={editedTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedTitle(e.target.value)}
                    placeholder="Título profissional"
                    className="text-lg text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {editedName}
                  </h1>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-3">
                    {editedTitle}
                  </p>
                </>
              )}

              {/* Bio */}
              {isEditing ? (
                <Textarea
                  value={editedBio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedBio(e.target.value)}
                  placeholder="Escreva uma breve biografia sobre você..."
                  className="mb-4 border-gray-300 dark:border-gray-600 resize-none"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {editedBio}
                </p>
              )}

              {/* Localização e Data */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <Input
                      value={editedLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedLocation(e.target.value)}
                      placeholder="Localização"
                      className="w-40 h-8 text-sm border-gray-300 dark:border-gray-600"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{editedLocation}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{githubData?.joinDate || 'Member since 2024'}</span>
                </div>
              </div>

              {/* Tecnologias - Ícones discretos e clicáveis */}
              {isVisible('showSkills') && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {editedBadges.map((badge, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-pointer transition-all duration-200 hover:scale-110"
                        title={badge}
                      >
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1.5 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                          <TechIcon tech={badge} className="w-5 h-5" />
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeBadge(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-3">
                      <Input
                        value={newBadge}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBadge(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Adicionar tecnologia..."
                        className="flex-1 h-8 text-sm border-gray-300 dark:border-gray-600"
                      />
                      <Button
                        onClick={addBadge}
                        size="sm"
                        className="h-8 px-3"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Links Sociais */}
              {isVisible('showContact') && (
                <div className="flex gap-3">
                  {userData.github && (
                    <a 
                      href={userData.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="GitHub Profile"
                    >
                      <Github size={16} className="text-gray-600 dark:text-gray-400" />
                    </a>
                  )}
                  {userData.linkedin && (
                    <a 
                      href={userData.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin size={16} className="text-gray-600 dark:text-gray-400" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {/* Projetos */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-2 text-center">
              <div className="flex items-center justify-center mb-1">
                <FolderOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {githubData?.stats?.projects || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Projetos
              </div>
            </CardContent>
          </Card>

          {/* Stars */}
          {isVisible('showStars') && (
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {githubData?.stats?.stars || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Stars
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seguidores */}
          {isVisible('showFollowers') && (
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {githubData?.stats?.followers || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Seguidores
                </div>
              </CardContent>
            </Card>
          )}

          {/* Commits */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-2 text-center">
              <div className="flex items-center justify-center mb-1">
                <GitCommit className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {githubData?.stats?.commits || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Commits
              </div>
            </CardContent>
          </Card>

          {/* Linguagens */}
          {isVisible('showSkills') && (
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Languages className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {githubData?.stats?.languages || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Linguagens
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experiência */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-2 text-center">
              <div className="flex items-center justify-center mb-1">
                <Briefcase className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {githubData?.stats?.experience || '0+'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Anos
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de disponibilidade e experiência */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Disponibilidade */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                Disponibilidade
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Disponível
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tipo de trabalho</span>
                  <span className="text-gray-900 dark:text-white">Remoto / Híbrido</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Horário</span>
                  <span className="text-gray-900 dark:text-white">Flexível</span>
                </div>
              </div>
            </div>

            {/* Experiência destacada */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Experiência
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Especialização</span>
                  <span className="text-gray-900 dark:text-white">Fullstack</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Foco atual</span>
                  <span className="text-gray-900 dark:text-white">React / Node.js</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Interesse</span>
                  <span className="text-gray-900 dark:text-white">Startups / Scale-ups</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last sync info */}
        {lastSync && (
          <div className="text-center mt-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Última atualização: {new Date(lastSync).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
