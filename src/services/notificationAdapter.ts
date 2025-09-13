import { 
  NotificationDTO, 
  NotificationIncludeDTO,
  Notification,
  isNotification,
  isNotificationInclude
} from '@/types/notifications';

export class NotificationAdapter {
  static normalizeNotification(dto: unknown, include?: unknown): Notification {
    if (!isNotification(dto)) {
      throw new Error('Invalid notification data');
    }

    const includeData = include && isNotificationInclude(include) ? include : null;

    return {
      id: dto.id,
      userId: dto.user_id,
      type: dto.type,
      title: dto.title || 'Sem título',
      content: dto.content || '',
      isRead: dto.is_read || false,
      data: dto.data || {},
      fromUserId: dto.from_user_id,
      postId: dto.post_id,
      commentId: dto.comment_id,
      createdAt: dto.created_at || new Date().toISOString(),
      user: includeData && (includeData as any).user ? {
        id: (includeData as any).user.id,
        name: (includeData as any).user.name || 'Usuário',
        username: (includeData as any).user.username || 'usuario',
        avatarUrl: (includeData as any).user.avatar_url || (includeData as any).user.image || '',
      } : undefined,
      post: includeData && (includeData as any).post ? {
        id: (includeData as any).post.id,
        content: (includeData as any).post.content,
        type: (includeData as any).post.type,
      } : undefined,
      comment: includeData && (includeData as any).comment ? {
        id: (includeData as any).comment.id,
        content: (includeData as any).comment.content,
      } : undefined,
    };
  }

  static normalizeNotificationList(dtos: unknown[]): Notification[] {
    return dtos
      .map(dto => {
        try {
          return this.normalizeNotification(dto);
        } catch (error) {
          console.warn('Failed to normalize notification:', error);
          return null;
        }
      })
      .filter((notification): notification is Notification => notification !== null);
  }

  static createNotificationData(data: {
    userId: string;
    type: string;
    title?: string;
    content?: string;
    data?: Record<string, unknown>;
    fromUserId?: string;
    postId?: string;
    commentId?: string;
  }): Partial<NotificationDTO> {
    return {
      user_id: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      data: data.data,
      from_user_id: data.fromUserId,
      post_id: data.postId,
      comment_id: data.commentId,
      is_read: false,
      created_at: new Date().toISOString(),
    };
  }
}
