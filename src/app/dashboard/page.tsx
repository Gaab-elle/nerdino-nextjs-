'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FeaturedProjects } from '@/components/dashboard/FeaturedProjects';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ProgressSection } from '@/components/dashboard/ProgressSection';
import { OpportunitiesSection } from '@/components/dashboard/OpportunitiesSection';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
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

  // Show loading while checking auth
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Projects */}
            <FeaturedProjects onProjectAdded={() => {}} />
            
            {/* Activity Feed */}
            <ActivityFeed />
            
            {/* Opportunities Section */}
            <OpportunitiesSection />
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Progress Section */}
            <ProgressSection />
          </div>
        </div>
      </div>
    </div>
  );
}
