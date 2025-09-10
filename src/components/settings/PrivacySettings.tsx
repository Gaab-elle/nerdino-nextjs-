'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';

interface PrivacySettingsProps {
  onSettingsChange?: (settings: any) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

export default function PrivacySettings({ onSettingsChange }: PrivacySettingsProps) {
  const [settings, setSettings] = useState({
    showStars: true,
    showFollowers: true,
    showContact: true,
    showAchievements: true,
    showCertifications: true,
    showExperience: true,
    showRepositories: true,
    showSkills: true
  });

  const [isLoading, setIsLoading] = useState(false);

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    const savedSettings = localStorage.getItem('nerdino-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const privacySettings = parsed.privacyVisibility || parsed;
        setSettings(privacySettings);
        console.log('✅ Configurações carregadas:', privacySettings);
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const handleToggle = (field: keyof typeof settings) => {
    console.log(`🔄 Alternando ${field}`);
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [field]: !prev[field]
      };
      console.log('📝 Novo estado:', newSettings);
      return newSettings;
    });
  };

  const handleSave = async () => {
    if (isLoading) return; // Prevenir cliques múltiplos
    
    setIsLoading(true);
    console.log('💾 Salvando configurações:', settings);

    try {
      // Carregar configurações existentes
      const existingSettings = localStorage.getItem('nerdino-settings');
      const parsedExisting = existingSettings ? JSON.parse(existingSettings) : {};
      
      // Atualizar apenas a seção de privacidade
      const updatedSettings = {
        ...parsedExisting,
        privacyVisibility: settings
      };
      
      // Salvar no localStorage com a chave correta
      localStorage.setItem('nerdino-settings', JSON.stringify(updatedSettings));
      
      // Disparar evento para outros componentes
      window.dispatchEvent(new CustomEvent('privacySettingsChanged', {
        detail: settings
      }));

      // Feedback visual
      console.log('✅ Configurações salvas com sucesso!');
      
      // Atualizar página após salvar
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const privacyItems: Array<{
    key: keyof typeof settings;
    label: string;
    description: string;
  }> = [
    {
      key: 'showStars',
      label: 'Exibir stars dos projetos',
      description: 'Mostra o número de estrelas dos seus repositórios',
    },
    {
      key: 'showFollowers',
      label: 'Exibir número de seguidores',
      description: 'Mostra quantas pessoas te seguem',
    },
    {
      key: 'showContact',
      label: 'Exibir informações de contato',
      description: 'Mostra suas informações de contato',
    },
    {
      key: 'showAchievements',
      label: 'Exibir conquistas/badges',
      description: 'Mostra suas conquistas e badges',
    },
    {
      key: 'showCertifications',
      label: 'Exibir certificações',
      description: 'Mostra suas certificações profissionais',
    },
    {
      key: 'showExperience',
      label: 'Exibir experiências profissionais',
      description: 'Mostra seu histórico profissional',
    },
    {
      key: 'showRepositories',
      label: 'Exibir repositórios/projetos',
      description: 'Mostra seus projetos e repositórios',
    },
    {
      key: 'showSkills',
      label: 'Exibir skills/tecnologias',
      description: 'Mostra suas habilidades técnicas',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" />
          Privacidade e Visibilidade do Perfil
        </CardTitle>
        <CardDescription>
          Controle exatamente o que aparece no seu perfil público
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {privacyItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {settings[item.key] ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <div>
                  <Label htmlFor={item.key} className="text-sm font-medium">
                    {item.label}
                  </Label>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={settings[item.key]}
              onCheckedChange={() => handleToggle(item.key)}
            />
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Unlock className="h-4 w-4" />
              <span>
                {Object.values(settings).filter(Boolean).length} de {privacyItems.length} itens visíveis
              </span>
            </div>
            
            {/* APENAS UM BOTÃO DE SALVAR */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-6 py-2 text-white rounded-lg transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}