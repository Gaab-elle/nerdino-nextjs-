import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Message, 
  MessagesResponse, 
  CreateMessageRequest, 
  UpdateMessageRequest,
  MessagesQuery 
} from '@/types/messages';
import { useConversationSSE } from './useSSE';

// Hook para gerenciar mensagens de uma conversa
export function useMessages(conversationId: string, query: MessagesQuery = {}) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
    hasMore: false,
  });

  // SSE integration
  const { 
    sendMessage: sseSendMessage, 
    isConnected,
    connectionError
  } = useConversationSSE(conversationId);

  const fetchMessages = useCallback(async () => {
    if (!session?.user?.id || !conversationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Por enquanto, vamos usar mensagens mock para testar o WebSocket
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Olá! Como você está?',
          type: 'text',
          conversation_id: conversationId,
          sender_id: 'other_user',
          created_at: new Date(Date.now() - 60000).toISOString(),
          updated_at: new Date(Date.now() - 60000).toISOString(),
          is_read: true,
          sender: {
            id: 'other_user',
            name: 'João Silva',
            username: 'joao.silva',
            avatar_url: undefined,
            image: undefined,
          },
        },
        {
          id: '2',
          content: 'Estou bem, obrigado! E você?',
          type: 'text',
          conversation_id: conversationId,
          sender_id: session.user.id,
          created_at: new Date(Date.now() - 30000).toISOString(),
          updated_at: new Date(Date.now() - 30000).toISOString(),
          is_read: true,
          sender: {
            id: session.user.id,
            name: session.user.name || 'Você',
            username: session.user.email || 'you',
            avatar_url: session.user.avatar_url || undefined,
            image: session.user.avatar_url || undefined,
          },
        },
      ];

      setMessages(mockMessages);
      setPagination({
        page: 1,
        limit: 50,
        total: mockMessages.length,
        pages: 1,
        hasMore: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, conversationId, query.page, query.limit, query.before]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (messageData: CreateMessageRequest): Promise<Message | null> => {
    try {
      // Enviar via SSE
      const newMessage = await sseSendMessage(messageData.content, messageData.type || 'text');
      
      if (newMessage) {
        // Adicionar mensagem localmente (otimistic update)
        setMessages(prev => [...prev, newMessage]);
      }
      
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    }
  };

  const updateMessage = async (messageId: string, messageData: UpdateMessageRequest): Promise<Message | null> => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      const updatedMessage = await response.json();
      setMessages(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
      return updatedMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
      return null;
    }
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      return false;
    }
  };

  const loadMoreMessages = async (): Promise<boolean> => {
    if (!pagination.hasMore || loading) return false;

    try {
      const oldestMessage = messages[0];
      if (!oldestMessage) return false;

      const params = new URLSearchParams();
      params.append('before', oldestMessage.created_at);
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/conversations/${conversationId}/messages?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load more messages');
      }

      const data: MessagesResponse = await response.json();
      setMessages(prev => [...data.messages, ...prev]);
      setPagination(data.pagination);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more messages');
      return false;
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateMessageInList = (messageId: string, updatedMessage: Message) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? updatedMessage : msg));
  };

  const removeMessageFromList = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  return {
    messages,
    loading,
    error,
    pagination,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMoreMessages,
    addMessage,
    updateMessageInList,
    removeMessageFromList,
    refetch: fetchMessages,
    // SSE functions
    isConnected,
    connectionError,
  };
}

// Hook para uma mensagem específica
export function useMessage(messageId: string) {
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/messages/${messageId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch message');
      }

      const data = await response.json();
      setMessage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messageId) {
      fetchMessage();
    }
  }, [messageId]);

  const updateMessage = async (messageData: UpdateMessageRequest): Promise<Message | null> => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      const updatedMessage = await response.json();
      setMessage(updatedMessage);
      return updatedMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
      return null;
    }
  };

  const deleteMessage = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessage(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      return false;
    }
  };

  return {
    message,
    loading,
    error,
    updateMessage,
    deleteMessage,
    refetch: fetchMessage,
  };
}
