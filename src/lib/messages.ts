// Utility functions for Messages System

import { Message, Conversation, User } from '@/types/messages';

// Format message timestamp
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Agora';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h`;
  } else if (diffInMinutes < 10080) { // 7 days
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d`;
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  }
}

// Format conversation timestamp
export function formatConversationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Agora';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h`;
  } else if (diffInMinutes < 10080) { // 7 days
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d`;
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  }
}

// Get conversation display name
export function getConversationDisplayName(conversation: Conversation, currentUserId: string): string {
  if (conversation.name) {
    return conversation.name;
  }

  if (conversation.type === 'direct') {
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    );
    return otherParticipant?.user.name || otherParticipant?.user.username || 'Usuário';
  }

  return 'Conversa em Grupo';
}

// Get conversation avatar
export function getConversationAvatar(conversation: Conversation, currentUserId: string): string | null {
  if (conversation.type === 'direct') {
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== currentUserId
    );
    return otherParticipant?.user.avatar_url || otherParticipant?.user.image || null;
  }

  // Para grupos, retornar null (usar ícone padrão)
  return null;
}

// Check if user is online
export function isUserOnline(user: User): boolean {
  return user.online_status === 'online';
}

// Get user status text
export function getUserStatusText(user: User): string {
  if (isUserOnline(user)) {
    return 'Online';
  }

  if (user.last_seen) {
    const lastSeen = new Date(user.last_seen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Visto agora';
    } else if (diffInMinutes < 60) {
      return `Visto há ${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Visto há ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Visto há ${days}d`;
    }
  }

  return 'Offline';
}

// Get message preview text
export function getMessagePreview(message: Message): string {
  if (message.type === 'text') {
    return message.content;
  } else if (message.type === 'image') {
    return '📷 Imagem';
  } else if (message.type === 'file') {
    return `📎 ${message.file_name || 'Arquivo'}`;
  } else if (message.type === 'code') {
    return '💻 Código';
  } else if (message.type === 'project') {
    return '🚀 Projeto';
  }
  return 'Mensagem';
}

// Check if message is from current user
export function isMessageFromCurrentUser(message: Message, currentUserId: string): boolean {
  return message.sender_id === currentUserId;
}

// Group messages by date
export function groupMessagesByDate(messages: Message[]): { [key: string]: Message[] } {
  const groups: { [key: string]: Message[] } = {};

  messages.forEach(message => {
    const date = new Date(message.created_at);
    const dateKey = date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return groups;
}

// Check if messages are consecutive from same user
export function areConsecutiveMessages(message1: Message, message2: Message): boolean {
  if (!message1 || !message2) return false;
  
  const timeDiff = Math.abs(
    new Date(message1.created_at).getTime() - new Date(message2.created_at).getTime()
  );
  
  return (
    message1.sender_id === message2.sender_id &&
    timeDiff < 5 * 60 * 1000 // 5 minutes
  );
}

// Get file size in human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if file is image
export function isImageFile(fileName: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(extension);
}

// Get file icon based on type
export function getFileIcon(fileName: string): string {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (isImageFile(fileName)) {
    return '📷';
  } else if (['.pdf'].includes(extension)) {
    return '📄';
  } else if (['.doc', '.docx'].includes(extension)) {
    return '📝';
  } else if (['.xls', '.xlsx'].includes(extension)) {
    return '📊';
  } else if (['.zip', '.rar', '.7z'].includes(extension)) {
    return '📦';
  } else if (['.mp4', '.avi', '.mov'].includes(extension)) {
    return '🎥';
  } else if (['.mp3', '.wav', '.flac'].includes(extension)) {
    return '🎵';
  } else {
    return '📎';
  }
}

// Validate message content
export function validateMessageContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Mensagem não pode estar vazia' };
  }

  if (content.length > 2000) {
    return { valid: false, error: 'Mensagem muito longa (máximo 2000 caracteres)' };
  }

  return { valid: true };
}

// Validate file upload
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/zip',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'Arquivo muito grande (máximo 10MB)' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de arquivo não permitido' };
  }

  return { valid: true };
}

// Generate conversation ID for direct messages
export function generateDirectConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('-');
}

// Check if conversation is direct
export function isDirectConversation(conversation: Conversation): boolean {
  return conversation.type === 'direct';
}

// Check if conversation is group
export function isGroupConversation(conversation: Conversation): boolean {
  return conversation.type === 'group';
}

// Get conversation participants count
export function getConversationParticipantsCount(conversation: Conversation): number {
  return conversation.participants.length;
}

// Check if user is participant of conversation
export function isUserParticipant(conversation: Conversation, userId: string): boolean {
  return conversation.participants.some(p => p.user_id === userId);
}

// Get other participants in direct conversation
export function getOtherParticipant(conversation: Conversation, currentUserId: string): User | null {
  if (conversation.type !== 'direct') return null;
  
  const otherParticipant = conversation.participants.find(
    p => p.user_id !== currentUserId
  );
  
  return otherParticipant?.user || null;
}
