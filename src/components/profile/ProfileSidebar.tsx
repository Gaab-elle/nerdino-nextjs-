'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Globe, Award, Trophy, Star, Users, Calendar, MessageCircle, Heart, Eye, Edit3, Save, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHubProfile } from '@/hooks/useGitHubProfile';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

export const ProfileSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { data: githubData } = useGitHubProfile();
  const { profileData: userData } = useUserProfile();
  const { editingSection, startEditSection, stopEditSection } = useProfileEdit();
  const { isVisible, loading: privacyLoading } = usePrivacySettings();

  // Estados para edição do contato
  const [editedContact, setEditedContact] = useState({
    email: '',
    phone: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: ''
  });
  const [savedContact, setSavedContact] = useState<{
    email: string;
    phone: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    twitter: string;
  } | null>(null);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('contactData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedContact(parsed);
      } catch (error) {
        console.error('Erro ao carregar dados de contato:', error);
      }
    }
  }, []);

  // Atualizar dados editados quando os dados originais mudarem
  useEffect(() => {
    const email = userData?.email || githubData?.social?.email || '';
    const phone = userData?.phone || '';
    const location = userData?.location || githubData?.location || '';
    const website = userData?.website || githubData?.social?.website || '';
    const github = githubData?.social?.github || '';
    const linkedin = githubData?.social?.linkedin || '';
    const twitter = githubData?.social?.twitter || '';

    if (savedContact) {
      setEditedContact({
        email: savedContact.email || email,
        phone: savedContact.phone || phone,
        location: savedContact.location || location,
        website: savedContact.website || website,
        github: savedContact.github || github,
        linkedin: savedContact.linkedin || linkedin,
        twitter: savedContact.twitter || twitter
      });
    } else {
      setEditedContact({
        email,
        phone,
        location,
        website,
        github,
        linkedin,
        twitter
      });
    }
  }, [userData, savedContact, githubData]);

  // Função para salvar dados de contato
  const saveContactData = () => {
    const dataToSave = {
      ...editedContact,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('contactData', JSON.stringify(dataToSave));
      setSavedContact(dataToSave);
      stopEditSection();
      console.log('Dados de contato salvos com sucesso:', dataToSave);
    } catch (error) {
      console.error('Erro ao salvar dados de contato:', error);
    }
  };

  // Função para cancelar edição
  const cancelContactEdit = () => {
    if (savedContact) {
      setEditedContact({
        email: savedContact.email || '',
        phone: savedContact.phone || '',
        location: savedContact.location || '',
        website: savedContact.website || '',
        github: savedContact.github || '',
        linkedin: savedContact.linkedin || '',
        twitter: savedContact.twitter || ''
      });
    }
    stopEditSection();
  };

  const contactInfo = {
    email: editedContact.email || userData?.email || githubData?.social?.email,
    phone: editedContact.phone || userData?.phone,
    location: editedContact.location || userData?.location || githubData?.location,
    website: editedContact.website || userData?.website || githubData?.social?.website,
    social: {
      github: editedContact.github || userData?.github || githubData?.social?.github,
      linkedin: editedContact.linkedin || userData?.linkedin || githubData?.social?.linkedin,
      twitter: editedContact.twitter || userData?.twitter || githubData?.social?.twitter
    }
  };

  const achievements = [
    {
      id: 1,
      title: t('profile.sidebar.achievementTitles.techLead'),
      description: t('profile.sidebar.achievementDescriptions.techLead'),
      icon: <Users className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      earned: "2022"
    },
    {
      id: 2,
      title: t('profile.sidebar.achievementTitles.openSourceHero'),
      description: t('profile.sidebar.achievementDescriptions.openSourceHero'),
      icon: <Star className="h-4 w-4" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      earned: "2023"
    },
    {
      id: 3,
      title: t('profile.sidebar.achievementTitles.mentor'),
      description: t('profile.sidebar.achievementDescriptions.mentor'),
      icon: <Heart className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      earned: "2023"
    },
    {
      id: 4,
      title: t('profile.sidebar.achievementTitles.speaker'),
      description: t('profile.sidebar.achievementDescriptions.speaker'),
      icon: <MessageCircle className="h-4 w-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      earned: "2023"
    },
    {
      id: 5,
      title: t('profile.sidebar.achievementTitles.awsExpert'),
      description: t('profile.sidebar.achievementDescriptions.awsExpert'),
      icon: <Award className="h-4 w-4" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      earned: "2023"
    },
    {
      id: 6,
      title: t('profile.sidebar.achievementTitles.codeMaster'),
      description: t('profile.sidebar.achievementDescriptions.codeMaster'),
      icon: <Trophy className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      earned: "2024"
    }
  ];

  // Generate recent activity from GitHub data
  const getRecentActivity = () => {
    if (!githubData?.recentActivity) {
      return [
        {
          id: 1,
          type: "project",
          action: "publicou um projeto",
          title: "E-commerce Platform v2.0",
          time: "2 horas atrás",
          icon: <Star className="h-4 w-4 text-yellow-600" />,
          url: ""
        },
        {
          id: 2,
          type: "commit",
          action: "fez um commit",
          title: "task-manager",
          time: "4 horas atrás",
          icon: <MessageCircle className="h-4 w-4 text-blue-600" />,
          url: ""
        }
      ];
    }

    return githubData.recentActivity.slice(0, 5).map((activity, index) => {
      const getActivityInfo = (type: string) => {
        switch (type) {
          case 'PushEvent':
            return {
              action: "fez um commit",
              icon: <MessageCircle className="h-4 w-4 text-blue-600" />
            };
          case 'CreateEvent':
            return {
              action: "criou um repositório",
              icon: <Star className="h-4 w-4 text-yellow-600" />
            };
          case 'WatchEvent':
            return {
              action: "favoritou um projeto",
              icon: <Star className="h-4 w-4 text-yellow-600" />
            };
          case 'ForkEvent':
            return {
              action: "fez um fork",
              icon: <Users className="h-4 w-4 text-purple-600" />
            };
          default:
            return {
              action: "atividade no GitHub",
              icon: <MessageCircle className="h-4 w-4 text-gray-600" />
            };
        }
      };

      const activityInfo = getActivityInfo(activity.type);
      const repoName = activity.repo?.split('/')[1] || 'repositório';
      
      // Calcular tempo relativo
      const now = new Date();
      const activityDate = new Date(activity.created_at);
      const diffInMs = now.getTime() - activityDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);
      
      let timeAgo;
      if (diffInHours < 1) {
        timeAgo = 'há poucos minutos';
      } else if (diffInHours < 24) {
        timeAgo = `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
      } else if (diffInDays < 7) {
        timeAgo = `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
      } else {
        timeAgo = activityDate.toLocaleDateString('pt-BR');
      }

      return {
        id: index + 1,
        type: activity.type.toLowerCase(),
        action: activityInfo.action,
        title: repoName,
        time: timeAgo,
        icon: activityInfo.icon,
        url: activity.url
      };
    });
  };

  const recentActivity = getRecentActivity();

  const stats = {
    profileViews: 1247, // Mock data - could be tracked in database
    projectViews: githubData?.stats?.projects || 0,
    connections: githubData?.stats?.followers || 0,
    endorsements: githubData?.stats?.stars || 0
  };

  // Loading state
  if (privacyLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações de Contato */}
      {isVisible('showContact') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                {t('profile.sidebar.contact')}
                {editingSection === 'contact' && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    <Edit3 className="h-3 w-3 mr-1" />
                    Editando
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editingSection === 'contact' ? stopEditSection() : startEditSection('contact')}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingSection === 'contact' ? (
              // Modo de edição
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Email"
                      value={editedContact.email}
                      onChange={(e) => setEditedContact(prev => ({ ...prev, email: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Telefone"
                      value={editedContact.phone}
                      onChange={(e) => setEditedContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Localização"
                      value={editedContact.location}
                      onChange={(e) => setEditedContact(prev => ({ ...prev, location: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Website"
                      value={editedContact.website}
                      onChange={(e) => setEditedContact(prev => ({ ...prev, website: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Github className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="GitHub URL"
                      value={editedContact.github}
                      onChange={(e) => setEditedContact(prev => ({ ...prev, github: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="LinkedIn URL"
                      value={editedContact.linkedin}
                      onChange={(e) => setEditedContact(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Twitter className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Twitter URL"
                      value={editedContact.twitter}
                      onChange={(e) => setEditedContact(prev => ({ ...prev, twitter: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Botões de ação para edição */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={saveContactData} size="sm" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={cancelContactEdit} variant="outline" size="sm" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              // Modo de visualização
              <div className="space-y-3">
                {contactInfo.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}
                
                {contactInfo.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`tel:${contactInfo.phone}`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                )}
                
                {contactInfo.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {contactInfo.location}
                    </span>
                  </div>
                )}
                
                {contactInfo.website && contactInfo.website !== "https://gabriel.dev" && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a 
                      href={contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      {contactInfo.website}
                    </a>
                  </div>
                )}
              </div>
            )}
          
          {/* Botões de Ação */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button className="w-full" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              {t('profile.sidebar.sendMessage')}
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {t('profile.sidebar.scheduleMeeting')}
            </Button>
          </div>
          
          {/* Links Sociais */}
          <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {contactInfo.social.github && (
              <a 
                href={contactInfo.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="GitHub"
              >
                <Github className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </a>
            )}
            {contactInfo.social.linkedin && (
              <a 
                href={contactInfo.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </a>
            )}
            {contactInfo.social.twitter && (
              <a 
                href={contactInfo.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Twitter"
              >
                <Twitter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </a>
            )}
          </div>
        </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            {t('profile.sidebar.statistics')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.profileViews}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.sidebar.views')}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.projectViews}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.sidebar.projects')}</div>
            </div>
            {isVisible('showFollowers') && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.connections}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.sidebar.connections')}</div>
              </div>
            )}
            {isVisible('showStars') && (
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.endorsements}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.sidebar.endorsements')}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      {isVisible('showAchievements') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              {t('profile.sidebar.achievements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className={`w-8 h-8 ${achievement.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                  <div className={achievement.color}>
                    {achievement.icon}
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {achievement.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {achievement.earned}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
        </Card>
      )}

      {/* Atividade Recente */}
      {isVisible('showRepositories') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                {t('profile.sidebar.recentActivity')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Limpar cache e forçar atualização
                  localStorage.removeItem('github-profile-data');
                  localStorage.removeItem('github-profile-last-sync');
                  window.location.reload();
                }}
                className="text-xs text-purple-600 hover:text-purple-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{activity.action}</span>
                  </p>
                  {activity.url ? (
                    <a
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600 transition-colors truncate block"
                    >
                      {activity.title}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              asChild
            >
              <a
                href={githubData?.social?.github || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver Todas as Atividades no GitHub
              </a>
            </Button>
          </div>
        </CardContent>
        </Card>
      )}
    </div>
  );
};
