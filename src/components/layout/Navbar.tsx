'use client';

import React, { useState, useEffect } from 'react';
import { Menu, User, Settings, LogOut, LayoutDashboard, Bell, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogoImage } from '@/components/ui/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession, signOut } from 'next-auth/react';

export const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock notifications data
  const notifications = [
    { id: 1, message: 'Novo projeto adicionado ao seu portfólio', time: '2 min atrás', unread: true },
    { id: 2, message: 'Você recebeu um novo seguidor', time: '1 hora atrás', unread: true },
    { id: 3, message: 'Sua skill em React foi atualizada', time: '3 horas atrás', unread: false },
    { id: 4, message: 'Nova oportunidade de trabalho disponível', time: '1 dia atrás', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Debug: Log user state
  console.log('Navbar - User state:', user);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="w-full px-1 sm:px-2 lg:px-3">
        <div className="relative flex items-center h-16">
          {/* Logo */}
            <Link href="/game" className="flex items-center ml-16 hover:scale-105 transition-transform cursor-pointer">
              <div className="scale-125">
                <LogoImage size="2xl" showText={false} />
              </div>
            </Link>

          {/* Desktop Navigation - Perfectly Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
              {t('navbar.home')}
            </Link>
            {isClient && user && (
              <>
                <Link href="/community" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                  {t('navbar.community')}
                </Link>
                <Link href="/messages" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                  {t('navbar.messages')}
                </Link>
                <Link href="/opportunities" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                  {t('navbar.opportunities')}
                </Link>
              </>
            )}
            <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
              {t('navbar.contact')}
            </a>
          </div>

          {/* Right side - Language, Theme, User menu */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* Conditional rendering based on auth state */}
            {!isLoading && isClient && user ? (
              <>
                {/* Notifications */}
                <div className="relative dropdown-container">
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
                          Notificações
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
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                          Ver todas as notificações
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User is logged in - show profile menu */}
                <div className="relative dropdown-container mr-16">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.name || 'User'} />
                    <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-gray-700 dark:text-gray-300">
                    {user.name || 'Usuário'}
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
                        Perfil
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
                      <Link
                        href="/settings"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings size={16} className="mr-3" />
                        {t('navbar.settings')}
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button 
                        onClick={() => {
                          signOut();
                          setShowProfileMenu(false);
                          router.push('/');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </>
            ) : !isLoading ? (
              /* User is not logged in - show login/register buttons */
              <>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    {t('navbar.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    {t('hero.getStarted')}
                  </Button>
                </Link>
              </>
            ) : (
              /* Loading state - show nothing or loading indicator */
              <div className="w-8 h-8"></div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
