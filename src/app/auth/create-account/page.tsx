'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import AccountCreationWizard from '@/features/auth/AccountCreationWizard';

export default function CreateAccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Redirect if already logged in
  if (session) {
    router.push('/dashboard');
    return null;
  }

  const handleAccountCreation = async (profileData: {
    name: string;
    username: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
    skills: string[];
    interests: string[];
    experience: string;
    availability: string;
  }) => {
    setIsCreating(true);
    try {
      // Here you would integrate with your API to create the account
      console.log('Creating account with data:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to login or dashboard
      router.push('/login?message=account-created');
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AccountCreationWizard onComplete={handleAccountCreation} />
      </div>
    </>
  );
}
