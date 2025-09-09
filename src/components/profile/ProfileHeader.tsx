'use client';

import React, { useState } from 'react';
import { MapPin, Calendar, ExternalLink, Github, Linkedin, Mail, Twitter, RefreshCw, AlertCircle, Edit3, Plus, X } from 'lucide-react';
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


export const ProfileHeader: React.FC = () => {
  const { t } = useLanguage();
  const { data: profileData, loading, error, refetch, forceRefresh, lastSync } = useGitHubProfile();
  const { isEditing, toggleEdit } = useProfileEdit();

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

  // Inicializar estados quando profileData carrega
  React.useEffect(() => {
    if (profileData) {
      // Usar dados salvos se existirem, senão usar dados do GitHub
      const name = savedData?.name || profileData.name || '';
      const title = savedData?.title || profileData.title || '';
      const location = savedData?.location || profileData.location || '';
      const bio = savedData?.bio || profileData.bio || '';
      const badges = savedData?.badges || profileData.badges || [];

      setEditedName(name);
      setEditedTitle(title);
      setEditedLocation(location);
      setEditedBio(bio);
      setEditedBadges(badges);
    }
  }, [profileData, savedData]);

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
    } else if (profileData) {
      setEditedName(profileData.name || '');
      setEditedTitle(profileData.title || '');
      setEditedLocation(profileData.location || '');
      setEditedBio(profileData.bio || '');
      setEditedBadges(profileData.badges || []);
    }
  };

  // Loading state
  if (loading) {
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
  if (!profileData) {
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
    <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 dark:from-purple-800 dark:via-blue-800 dark:to-indigo-900 relative">
      {/* Botão de Edição - Canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                saveEditedData();
                toggleEdit();
              }}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
              title="Salvar alterações"
            >
              Salvar
            </Button>
            <Button
              onClick={() => {
                cancelEdit();
                toggleEdit();
              }}
              size="sm"
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white"
              title="Cancelar edição"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              onClick={toggleEdit}
              size="sm"
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white h-8 w-8 p-0"
              title="Editar perfil"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              onClick={forceRefresh}
              size="sm"
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white h-8 w-8 p-0"
              title="Atualizar do GitHub"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Layout horizontal: Avatar + Info lado a lado */}
        <div className="space-y-8">
          {/* Seção Principal: Avatar + Informações lado a lado */}
          <div className="flex items-start gap-6">
            {/* Avatar - Lado esquerdo */}
            <div className="flex-shrink-0 w-40 h-40">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full p-1">
                  <Avatar className="w-full h-full border-4 border-white dark:border-gray-800">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            {/* Informações Pessoais - Lado direito */}
            <div className="flex-1 min-w-0 pl-0">
              {/* Nome e Título */}
              {isEditing ? (
                <div className="space-y-3 mb-4">
                  <Input
                    value={editedName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedName(e.target.value)}
                    placeholder="Nome completo"
                    className="text-2xl lg:text-3xl font-bold bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                  <Input
                    value={editedTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedTitle(e.target.value)}
                    placeholder="Título profissional"
                    className="text-lg bg-white/10 border-white/20 text-purple-100 placeholder:text-purple-100/60"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {editedName}
                  </h1>
                  <p className="text-lg text-purple-100 mb-4">
                    {editedTitle}
                  </p>
                </>
              )}

              {/* Localização e Data */}
              <div className="flex flex-wrap items-center gap-4 text-purple-100 mb-6">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <Input
                      value={editedLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedLocation(e.target.value)}
                      placeholder="Localização"
                      className="w-48 bg-white/10 border-white/20 text-purple-100 placeholder:text-purple-100/60"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{editedLocation}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{profileData.joinDate}</span>
                </div>
              </div>

              {/* Bio */}
              {isEditing ? (
                <Textarea
                  value={editedBio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedBio(e.target.value)}
                  placeholder="Escreva uma breve biografia sobre você..."
                  className="mb-6 bg-white/10 border-white/20 text-purple-100 placeholder:text-purple-100/60 resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-purple-100 mb-6">
                  {editedBio}
                </p>
              )}

              {/* Linguagens */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {editedBadges.map((badge, index) => {
                    return (
                      <div 
                        key={index} 
                        className="relative transition-all duration-200 hover:scale-105 flex items-center gap-2"
                      >
                        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-2 border border-gray-700/50 shadow-lg">
                          <TechIcon tech={badge} className="w-16 h-16 text-6xl" />
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => removeBadge(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newBadge}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBadge(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Adicionar linguagem..."
                      className="flex-1 bg-white/10 border-white/20 text-purple-100 placeholder:text-purple-100/60"
                    />
                    <Button
                      onClick={addBadge}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Button className="bg-white text-purple-600 hover:bg-purple-50">
                  <Mail size={16} className="mr-2" />
                  {t('profile.header.contact')}
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <ExternalLink size={16} className="mr-2" />
                  {t('profile.header.viewPortfolio')}
                </Button>
              </div>

              {/* Links Sociais */}
              <div className="flex gap-4">
                {profileData.social.github && (
                  <a 
                    href={profileData.social.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    title="GitHub Profile"
                  >
                    <Github size={20} className="text-white" />
                  </a>
                )}
                {profileData.social.website && (
                  <a 
                    href={profileData.social.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    title="Personal Website"
                  >
                    <ExternalLink size={20} className="text-white" />
                  </a>
                )}
                {profileData.social.linkedin && (
                  <a 
                    href={profileData.social.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin size={20} className="text-white" />
                  </a>
                )}
                {profileData.social.twitter && (
                  <a 
                    href={profileData.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    title="Twitter Profile"
                  >
                    <Twitter size={20} className="text-white" />
                  </a>
                )}
                {profileData.social.email && (
                  <a 
                    href={`mailto:${profileData.social.email}`}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    title="Send Email"
                  >
                    <Mail size={20} className="text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>

              {/* Seção Inferior: Estatísticas */}
          <div className="w-full">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {profileData.stats.projects}
                  </div>
                  <div className="text-purple-100 text-xs">
                    {t('profile.header.projects')}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {profileData.stats.followers}
                  </div>
                  <div className="text-purple-100 text-xs">
                    {t('profile.header.followers')}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {profileData.stats.stars}
                  </div>
                  <div className="text-purple-100 text-xs">
                    Stars
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {profileData.stats.commits}
                  </div>
                  <div className="text-purple-100 text-xs">
                    {t('profile.header.commits')}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {profileData.stats.languages}
                  </div>
                  <div className="text-purple-100 text-xs">
                    Languages
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {profileData.stats.experience}
                  </div>
                  <div className="text-purple-100 text-xs">
                    {t('profile.header.experience')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Last sync info */}
            {lastSync && (
              <div className="text-center mt-4">
                <p className="text-purple-200 text-sm">
                  Last updated: {new Date(lastSync).toLocaleString()}
                </p>
                <Button 
                  onClick={forceRefresh}
                  variant="outline" 
                  size="sm"
                  className="mt-2 border-white/30 text-white hover:bg-white/10"
                >
                  <RefreshCw className="mr-2" size={14} />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
