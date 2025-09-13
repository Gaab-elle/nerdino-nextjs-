import { z } from "zod";

// Notification Schemas
export const NotificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  is_read: z.boolean().optional(),
  data: z.record(z.string(), z.any()).optional(),
  from_user_id: z.string().optional(),
  post_id: z.string().optional(),
  comment_id: z.string().optional(),
  created_at: z.string().optional(),
});

export const NotificationIncludeSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    username: z.string().nullable(),
    avatar_url: z.string().nullable(),
    image: z.string().nullable(),
  }).optional(),
  post: z.object({
    id: z.string(),
    content: z.string(),
    type: z.string(),
  }).optional(),
  comment: z.object({
    id: z.string(),
    content: z.string(),
  }).optional(),
});

// Internal Models
export type NotificationDTO = z.infer<typeof NotificationSchema>;
export type NotificationIncludeDTO = z.infer<typeof NotificationIncludeSchema>;

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

// Type Guards
export function isNotification(obj: unknown): obj is NotificationDTO {
  return NotificationSchema.safeParse(obj).success;
}

export function isNotificationInclude(obj: unknown): obj is NotificationIncludeDTO {
  return NotificationIncludeSchema.safeParse(obj).success;
}
