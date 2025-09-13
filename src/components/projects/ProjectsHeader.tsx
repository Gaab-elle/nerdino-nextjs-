'use client';

import React, { useState } from 'react';
import { Plus, BarChart3, Github, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHub } from '@/hooks/useGitHub';
import { GitHubReconnectButton } from '@/components/auth/GitHubReconnectButton';

interface ProjectsHeaderProps {
  onNewProject?: () => void;
  onSyncGitHub?: () => void;
}

export const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({ 
  onNewProject, 
  onSyncGitHub 
}) => {
  const { t } = useLanguage();
  const { isConnected, isLoading, syncGitHub } = useGitHub();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showReconnect, setShowReconnect] = useState(false);

  const handleNewProject = () => {
    console.log('🆕 Criando novo projeto...');
    if (onNewProject) {
      onNewProject();
    } else {
      // Fallback: mostrar modal ou redirecionar
      alert('Funcionalidade de criar projeto será implementada em breve!');
    }
  };

  const handleSyncGitHub = async () => {
    try {
      setIsSyncing(true);
      console.log('🔄 Sincronizando com GitHub...');
      
      await syncGitHub();
      
      if (onSyncGitHub) {
        onSyncGitHub();
      }
      
      console.log('✅ Sincronização com GitHub concluída!');
    } catch (error: unknown) {
      console.error('❌ Erro ao sincronizar com GitHub:', error);
      
      // Mostrar mensagem de erro mais específica
      let errorMessage = 'Erro ao sincronizar com GitHub. Tente novamente.';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = (error as { message: string }).message;
        if (errorMsg.includes('GitHub não conectado')) {
          errorMessage = 'GitHub não conectado. Vá para as configurações e conecte sua conta GitHub.';
        } else if (errorMsg.includes('Token de acesso GitHub expirado') || 
                   errorMsg.includes('Credenciais GitHub inválidas') ||
                   errorMsg.includes('token is invalid or expired')) {
          errorMessage = 'Token do GitHub expirado. Reconecte sua conta GitHub.';
          setShowReconnect(true);
        } else if (errorMsg.includes('Limite de requisições')) {
          errorMessage = 'Muitas requisições para o GitHub. Tente novamente em alguns minutos.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Title and Description */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('projects.header.title')}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('projects.header.subtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('projects.header.analytics')}
            </Button>
            
            {/* Botão de Sincronização GitHub ou Reconexão */}
            {showReconnect ? (
              <GitHubReconnectButton 
                onReconnect={() => setShowReconnect(false)}
                className="border-red-500 text-red-600 hover:bg-red-50"
              />
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSyncGitHub}
                disabled={isSyncing || isLoading}
                className={isConnected ? 'border-green-500 text-green-600 hover:bg-green-50' : ''}
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Github className="h-4 w-4 mr-2" />
                )}
                {isSyncing ? 'Sincronizando...' : 'Sincronizar GitHub'}
              </Button>
            )}
            
            {/* Botão Novo Projeto */}
            <Button size="sm" onClick={handleNewProject}>
              <Plus className="h-4 w-4 mr-2" />
              {t('projects.header.newProject')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
