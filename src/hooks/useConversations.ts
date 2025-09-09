import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Conversation, 
  ConversationsResponse, 
  CreateConversationRequest, 
  UpdateConversationRequest,
  ConversationsQuery 
} from '@/types/messages';
import { useSSE } from './useSSE';

// Hook para gerenciar conversas
export function useConversations(query: ConversationsQuery = {}) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // SSE integration
  const { isConnected, connectionError } = useSSE();

  const fetchConversations = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Por enquanto, vamos usar conversas mock para testar o WebSocket
      const mockConversations: Conversation[] = [
        {
          id: 'conv_1',
          name: undefined,
          type: 'direct',
          is_active: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 30000).toISOString(),
          creator_id: session.user.id,
          creator: {
            id: session.user.id,
            name: session.user.name || 'Você',
            username: session.user.email || 'you',
            avatar_url: session.user.avatar_url || undefined,
            image: session.user.avatar_url || undefined,
          },
          unreadCount: 2,
          participants: [
            {
              id: 'part_1',
              conversation_id: 'conv_1',
              user_id: session.user.id,
              role: 'member',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              user: {
                id: session.user.id,
                name: session.user.name || 'Você',
                username: session.user.email || 'you',
                avatar_url: session.user.avatar_url || undefined,
                image: session.user.avatar_url || undefined,
                bio: undefined,
                online_status: 'online',
                last_seen: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
            },
            {
              id: 'part_2',
              conversation_id: 'conv_1',
              user_id: 'other_user',
              role: 'member',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              user: {
                id: 'other_user',
                name: 'João Silva',
                username: 'joao.silva',
                avatar_url: undefined,
                image: undefined,
                bio: 'Desenvolvedor Full Stack',
                online_status: 'online',
                last_seen: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
            },
          ],
          messages: [],
          _count: {
            messages: 2,
            participants: 2,
          },
        },
      ];

      setConversations(mockConversations);
      setPagination({
        page: 1,
        limit: 20,
        total: mockConversations.length,
        pages: 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [session?.user?.id, query.page, query.limit, query.type, query.search]);

  const createConversation = async (conversationData: CreateConversationRequest): Promise<Conversation | null> => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const newConversation = await response.json();
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  };

  const updateConversation = async (id: string, conversationData: UpdateConversationRequest): Promise<Conversation | null> => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        throw new Error('Failed to update conversation');
      }

      const updatedConversation = await response.json();
      setConversations(prev => prev.map(conv => conv.id === id ? updatedConversation : conv));
      return updatedConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation');
      return null;
    }
  };

  const deleteConversation = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      setConversations(prev => prev.filter(conv => conv.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
      return false;
    }
  };

  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations/${id}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Atualizar contador de não lidas
      setConversations(prev => prev.map(conv => {
        if (conv.id === id) {
          return {
            ...conv,
            unreadCount: 0,
          };
        }
        return conv;
      }));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
      return false;
    }
  };

  return {
    conversations,
    loading,
    error,
    pagination,
    createConversation,
    updateConversation,
    deleteConversation,
    markAsRead,
    refetch: fetchConversations,
    // SSE functions
    isConnected,
    connectionError,
  };
}

// Hook para uma conversa específica
export function useConversation(id: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await response.json();
      setConversation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchConversation();
    }
  }, [id]);

  const updateConversation = async (conversationData: UpdateConversationRequest): Promise<Conversation | null> => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        throw new Error('Failed to update conversation');
      }

      const updatedConversation = await response.json();
      setConversation(updatedConversation);
      return updatedConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation');
      return null;
    }
  };

  const markAsRead = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations/${id}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      if (conversation) {
        setConversation({
          ...conversation,
          unreadCount: 0,
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
      return false;
    }
  };

  return {
    conversation,
    loading,
    error,
    updateConversation,
    markAsRead,
    refetch: fetchConversation,
  };
}
