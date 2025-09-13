'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSSE } from '@/hooks/useSSE';
import { MessageNotification, useMessageNotifications } from '@/features/messages/MessageNotification';
import { NotificationAdapter } from '@/adapters/notificationAdapter';
import { SSEMessage, MessageNotification as SSEMessageNotification, GeneralNotification } from '@/schemas/notifications';

interface NotificationContextType {
  // Message notifications (existing)
  messageNotifications: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
  addMessageNotification: (notification: {
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }) => void;
  removeMessageNotification: (index: number) => void;
  clearAllMessageNotifications: () => void;
  
  // General notifications (new)
  generalNotifications: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    timestamp: string;
    read: boolean;
    data?: Record<string, unknown>;
  }>;
  addGeneralNotification: (notification: {
    id: string;
    type: string;
    title: string;
    content: string;
    timestamp: string;
  }) => void;
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
  const [generalNotifications, setGeneralNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    timestamp: string;
    read: boolean;
    data?: Record<string, unknown>;
  }>>([]);

  const addGeneralNotification = (notification: {
    id: string;
    type: string;
    title: string;
    content: string;
    timestamp: string;
  }) => {
    setGeneralNotifications(prev => [...prev, {
      ...notification,
      read: false,
      data: {}
    }]);
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
      if (message.type === 'new_message' && message.sender?.id !== session.user.id && message.conversationId && message.message && message.sender) {
        try {
          const normalizedMessage = NotificationAdapter.normalizeSSEMessage(message);
          const messageNotification = NotificationAdapter.createMessageNotificationFromSSE(normalizedMessage, session.user.id);
          
          if (messageNotification) {
            addMessageNotification({
              conversationId: message.conversationId || '',
              message: {
                id: messageNotification.id,
                content: (messageNotification as { message?: string }).message ?? 'Nova mensagem',
                type: messageNotification.type ?? 'message'
              },
              sender: {
                id: message.sender?.id || '',
                name: message.sender?.name || 'Usuário'
              },
              recipientId: session.user.id
            });
          }
        } catch (error) {
          console.warn('Failed to process SSE message notification:', error);
        }
      }
    });

    // Processar notificações gerais via SSE
    sseMessages.forEach(message => {
      if (message.type === 'notification') {
        try {
          const normalizedMessage = NotificationAdapter.normalizeSSEMessage(message);
          const generalNotification = NotificationAdapter.createGeneralNotificationFromSSE(normalizedMessage);
          
          addGeneralNotification({
            id: generalNotification.id,
            type: generalNotification.type ?? 'general',
            title: generalNotification.title ?? 'Nova notificação',
            content: generalNotification.content ?? 'Você tem uma nova notificação',
            timestamp: generalNotification.timestamp ?? new Date().toISOString(),
          });
        } catch (error) {
          console.warn('Failed to process SSE general notification:', error);
        }
      }
    });
  }, [sseMessages, session?.user?.id, addMessageNotification, addGeneralNotification]);

  return (
    <NotificationContext.Provider
      value={{
        messageNotifications: messageNotifications.map(notification => ({
          id: (notification as { id?: string }).id || '',
          type: (notification as { type?: string }).type || '',
          message: (notification as { message?: { content?: string } }).message?.content || '',
          timestamp: (notification as { message?: { timestamp?: string } }).message?.timestamp || ''
        })),
        addMessageNotification: (notification: { id: string; type: string; message: string; timestamp: string }) => {
          addMessageNotification({
            conversationId: '',
            message: { id: notification.id, content: notification.message, type: notification.type },
            sender: { id: '', name: '' },
            recipientId: ''
          });
        },
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
