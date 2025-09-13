'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Edit3, Star, ExternalLink, Github, Calendar, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { useProfileProjects } from '@/hooks/useProfileProjects';

export const ProfileProjectsManager: React.FC = () => {
  const { t } = useLanguage();
  const { editingSection, startEditSection, stopEditSection } = useProfileEdit();
  const { projects, visibleProjects, loading, error, updateProjectVisibility } = useProfileProjects();
  const [updating, setUpdating] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const handleVisibilityToggle = (projectId: string, currentVisibility: boolean) => {
    // Rastrear mudanças pendentes
    setPendingChanges(prev => ({
      ...prev,
      [projectId]: !currentVisibility
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    let allSuccess = true;

    try {
      // Salvar todas as mudanças pendentes
      for (const [projectId, newVisibility] of Object.entries(pendingChanges)) {
        const success = await updateProjectVisibility(projectId, newVisibility);
        if (!success) {
          allSuccess = false;
        }
      }

      if (allSuccess) {
        // Limpar mudanças pendentes
        setPendingChanges({});
        // Sair do modo de edição
        stopEditSection();
      } else {
        console.error('Some changes failed to save');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChanges = () => {
    // Limpar mudanças pendentes
    setPendingChanges({});
    // Sair do modo de edição
    stopEditSection();
  };

  const getProjectVisibility = (projectId: string, originalVisibility: boolean) => {
    // Se há mudança pendente, usar o valor pendente, senão usar o original
    return pendingChanges.hasOwnProperty(projectId) ? pendingChanges[projectId] : originalVisibility;
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  const isEditing = editingSection === 'projects';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            {t('profile.projects.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando projetos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            {t('profile.projects.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            {t('profile.projects.title')}
            {isEditing && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Editando
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isEditing && hasPendingChanges ? (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  {Object.keys(pendingChanges).length} alteração(ões) pendente(s)
                </span>
              ) : (
                `${visibleProjects.length} de ${projects.length} visíveis`
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => isEditing ? handleCancelChanges() : startEditSection('projects')}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isEditing 
            ? 'Gerencie quais projetos aparecem no seu perfil público'
            : t('profile.projects.subtitle')
          }
        </p>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          // Modo de edição - lista com controles de visibilidade
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                {/* Project Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {project.stars}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {project.lastUpdate}
                    </div>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {project.status}
                    </Badge>
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const currentVisibility = getProjectVisibility(project.id, project.isVisible);
                    const hasPendingChange = pendingChanges.hasOwnProperty(project.id);
                    
                    return (
                      <>
                        {currentVisibility ? (
                          <Eye className={`h-4 w-4 ${hasPendingChange ? 'text-orange-600' : 'text-green-600'}`} />
                        ) : (
                          <EyeOff className={`h-4 w-4 ${hasPendingChange ? 'text-orange-600' : 'text-gray-400'}`} />
                        )}
                        <Switch
                          checked={currentVisibility}
                          onCheckedChange={() => handleVisibilityToggle(project.id, project.isVisible)}
                          disabled={saving}
                        />
                        {hasPendingChange && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full" title="Alteração pendente" />
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
            
            {/* Botões de ação quando editando */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleCancelChanges}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={saving || !hasPendingChanges}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    `Salvar ${Object.keys(pendingChanges).length} alteração(ões)`
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Modo de visualização - grid de projetos visíveis
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleProjects.length > 0 ? (
              visibleProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
                >
                  {/* Project Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-purple-600 text-white">
                          Destaque
                        </Badge>
                      </div>
                    )}

                    {/* Stats Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{project.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{project.lastUpdate}</span>
                      </div>
                      <Badge 
                        variant={project.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 transition-colors">
                      {project.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {project.demoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1"
                        >
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Ver Demo
                          </a>
                        </Button>
                      )}
                      
                      {project.githubUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1"
                        >
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <Github className="h-4 w-4" />
                            Código
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhum projeto visível
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Clique em &quot;Editar&quot; para tornar alguns projetos visíveis no seu perfil.
                </p>
                <Button
                  variant="outline"
                  onClick={() => startEditSection('projects')}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Gerenciar Projetos
                </Button>
              </div>
            )}
          </div>
        )}

        {/* View All Projects Button */}
        {!isEditing && visibleProjects.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              asChild
              className="px-8"
            >
              <a
                href="/dashboard/projects"
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                Ver Todos os Projetos
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
