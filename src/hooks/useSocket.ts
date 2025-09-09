import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { Message, Conversation } from '@/types/messages';

interface SocketEvents {
  // Eventos de conexão
  connect: () => void;
  disconnect: () => void;
  error: (error: { message: string }) => void;
  
  // Eventos de conversa
  joined_conversation: (data: { conversationId: string }) => void;
  left_conversation: (data: { conversationId: string }) => void;
  
  // Eventos de mensagem
  new_message: (data: { message: Message; conversationId: string }) => void;
  messages_read: (data: { conversationId: string; userId: string; messageIds?: string[] }) => void;
  
  // Eventos de presença
  user_online: (data: { userId: string; user: any; timestamp: string }) => void;
  user_offline: (data: { userId: string; timestamp: string }) => void;
  presence_updated: (data: { userId: string; status: string; timestamp: string }) => void;
  
  // Eventos de digitação
  user_typing: (data: { userId: string; user: any; conversationId: string; isTyping: boolean }) => void;
  
  // Eventos de notificação
  message_notification: (data: {
    conversationId: string;
    message: { id: string; content: string; type: string };
    sender: { id: string; name: string };
    recipientId: string;
  }) => void;
}

export function useSocket() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    // Criar conexão Socket.IO
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      auth: {
        userId: session.user.id,
        userName: session.user.name,
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Eventos de conexão
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(error.message);
    });

    return () => {
      newSocket.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [session?.user?.id]);

  return {
    socket,
    isConnected,
    connectionError,
  };
}

// Hook para gerenciar eventos de uma conversa específica
export function useConversationSocket(conversationId: string | null) {
  const { socket, isConnected } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !conversationId || !isConnected) {
      return;
    }

    // Entrar na conversa
    socket.emit('join_conversation', conversationId);

    // Eventos específicos da conversa
    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      if (data.conversationId === conversationId) {
        // Este evento será tratado pelo hook useMessages
        console.log('New message received:', data.message);
      }
    };

    const handleUserTyping = (data: { userId: string; user: any; conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    const handleMessagesRead = (data: { conversationId: string; userId: string; messageIds?: string[] }) => {
      if (data.conversationId === conversationId) {
        // Este evento será tratado pelo hook useMessages
        console.log('Messages read:', data);
      }
    };

    // Registrar listeners
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      // Sair da conversa
      socket.emit('leave_conversation', conversationId);
      
      // Remover listeners
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, conversationId, isConnected]);

  // Funções para enviar eventos
  const sendMessage = (messageData: {
    content: string;
    type?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
  }) => {
    if (socket && conversationId) {
      socket.emit('send_message', {
        conversationId,
        ...messageData,
      });
    }
  };

  const startTyping = () => {
    if (socket && conversationId) {
      socket.emit('typing_start', { conversationId });
    }
  };

  const stopTyping = () => {
    if (socket && conversationId) {
      socket.emit('typing_stop', { conversationId });
    }
  };

  const markAsRead = (messageIds?: string[]) => {
    if (socket && conversationId) {
      socket.emit('mark_as_read', { conversationId, messageIds });
    }
  };

  return {
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    typingUsers: Array.from(typingUsers),
    onlineUsers: Array.from(onlineUsers),
  };
}

// Hook para gerenciar presença global
export function usePresenceSocket() {
  const { socket, isConnected } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    // Entrar na sala de presença
    socket.emit('join_conversations');

    const handleUserOnline = (data: { userId: string; user: any; timestamp: string }) => {
      setOnlineUsers(prev => new Map(prev.set(data.userId, data.user)));
    };

    const handleUserOffline = (data: { userId: string; timestamp: string }) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    };

    const handlePresenceUpdated = (data: { userId: string; status: string; timestamp: string }) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        const user = newMap.get(data.userId);
        if (user) {
          newMap.set(data.userId, { ...user, online_status: data.status });
        }
        return newMap;
      });
    };

    const handleMessageNotification = (data: {
      conversationId: string;
      message: { id: string; content: string; type: string };
      sender: { id: string; name: string };
      recipientId: string;
    }) => {
      // Aqui você pode implementar notificações push ou toast
      console.log('Message notification:', data);
    };

    // Registrar listeners
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('presence_updated', handlePresenceUpdated);
    socket.on('message_notification', handleMessageNotification);

    return () => {
      // Remover listeners
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('presence_updated', handlePresenceUpdated);
      socket.off('message_notification', handleMessageNotification);
    };
  }, [socket, isConnected]);

  const updatePresence = (status: 'online' | 'away' | 'busy' | 'offline' | 'do_not_disturb') => {
    if (socket) {
      socket.emit('update_presence', { status });
    }
  };

  return {
    onlineUsers: Array.from(onlineUsers.values()),
    updatePresence,
  };
}
