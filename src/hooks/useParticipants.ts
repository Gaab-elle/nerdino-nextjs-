import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  ConversationParticipant, 
  ParticipantsResponse, 
  AddParticipantRequest, 
  UpdateParticipantRoleRequest 
} from '@/types/messages';

// Hook para gerenciar participantes de uma conversa
export function useParticipants(conversationId: string) {
  const { data: session } = useSession();
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    if (!session?.user?.id || !conversationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/conversations/${conversationId}/participants`);
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }

      const data: ParticipantsResponse = await response.json();
      setParticipants(data.participants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [session?.user?.id, conversationId]);

  const addParticipant = async (participantData: AddParticipantRequest): Promise<ConversationParticipant | null> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });

      if (!response.ok) {
        throw new Error('Failed to add participant');
      }

      const newParticipant = await response.json();
      setParticipants(prev => [...prev, newParticipant]);
      return newParticipant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
      return null;
    }
  };

  const removeParticipant = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/participants/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove participant');
      }

      setParticipants(prev => prev.filter(p => p.user_id !== userId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
      return false;
    }
  };

  const updateParticipantRole = async (userId: string, roleData: UpdateParticipantRoleRequest): Promise<ConversationParticipant | null> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/participants/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error('Failed to update participant role');
      }

      const updatedParticipant = await response.json();
      setParticipants(prev => prev.map(p => p.user_id === userId ? updatedParticipant : p));
      return updatedParticipant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update participant role');
      return null;
    }
  };

  const getCurrentUserParticipant = (): ConversationParticipant | null => {
    if (!session?.user?.id) return null;
    return participants.find(p => p.user_id === session.user.id) || null;
  };

  const isCurrentUserAdmin = (): boolean => {
    const currentUserParticipant = getCurrentUserParticipant();
    return currentUserParticipant?.role === 'admin' || false;
  };

  const canManageParticipants = (): boolean => {
    const currentUserParticipant = getCurrentUserParticipant();
    return currentUserParticipant?.role === 'admin' || false;
  };

  return {
    participants,
    loading,
    error,
    addParticipant,
    removeParticipant,
    updateParticipantRole,
    getCurrentUserParticipant,
    isCurrentUserAdmin,
    canManageParticipants,
    refetch: fetchParticipants,
  };
}
