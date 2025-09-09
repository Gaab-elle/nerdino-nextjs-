'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSSE } from '@/hooks/useSSE';
import { MessageNotification, useMessageNotifications } from '@/components/messages/MessageNotification';

interface NotificationContextType {
  // Message notifications (existing)
  messageNotifications: any[];
  addMessageNotification: (notification: any) => void;
  removeMessageNotification: (index: number) => void;
  clearAllMessageNotifications: () => void;
  
  // General notifications (new)
  generalNotifications: any[];
  addGeneralNotification: (notification: any) => void;
  removeGeneralNotification: (index: number) => void;
  clearAllGeneralNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isConnected, messages: sseMessages } = useSSE();
  const {
    notifications: messageNotifications,
    addNotification: addMessageNotification,
    removeNotification: removeMessageNotification,
    clearAllNotifications: clearAllMessageNotifications,
  } = useMessageNotifications();

  // General notifications state
  const [generalNotifications, setGeneralNotifications] = useState<any[]>([]);

  const addGeneralNotification = (notification: any) => {
    setGeneralNotifications(prev => [...prev, notification]);
  };

  const removeGeneralNotification = (index: number) => {
    setGeneralNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllGeneralNotifications = () => {
    setGeneralNotifications([]);
  };

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    // Processar mensagens SSE para notificações de mensagem
    sseMessages.forEach(message => {
      if (message.type === 'new_message' && message.sender?.id !== session.user.id && message.conversationId) {
        addMessageNotification({
          conversationId: message.conversationId,
          message: message.message,
          sender: message.sender,
          recipientId: session.user.id,
        });
      }
    });

    // Processar notificações gerais via SSE
    sseMessages.forEach(message => {
      if (message.type === 'notification') {
        addGeneralNotification({
          id: message.data?.id || Date.now(),
          type: message.type,
          title: message.data?.title || 'Nova notificação',
          content: message.data?.content || 'Você tem uma nova notificação',
          timestamp: new Date(),
        });
      }
    });
  }, [sseMessages, session?.user?.id, addMessageNotification, addGeneralNotification]);

  return (
    <NotificationContext.Provider
      value={{
        messageNotifications,
        addMessageNotification,
        removeMessageNotification,
        clearAllMessageNotifications,
        generalNotifications,
        addGeneralNotification,
        removeGeneralNotification,
        clearAllGeneralNotifications,
      }}
    >
      {children}
      
      {/* Renderizar notificações de mensagem */}
      {messageNotifications.map((notification, index) => (
        <MessageNotification
          key={`${notification.conversationId}-${notification.message.id}-${index}`}
          notification={notification}
          onClose={() => removeMessageNotification(index)}
        />
      ))}

      {/* Renderizar notificações gerais */}
      {generalNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="fixed top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.content}
              </p>
            </div>
            <button
              onClick={() => removeGeneralNotification(index)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
