// Types for Messages System

export interface Conversation {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator_id: string;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    image?: string;
  };
  participants: ConversationParticipant[];
  messages: Message[];
  _count: {
    messages: number;
    participants: number;
  };
  displayName?: string;
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  role: 'admin' | 'member';
  created_at: string;
  conversation_id: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    image?: string;
    bio?: string;
    location?: string;
    website?: string;
    github_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    online_status: 'online' | 'away' | 'busy' | 'offline' | 'do_not_disturb';
    last_seen?: string;
    created_at: string;
  };
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'code' | 'project';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  conversation_id: string;
  sender_id: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    image?: string;
  };
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  image?: string;
  bio?: string;
  location?: string;
  online_status: 'online' | 'away' | 'busy' | 'offline' | 'do_not_disturb';
  last_seen?: string;
}

// Request types
export interface CreateConversationRequest {
  type: 'direct' | 'group';
  name?: string;
  participantIds: string[];
}

export interface UpdateConversationRequest {
  name?: string;
  is_active?: boolean;
}

export interface CreateMessageRequest {
  content: string;
  type?: 'text' | 'image' | 'file' | 'code' | 'project';
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface AddParticipantRequest {
  userId: string;
}

export interface UpdateParticipantRoleRequest {
  role: 'admin' | 'member';
}

// Response types
export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface ParticipantsResponse {
  participants: ConversationParticipant[];
}

export interface UsersSearchResponse {
  users: User[];
}

export interface MarkAsReadResponse {
  message: string;
  updatedCount: number;
}

// Query parameters
export interface ConversationsQuery {
  page?: number;
  limit?: number;
  type?: 'direct' | 'group';
  search?: string;
}

export interface MessagesQuery {
  page?: number;
  limit?: number;
  before?: string; // For cursor-based pagination
}

export interface UsersSearchQuery {
  q: string;
  limit?: number;
}

// WebSocket message types for real-time features
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'user_online' | 'user_offline';
  conversationId: string;
  userId: string;
  data: unknown;
  timestamp: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageReadStatus {
  conversationId: string;
  messageId: string;
  userId: string;
  readAt: string;
}

// Notification types
export interface MessageNotification {
  id: string;
  type: 'new_message' | 'message_read' | 'user_joined' | 'user_left';
  conversationId: string;
  messageId?: string;
  userId: string;
  content: string;
  isRead: boolean;
  created_at: string;
}

// File upload types
export interface FileUpload {
  file: File;
  type: 'image' | 'file';
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}
