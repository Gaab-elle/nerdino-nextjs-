'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, Camera, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';

interface ProfileSettingsProps {
  settings?: any;
  onSettingsChange?: (settings: any) => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  settings, 
  onSettingsChange, 
  onUnsavedChanges 
}) => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  
  const [formData, setFormData] = useState({
    name: settings?.name || user?.name || '',
    username: settings?.username || user?.username || '',
    email: settings?.email || user?.email || '',
    phone: settings?.phone || '',
    bio: settings?.bio || '',
    location: settings?.location || '',
    website: settings?.website || '',
    github: settings?.github || '',
    linkedin: settings?.linkedin || '',
    twitter: settings?.twitter || '',
    portfolio: settings?.portfolio || ''
  });

  // Atualizar formData quando settings ou user mudarem
  useEffect(() => {
    setFormData({
      name: settings?.name || user?.name || '',
      username: settings?.username || user?.username || '',
      email: settings?.email || user?.email || '',
      phone: settings?.phone || '',
      bio: settings?.bio || '',
      location: settings?.location || '',
      website: settings?.website || '',
      github: settings?.github || '',
      linkedin: settings?.linkedin || '',
      twitter: settings?.twitter || '',
      portfolio: settings?.portfolio || ''
    });
  }, [settings, user]);

  const [avatar, setAvatar] = useState(user?.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Salvar nas configurações
    if (onSettingsChange) {
      onSettingsChange({ ...settings, [field]: value });
    }
    
    onUnsavedChanges(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newAvatarUrl = URL.createObjectURL(file);
      setAvatar(newAvatarUrl);
      onUnsavedChanges(true);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === user?.username) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Mock availability check
      setUsernameAvailable(username.length >= 3 && !username.includes(' '));
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    handleInputChange('username', value);
    checkUsernameAvailability(value);
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Profile Picture */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} alt={formData.name} />
              <AvatarFallback>
                {formData.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700">
              <Camera className="h-4 w-4" />
              <input
                id="avatar-upload"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.profile.avatar.title')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('settings.profile.avatar.description')}
            </p>
            {isUploading && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {t('settings.profile.avatar.uploading')}
              </p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.profile.basicInfo.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                {t('settings.profile.basicInfo.name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder={t('settings.profile.basicInfo.namePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                @{t('settings.profile.basicInfo.username')}
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder={t('settings.profile.basicInfo.usernamePlaceholder')}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  </div>
                )}
                {usernameAvailable !== null && !isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {usernameAvailable ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {usernameAvailable !== null && !isCheckingUsername && (
                <p className={`text-xs mt-1 ${
                  usernameAvailable 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {usernameAvailable 
                    ? t('settings.profile.basicInfo.usernameAvailable')
                    : t('settings.profile.basicInfo.usernameUnavailable')
                  }
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                {t('settings.profile.basicInfo.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder={t('settings.profile.basicInfo.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                {t('settings.profile.basicInfo.phone')}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder={t('settings.profile.basicInfo.phonePlaceholder')}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                {t('settings.profile.basicInfo.location')}
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder={t('settings.profile.basicInfo.locationPlaceholder')}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.profile.basicInfo.bio')}
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                placeholder={t('settings.profile.basicInfo.bioPlaceholder')}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio.length}/500 {t('settings.profile.basicInfo.characters')}
              </p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.profile.socialLinks.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                {t('settings.profile.socialLinks.website')}
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="https://seu-site.com"
              />
            </div>

            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Github className="h-4 w-4 inline mr-1" />
                GitHub
              </label>
              <input
                id="github"
                name="github"
                type="url"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="https://github.com/seu-usuario"
              />
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Linkedin className="h-4 w-4 inline mr-1" />
                LinkedIn
              </label>
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Twitter className="h-4 w-4 inline mr-1" />
                Twitter
              </label>
              <input
                id="twitter"
                name="twitter"
                type="url"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="https://twitter.com/seu-usuario"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.profile.privacy.title')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.profile.privacy.publicProfile')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.profile.privacy.publicProfileDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.profile.privacy.showStats')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.profile.privacy.showStatsDescription')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
