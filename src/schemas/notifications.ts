import { z } from "zod";

// Base notification schema
export const NotificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  is_read: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  from_user_id: z.string().optional(),
  post_id: z.string().optional(),
  comment_id: z.string().optional(),
  created_at: z.string().optional(),
});

// SSE Message schema for real-time notifications
export const SSEMessageSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
  message: z.string().optional(),
  sender: z.object({
    id: z.string(),
    name: z.string().optional(),
    username: z.string().optional(),
    avatar_url: z.string().optional(),
  }).optional(),
  conversationId: z.string().optional(),
  timestamp: z.string().optional(),
});

// Message notification schema
export const MessageNotificationSchema = z.object({
  id: z.string(),
  message: z.string(),
  type: z.literal('message'),
  timestamp: z.string(),
  senderId: z.string().optional(),
  conversationId: z.string().optional(),
});

// General notification schema
export const GeneralNotificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().optional(),
});

// User schema for notifications
export const NotificationUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
  image: z.string().nullable(),
});

// Post schema for notifications
export const NotificationPostSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: z.string(),
});

// Comment schema for notifications
export const NotificationCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
});

// Include schema for Prisma relations
export const NotificationIncludeSchema = z.object({
  user: NotificationUserSchema.optional(),
  post: NotificationPostSchema.optional(),
  comment: NotificationCommentSchema.optional(),
});

// DTOs (Data Transfer Objects)
export type NotificationDTO = z.infer<typeof NotificationSchema>;
export type SSEMessageDTO = z.infer<typeof SSEMessageSchema>;
export type MessageNotificationDTO = z.infer<typeof MessageNotificationSchema>;
export type GeneralNotificationDTO = z.infer<typeof GeneralNotificationSchema>;
export type NotificationUserDTO = z.infer<typeof NotificationUserSchema>;
export type NotificationPostDTO = z.infer<typeof NotificationPostSchema>;
export type NotificationCommentDTO = z.infer<typeof NotificationCommentSchema>;
export type NotificationIncludeDTO = z.infer<typeof NotificationIncludeSchema>;

// Internal Models (normalized)
export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  data: Record<string, unknown>;
  fromUserId?: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  post?: {
    id: string;
    content: string;
    type: string;
  };
  comment?: {
    id: string;
    content: string;
  };
};

export type SSEMessage = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  message: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  conversationId: string;
  timestamp: string;
};

export type MessageNotification = {
  id: string;
  message: string;
  type: 'message';
  timestamp: string;
  senderId: string;
  conversationId: string;
};

export type GeneralNotification = {
  id: string;
  type: string;
  title: string;
  content: string;
  data: Record<string, unknown>;
  timestamp: string;
};

// Type Guards
export function isNotification(obj: unknown): obj is NotificationDTO {
  return NotificationSchema.safeParse(obj).success;
}

export function isSSEMessage(obj: unknown): obj is SSEMessageDTO {
  return SSEMessageSchema.safeParse(obj).success;
}

export function isMessageNotification(obj: unknown): obj is MessageNotificationDTO {
  return MessageNotificationSchema.safeParse(obj).success;
}

export function isGeneralNotification(obj: unknown): obj is GeneralNotificationDTO {
  return GeneralNotificationSchema.safeParse(obj).success;
}

export function isNotificationInclude(obj: unknown): obj is NotificationIncludeDTO {
  return NotificationIncludeSchema.safeParse(obj).success;
}

// Validation helpers
export function validateNotification(data: unknown): NotificationDTO {
  const result = NotificationSchema.safeParse(data);
  if (!result.success) {
    console.error('Notification validation failed:', result.error);
    throw new Error('Invalid notification data');
  }
  return result.data;
}

export function validateSSEMessage(data: unknown): SSEMessageDTO {
  const result = SSEMessageSchema.safeParse(data);
  if (!result.success) {
    console.error('SSE message validation failed:', result.error);
    throw new Error('Invalid SSE message data');
  }
  return result.data;
}

export function validateMessageNotification(data: unknown): MessageNotificationDTO {
  const result = MessageNotificationSchema.safeParse(data);
  if (!result.success) {
    console.error('Message notification validation failed:', result.error);
    throw new Error('Invalid message notification data');
  }
  return result.data;
}

export function validateGeneralNotification(data: unknown): GeneralNotificationDTO {
  const result = GeneralNotificationSchema.safeParse(data);
  if (!result.success) {
    console.error('General notification validation failed:', result.error);
    throw new Error('Invalid general notification data');
  }
  return result.data;
}
