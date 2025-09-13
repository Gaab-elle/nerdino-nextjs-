'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Palette, Layout, Grid, List, Star, Calendar } from 'lucide-react';
import { useSettings } from '@/features/settings/useSettings';

interface AppearanceSettingsProps {
  onSettingsChange?: (settings: AppearanceSettings) => void;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

interface AppearanceSettings {
  featuredProject: string;
  projectsCount: number;
  projectsLayout: 'grid' | 'list';
  experienceCount: number;
  experienceOrder: 'newest' | 'oldest';
  profileTheme: 'light' | 'dark' | 'auto';
  accentColor: string;
}

export default function AppearanceSettings({ onSettingsChange }: AppearanceSettingsProps) {
  const { settings: globalSettings, updateSetting } = useSettings();
  
  const [settings, setSettings] = useState<AppearanceSettings>({
    featuredProject: 'all',
    projectsCount: 4,
    projectsLayout: 'grid',
    experienceCount: 3,
    experienceOrder: 'newest',
    profileTheme: 'auto',
    accentColor: 'blue',
  });

  // Carregar configurações do contexto global
  useEffect(() => {
    if (globalSettings.appearanceLayout) {
      setSettings({ ...settings, ...globalSettings.appearanceLayout });
    }
  }, [globalSettings.appearanceLayout]);

  const handleSettingChange = (key: keyof AppearanceSettings, value: string | boolean | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Atualizar no contexto global
    updateSetting('appearanceLayout', newSettings);
    onSettingsChange?.(newSettings);
  };

  const accentColors = [
    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { value: 'green', label: 'Verde', color: 'bg-green-500' },
    { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
    { value: 'red', label: 'Vermelho', color: 'bg-red-500' },
    { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
    { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-600" />
          Aparência e Layout do Perfil
        </CardTitle>
        <CardDescription>
          Personalize como seu perfil é exibido
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Configurações de Projetos */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Star className="h-4 w-4" />
            Projetos em Destaque
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="featured-project">Projeto Principal</Label>
              <Select
                value={settings.featuredProject}
                onValueChange={(value) => handleSettingChange('featuredProject', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  <SelectItem value="nerdino-nextjs">NERDINO Next.js</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projects-count">Quantidade de Projetos</Label>
              <Select
                value={settings.projectsCount.toString()}
                onValueChange={(value) => handleSettingChange('projectsCount', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 projetos</SelectItem>
                  <SelectItem value="4">4 projetos</SelectItem>
                  <SelectItem value="6">6 projetos</SelectItem>
                  <SelectItem value="8">8 projetos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projects-layout">Layout dos Projetos</Label>
              <Select
                value={settings.projectsLayout}
                onValueChange={(value) => handleSettingChange('projectsLayout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">
                    <div className="flex items-center gap-2">
                      <Grid className="h-4 w-4" />
                      Grid
                    </div>
                  </SelectItem>
                  <SelectItem value="list">
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Lista
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Configurações de Experiências */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Experiências Profissionais
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience-count">Quantidade de Experiências</Label>
              <Select
                value={settings.experienceCount.toString()}
                onValueChange={(value) => handleSettingChange('experienceCount', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 experiência</SelectItem>
                  <SelectItem value="2">2 experiências</SelectItem>
                  <SelectItem value="3">3 experiências</SelectItem>
                  <SelectItem value="0">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience-order">Ordem de Exibição</Label>
              <Select
                value={settings.experienceOrder}
                onValueChange={(value) => handleSettingChange('experienceOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recente primeiro</SelectItem>
                  <SelectItem value="oldest">Mais antiga primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Configurações Visuais */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Configurações Visuais
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-theme">Tema do Perfil</Label>
              <Select
                value={settings.profileTheme}
                onValueChange={(value) => handleSettingChange('profileTheme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Cor de Destaque</Label>
              <div className="flex gap-2 flex-wrap">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleSettingChange('accentColor', color.value)}
                    className={`w-8 h-8 rounded-full ${color.color} border-2 ${
                      settings.accentColor === color.value 
                        ? 'border-gray-900 dark:border-white' 
                        : 'border-gray-300 dark:border-gray-600'
                    } hover:scale-110 transition-transform`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}