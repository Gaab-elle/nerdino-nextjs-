'use client';

import { useEffect } from 'react';
import { useSettings } from '@/features/settings/useSettings';

interface PrivacySettings {
  showStars: boolean;
  showFollowers: boolean;
  showContact: boolean;
  showAchievements: boolean;
  showCertifications: boolean;
  showExperience: boolean;
  showRepositories: boolean;
  showSkills: boolean;
}

export function usePrivacySettings() {
  const { settings, loading } = useSettings();
  
  // Configurações padrão (tudo visível)
  const defaultPrivacy: PrivacySettings = {
    showStars: true,
    showFollowers: true,
    showContact: true,
    showAchievements: true,
    showCertifications: true,
    showExperience: true,
    showRepositories: true,
    showSkills: true,
  };

  // CORRIGIDO: Usar as configurações do useSettings que já incluem localStorage
  const privacySettings = settings?.privacyVisibility;
  
  // Função para verificar se um campo deve ser visível
  const isVisible = (field: keyof PrivacySettings): boolean => {
    if (!privacySettings) {
      console.log('🚨 Configurações de privacidade não encontradas, usando padrão');
      return true; // padrão enquanto carrega
    }

    console.log(`🔍 Verificando visibilidade de ${field}:`, (privacySettings as any)?.[field]);
    // CORRIGIDO: Verificar se o valor é explicitamente true
    return (privacySettings as any)?.[field] === true;
  };

  const updatePrivacySettings = (newSettings: PrivacySettings) => {
    // Carregar configurações existentes
    const existingSettings = localStorage.getItem('nerdino-settings');
    const parsedExisting = existingSettings ? JSON.parse(existingSettings) : {};
    
    // Atualizar apenas a seção de privacidade
    const updatedSettings = {
      ...parsedExisting,
      privacyVisibility: newSettings
    };
    
    // Salvar no localStorage com a chave correta
    localStorage.setItem('nerdino-settings', JSON.stringify(updatedSettings));
    
    // Disparar evento para atualizar outras partes da aplicação
    window.dispatchEvent(new CustomEvent('privacySettingsChanged', {
      detail: newSettings
    }));
    
    console.log('💾 Privacy settings updated:', newSettings);
  };

  // Debug para testar
  useEffect(() => {
    console.log('🔍 Debug Privacy Settings:');
    console.log('localStorage (nerdino-settings):', localStorage.getItem('nerdino-settings'));
    console.log('settings from useSettings:', settings);
    console.log('privacySettings:', privacySettings);
    console.log('privacySettings type:', typeof privacySettings);
    console.log('privacySettings.showStars:', (privacySettings as any)?.showStars);
    console.log('privacySettings.showFollowers:', (privacySettings as any)?.showFollowers);
    console.log('isVisible showStars:', isVisible('showStars'));
    console.log('isVisible showFollowers:', isVisible('showFollowers'));
    
    // Teste direto
    if (privacySettings) {
      console.log('🧪 Teste direto:');
      console.log('showStars === true:', (privacySettings as any).showStars === true);
      console.log('showFollowers === true:', (privacySettings as any).showFollowers === true);
    }
  }, [settings, privacySettings]);

  return {
    settings: privacySettings,
    isVisible,
    updatePrivacySettings,
    loading,
  };
}