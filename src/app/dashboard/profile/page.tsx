'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { ProfileHeader } from '@/features/profile/ProfileHeader';
import { AboutSection } from '@/features/profile/AboutSection';
import { SkillsSection } from '@/features/profile/SkillsSection';
import { ProfileProjectsManager } from '@/features/profile/ProfileProjectsManager';
import { ExperienceTimeline } from '@/features/profile/ExperienceTimeline';
import { ProfileSidebar } from '@/features/profile/ProfileSidebar';
import { GitHubRepos } from '@/features/profile/GitHubRepos';
import { GitHubLanguages } from '@/features/profile/GitHubLanguages';
import { ProfileEditProvider, useProfileEdit } from '@/contexts/ProfileEditContext';
import { useProfileData } from '@/hooks/useProfileData';

// Componente interno que usa o contexto de edição
const ProfileContent: React.FC = () => {
  const { profileData, hasExperience, hasEducation, hasCertifications } = useProfileData();
  const { isEditing, editingSection } = useProfileEdit();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Impactante */}
        <ProfileHeader />
      
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sobre */}
              <AboutSection />
              
              {/* Habilidades */}
              <SkillsSection />
              
              {/* Projetos em Destaque */}
              <ProfileProjectsManager />
              
              {/* Experiência - Só mostra se tiver dados ou estiver editando */}
              {(hasExperience() || isEditing || editingSection === 'experience') && <ExperienceTimeline />}
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              <ProfileSidebar />
              <GitHubLanguages />
              <GitHubRepos />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function ProfilePage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading or nothing while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <ProfileEditProvider>
      <ProfileContent />
    </ProfileEditProvider>
  );
}
