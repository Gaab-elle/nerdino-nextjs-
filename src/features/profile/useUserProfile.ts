'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSettings } from '@/features/settings/useSettings';

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
      name: (settings as any)?.name || session?.user?.name || '',
      username: (settings as any)?.username || session?.user?.username || '',
      email: (settings as any)?.email || session?.user?.email || '',
      phone: (settings as any)?.phone || '',
      bio: (settings as any)?.bio || '',
      location: (settings as any)?.location || '',
      website: (settings as any)?.website || '',
      github: (settings as any)?.github || '',
      linkedin: (settings as any)?.linkedin || '',
      twitter: (settings as any)?.twitter || '',
      avatar: (settings as any)?.avatar || session?.user?.avatar_url || '',
      title: (settings as any)?.title || 'FullStack Developer',
      company: (settings as any)?.company || '',
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
