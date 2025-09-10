'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSettings } from './useSettings';

export interface UserProfileData {
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio: string;
  location: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  avatar?: string;
  title?: string;
  company?: string;
}

export function useUserProfile() {
  const { data: session } = useSession();
  const { settings, loading: settingsLoading } = useSettings();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settingsLoading) return;

    // Combinar dados da sessão com configurações salvas
    const userData: UserProfileData = {
      name: settings?.name || session?.user?.name || '',
      username: settings?.username || session?.user?.username || '',
      email: settings?.email || session?.user?.email || '',
      phone: settings?.phone || '',
      bio: settings?.bio || '',
      location: settings?.location || '',
      website: settings?.website || '',
      github: settings?.github || '',
      linkedin: settings?.linkedin || '',
      twitter: settings?.twitter || '',
      avatar: settings?.avatar || session?.user?.avatar_url || '',
      title: settings?.title || 'FullStack Developer',
      company: settings?.company || '',
    };

    setProfileData(userData);
    setLoading(false);
  }, [settings, session, settingsLoading]);

  return {
    profileData,
    loading,
    hasData: !!profileData?.name || !!profileData?.email,
  };
}
