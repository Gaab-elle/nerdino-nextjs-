'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SettingsData {
  [key: string]: any;
}

export function useSettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Carregar configurações do servidor
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Sempre tentar carregar do servidor primeiro
      const response = await fetch('/api/settings');
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 API Response:', data);
        console.log('🔍 Message check:', data.message === "No session - use localStorage");
        console.log('🔍 Settings empty check:', !data.settings || Object.keys(data.settings).length === 0);
        
        // Se não há sessão e settings está vazio, carregar do localStorage
        if (data.message === "No session - use localStorage" && (!data.settings || Object.keys(data.settings).length === 0)) {
          const savedSettings = localStorage.getItem('nerdino-settings');
          console.log('🔍 Checking localStorage for settings:', savedSettings);
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            setSettings(parsedSettings);
            console.log('✅ Settings loaded from localStorage (no session):', parsedSettings);
          } else {
            setSettings({});
            console.log('❌ No settings found in localStorage');
          }
        } else {
          const serverSettings = data.settings || {};
          // Sempre priorizar localStorage para privacyVisibility
          const savedSettings = localStorage.getItem('nerdino-settings');
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            // Mesclar configurações do servidor com localStorage, priorizando localStorage para privacyVisibility
            const mergedSettings = { 
              ...serverSettings, 
              ...parsedSettings,
              privacyVisibility: parsedSettings.privacyVisibility || serverSettings.privacyVisibility
            };
            setSettings(mergedSettings);
            console.log('✅ Settings merged (server + localStorage, localStorage priority):', mergedSettings);
          } else {
            setSettings(serverSettings);
            console.log('✅ Settings loaded from server:', serverSettings);
          }
        }
      } else if (response.status === 401) {
        // Usuário não autenticado, usar localStorage como fallback
        const savedSettings = localStorage.getItem('nerdino-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          console.log('Settings loaded from localStorage:', parsedSettings);
        } else {
          console.log('No settings found in localStorage');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback para localStorage em caso de erro
      const savedSettings = localStorage.getItem('nerdino-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        console.log('Settings loaded from localStorage (fallback):', parsedSettings);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para recarregar configurações
  const reloadSettings = () => {
    loadSettings();
  };

  // Salvar configurações no servidor
  const saveSettings = async (newSettings?: SettingsData) => {
    console.log('saveSettings called with:', newSettings);
    console.log('Current settings:', settings);
    console.log('Session user ID:', session?.user?.id);
    
    // Sempre tentar salvar no servidor primeiro, mesmo sem sessão
    try {
      setSaving(true);
      const payload = { settings: newSettings || settings };
      console.log('Sending payload:', payload);
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Settings saved successfully:', data);
        setSettings(data.settings || newSettings || settings);
        setHasUnsavedChanges(false);
        // Também salvar no localStorage como backup
        localStorage.setItem('nerdino-settings', JSON.stringify(newSettings || settings));
        return true;
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Fallback para localStorage em caso de erro
      console.log('Falling back to localStorage');
      localStorage.setItem('nerdino-settings', JSON.stringify(newSettings || settings));
      setSettings(newSettings || settings);
      setHasUnsavedChanges(false);
      return true;
    } finally {
      setSaving(false);
    }
  };

  // Atualizar uma configuração específica
  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  // Atualizar múltiplas configurações
  const updateSettings = (updates: SettingsData) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  // Carregar configurações sempre
  useEffect(() => {
    const loadAllSettings = () => {
      // Carregar configurações do servidor
      loadSettings();
      
      // Carregar configurações de privacidade do localStorage
      const localPrivacySettings = localStorage.getItem('nerdino-settings');
      const parsedPrivacySettings = localPrivacySettings 
        ? JSON.parse(localPrivacySettings) 
        : null;

      // MERGE correto das configurações - priorizar localStorage
      setSettings(prevSettings => {
        const mergedSettings = {
          ...prevSettings,
          privacyVisibility: parsedPrivacySettings?.privacyVisibility || {
            showStars: true,
            showFollowers: true,
            showContact: true,
            showAchievements: true,
            showCertifications: true,
            showExperience: true,
            showRepositories: true,
            showSkills: true
          }
        };
        console.log('🔄 Merged settings (localStorage priority):', mergedSettings);
        console.log('🔄 privacyVisibility:', mergedSettings.privacyVisibility);
        console.log('🔄 showStars:', mergedSettings.privacyVisibility?.showStars);
        console.log('🔄 showFollowers:', mergedSettings.privacyVisibility?.showFollowers);
        console.log('🔄 showStars type:', typeof mergedSettings.privacyVisibility?.showStars);
        console.log('🔄 showFollowers type:', typeof mergedSettings.privacyVisibility?.showFollowers);
        return mergedSettings;
      });
    };

    loadAllSettings();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nerdino-settings') {
        console.log('🔄 Storage change detected, reloading settings');
        loadAllSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event para mudanças na mesma aba
    const handlePrivacySettingsChanged = () => {
      console.log('🔄 Privacy settings changed event detected');
      loadAllSettings();
    };

    window.addEventListener('privacySettingsChanged', handlePrivacySettingsChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('privacySettingsChanged', handlePrivacySettingsChanged);
    };
  }, []);

  return {
    settings,
    loading,
    saving,
    hasUnsavedChanges,
    updateSetting,
    updateSettings,
    saveSettings,
    loadSettings,
    reloadSettings,
  };
}
