'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationData {
  conversationId: string;
  message: {
    id: string;
    content: string;
    type: string;
  };
  sender: {
    id: string;
    name: string;
  };
  recipientId: string;
}

interface MessageNotificationProps {
  notification: NotificationData;
  onClose: () => void;
}

export const MessageNotification: React.FC<MessageNotificationProps> = ({
  notification,
  onClose,
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Aguardar animação
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    router.push(`/messages?conversation=${notification.conversationId}`);
    onClose();
  };

  const getMessagePreview = (content: string, type: string) => {
    if (type === 'code') {
      return '💻 Código compartilhado';
    } else if (type === 'file') {
      return '📎 Arquivo compartilhado';
    } else if (type === 'project') {
      return '🚀 Projeto compartilhado';
    }
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {notification.sender.name}
              </p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {getMessagePreview(notification.message.content, notification.message.type)}
            </p>
            
            <button
              onClick={handleClick}
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              Ver conversa
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar notificações
export function useMessageNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
}
