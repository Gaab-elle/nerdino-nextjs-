import {
  NotificationDTO,
  SSEMessageDTO,
  MessageNotificationDTO,
  GeneralNotificationDTO,
  NotificationUserDTO,
  NotificationPostDTO,
  NotificationCommentDTO,
  Notification,
  SSEMessage,
  MessageNotification,
  GeneralNotification,
  validateNotification,
  validateSSEMessage,
  validateMessageNotification,
  validateGeneralNotification,
} from '@/schemas/notifications';

export class NotificationAdapter {
  /**
   * Normalize notification data from API response to internal model
   */
  static normalizeNotification(notificationData: unknown): Notification {
    const dto = validateNotification(notificationData);
    
    return {
      id: dto.id,
      userId: dto.user_id,
      type: dto.type,
      title: dto.title ?? '',
      content: dto.content ?? '',
      isRead: dto.is_read ?? false,
      data: dto.data ?? {},
      fromUserId: dto.from_user_id,
      postId: dto.post_id,
      commentId: dto.comment_id,
      createdAt: dto.created_at ?? new Date().toISOString(),
    };
  }

  /**
   * Normalize SSE message data to internal model
   */
  static normalizeSSEMessage(messageData: unknown): SSEMessage {
    const dto = validateSSEMessage(messageData);
    
    return {
      id: dto.id ?? `sse-${Date.now()}`,
      type: dto.type,
      data: dto.data ?? {},
      message: dto.message ?? '',
      sender: dto.sender ? {
        id: dto.sender.id,
        name: dto.sender.name ?? '',
        username: dto.sender.username ?? '',
        avatarUrl: dto.sender.avatar_url ?? '',
      } : {
        id: '',
        name: '',
        username: '',
        avatarUrl: '',
      },
      conversationId: dto.conversationId ?? '',
      timestamp: dto.timestamp ?? new Date().toISOString(),
    };
  }

  /**
   * Normalize message notification data
   */
  static normalizeMessageNotification(notificationData: unknown): MessageNotification {
    const dto = validateMessageNotification(notificationData);
    
    return {
      id: dto.id,
      message: dto.message,
      type: dto.type,
      timestamp: dto.timestamp,
      senderId: dto.senderId ?? '',
      conversationId: dto.conversationId ?? '',
    };
  }

  /**
   * Normalize general notification data
   */
  static normalizeGeneralNotification(notificationData: unknown): GeneralNotification {
    const dto = validateGeneralNotification(notificationData);
    
    return {
      id: dto.id,
      type: dto.type,
      title: dto.title ?? '',
      content: dto.content ?? '',
      data: dto.data ?? {},
      timestamp: dto.timestamp ?? new Date().toISOString(),
    };
  }

  /**
   * Normalize user data for notifications
   */
  static normalizeNotificationUser(userData: NotificationUserDTO): {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  } {
    return {
      id: userData.id,
      name: userData.name ?? '',
      username: userData.username ?? '',
      avatarUrl: userData.avatar_url ?? userData.image ?? '',
    };
  }

  /**
   * Normalize post data for notifications
   */
  static normalizeNotificationPost(postData: NotificationPostDTO): {
    id: string;
    content: string;
    type: string;
  } {
    return {
      id: postData.id,
      content: postData.content,
      type: postData.type,
    };
  }

  /**
   * Normalize comment data for notifications
   */
  static normalizeNotificationComment(commentData: NotificationCommentDTO): {
    id: string;
    content: string;
  } {
    return {
      id: commentData.id,
      content: commentData.content,
    };
  }

  /**
   * Create message notification from SSE message
   */
  static createMessageNotificationFromSSE(sseMessage: SSEMessage, currentUserId: string): MessageNotification | null {
    // Only create notification if message is from someone else
    if (sseMessage.sender.id === currentUserId) {
      return null;
    }

    return {
      id: sseMessage.id,
      message: sseMessage.message,
      type: 'message',
      timestamp: sseMessage.timestamp,
      senderId: sseMessage.sender.id,
      conversationId: sseMessage.conversationId,
    };
  }

  /**
   * Create general notification from SSE message
   */
  static createGeneralNotificationFromSSE(sseMessage: SSEMessage): GeneralNotification {
    return {
      id: sseMessage.id,
      type: sseMessage.type,
      title: sseMessage.data.title as string ?? '',
      content: sseMessage.message,
      data: sseMessage.data,
      timestamp: sseMessage.timestamp,
    };
  }

  /**
   * Safe array processing with validation
   */
  static normalizeNotifications(notificationsData: unknown[]): Notification[] {
    return notificationsData
      .map(notification => {
        try {
          return this.normalizeNotification(notification);
        } catch (error) {
          console.warn('Skipping invalid notification data:', error);
          return null;
        }
      })
      .filter((notification): notification is Notification => notification !== null);
  }

  static normalizeSSEMessages(messagesData: unknown[]): SSEMessage[] {
    return messagesData
      .map(message => {
        try {
          return this.normalizeSSEMessage(message);
        } catch (error) {
          console.warn('Skipping invalid SSE message data:', error);
          return null;
        }
      })
      .filter((message): message is SSEMessage => message !== null);
  }

  /**
   * Generate notification title based on type
   */
  static generateNotificationTitle(type: string, data: Record<string, unknown>): string {
    switch (type) {
      case 'message':
        return 'Nova mensagem';
      case 'like':
        return 'Curtida recebida';
      case 'comment':
        return 'Novo comentário';
      case 'follow':
        return 'Novo seguidor';
      case 'mention':
        return 'Você foi mencionado';
      case 'opportunity':
        return 'Nova oportunidade';
      default:
        return data.title as string ?? 'Nova notificação';
    }
  }

  /**
   * Generate notification content based on type and data
   */
  static generateNotificationContent(type: string, data: Record<string, unknown>): string {
    switch (type) {
      case 'message':
        return data.message as string ?? 'Você recebeu uma nova mensagem';
      case 'like':
        return `${data.userName as string ?? 'Alguém'} curtiu seu post`;
      case 'comment':
        return `${data.userName as string ?? 'Alguém'} comentou no seu post`;
      case 'follow':
        return `${data.userName as string ?? 'Alguém'} começou a te seguir`;
      case 'mention':
        return `${data.userName as string ?? 'Alguém'} te mencionou`;
      case 'opportunity':
        return `Nova oportunidade: ${data.title as string ?? 'Vaga disponível'}`;
      default:
        return data.content as string ?? 'Você tem uma nova notificação';
    }
  }
}
