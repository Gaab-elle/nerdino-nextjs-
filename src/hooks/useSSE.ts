import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

interface SSEMessage {
  type: string;
  data?: any;
  userId?: string;
  conversationId?: string;
  message?: any;
  sender?: any;
}

export function useSSE() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [messages, setMessages] = useState<SSEMessage[]>([]);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    const eventSource = new EventSource(`/api/messages/stream?userId=${session.user.id}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
      setConnectionError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
        console.log('SSE message received:', message);
        
        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      // Only log error if we have a session (user is logged in)
      if (session?.user?.id) {
        console.error('SSE connection error:', error);
        setConnectionError('Connection error');
      }
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [session?.user?.id]);

  const sendMessage = async (conversationId: string, content: string, type: string = 'text') => {
    try {
      const response = await fetch('/api/conversations/' + conversationId + '/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      
      // Simular recebimento da mensagem via SSE
      setMessages(prev => [...prev, {
        type: 'new_message',
        conversationId,
        message: newMessage,
        sender: session?.user,
      }]);

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    isConnected,
    connectionError,
    messages,
    sendMessage,
  };
}

// Hook específico para uma conversa
export function useConversationSSE(conversationId: string | null) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [conversationMessages, setConversationMessages] = useState<SSEMessage[]>([]);

  useEffect(() => {
    if (!session?.user?.id || !conversationId) {
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    const eventSource = new EventSource(`/api/messages/stream?userId=${session.user.id}&conversationId=${conversationId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log(`SSE connection opened for conversation ${conversationId}`);
      setIsConnected(true);
      setConnectionError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
        
        // Filtrar apenas mensagens desta conversa
        if (message.conversationId === conversationId) {
          setConversationMessages(prev => [...prev, message]);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      // Only log error if we have a session (user is logged in)
      if (session?.user?.id) {
        console.error('SSE connection error:', error);
        setConnectionError('Connection error');
      }
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [session?.user?.id, conversationId]);

  const sendMessage = async (content: string, type: string = 'text') => {
    if (!conversationId) return null;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      
      // Adicionar mensagem localmente
      setConversationMessages(prev => [...prev, {
        type: 'new_message',
        conversationId,
        message: newMessage,
        sender: session?.user,
      }]);

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    isConnected,
    connectionError,
    messages: conversationMessages,
    sendMessage,
  };
}
