'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { ConversationsList } from '@/components/messages/ConversationsList';
import { ChatArea } from '@/components/messages/ChatArea';
import { ContactInfo } from '@/components/messages/ContactInfo';
import { WelcomeScreen } from '@/components/messages/WelcomeScreen';
import { ConnectionStatus } from '@/components/messages/ConnectionStatus';
import { useConversations } from '@/hooks/useConversations';
import { Conversation } from '@/types/messages';

export default function MessagesPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use the conversations hook
  const { 
    conversations, 
    loading: conversationsLoading, 
    error: conversationsError,
    markAsRead 
  } = useConversations();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle conversation selection and mark as read
  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read when conversation is selected
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      await markAsRead(conversation.id);
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex justify-end">
            <ConnectionStatus />
          </div>
        </div>
        <div className="flex h-[calc(100vh-96px)]">
          {/* Conversations List - Always visible on desktop, conditional on mobile */}
          <div className={`${isMobile ? (selectedConversation ? 'hidden' : 'flex') : 'flex'} w-full lg:w-80 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}>
            <ConversationsList 
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              loading={conversationsLoading}
              error={conversationsError}
            />
          </div>

          {/* Chat Area - Hidden on mobile when no conversation selected */}
          <div className={`${isMobile ? (selectedConversation ? 'flex' : 'hidden') : 'flex'} flex-1 flex-col`}>
            {selectedConversation ? (
              <ChatArea 
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
                isMobile={isMobile}
              />
            ) : (
              <WelcomeScreen />
            )}
          </div>

          {/* Contact Info - Only visible on desktop */}
          {!isMobile && selectedConversation && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <ContactInfo conversation={selectedConversation} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
