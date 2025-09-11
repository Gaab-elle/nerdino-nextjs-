'use client';

import React, { useState, useEffect } from 'react';
import { Bell, User, Settings, LogOut, LayoutDashboard, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogoImage } from '@/components/ui/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession, signOut } from 'next-auth/react';

export const DashboardHeader: React.FC = () => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const notifications = [
    { id: 1, message: 'Novo comentário no seu projeto React Portfolio', time: '2 min atrás', unread: true },
    { id: 2, message: 'João Silva curtiu seu projeto', time: '1 hora atrás', unread: true },
    { id: 3, message: 'Convite para colaborar no projeto Open Source', time: '3 horas atrás', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="scale-[2.5]">
              <LogoImage size="lg" showText={false} />
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Welcome message */}
            <div className="hidden md:block">
              <span className="text-gray-600 dark:text-gray-400">
                {t('dashboard.welcome')}, <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {isClient ? (user?.name || 'Desenvolvedor') : 'Desenvolvedor'}
                </span>!
              </span>
            </div>

            {/* Community Link */}
            <Link href="/community" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
              COMUNIDADE
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('dashboard.notifications')}
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={isClient ? (user?.avatar_url || undefined) : undefined} alt={isClient ? (user?.name || 'User') : 'User'} />
                  <AvatarFallback>{isClient ? (user?.name?.charAt(0) || 'U') : 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-gray-700 dark:text-gray-300">
                  {isClient ? (user?.name || 'Usuário') : 'Usuário'}
                </span>
              </Button>

              {/* Profile dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-1">
                    <Link 
                      href="/profile"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User size={16} className="mr-3" />
                      {t('dashboard.profile')}
                    </Link>
                    <Link 
                      href="/dashboard"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <LayoutDashboard size={16} className="mr-3" />
                      Dashboard
                    </Link>
                    <Link 
                      href="/projects"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FolderOpen size={16} className="mr-3" />
                      {t('navbar.projects')}
                    </Link>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Settings size={16} className="mr-3" />
                      {t('dashboard.quickActions.settings')}
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button 
                      onClick={() => {
                        signOut();
                        router.push('/');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut size={16} className="mr-3" />
                      {t('dashboard.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
