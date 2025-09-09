import { prisma } from '@/lib/prisma';

export interface NotificationData {
  user_id: string;
  title: string;
  content: string;
  type: string;
  data?: any;
  from_user_id?: string;
  post_id?: string;
  comment_id?: string;
}

export class NotificationService {
  /**
   * Criar uma nova notificação
   */
  static async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          user_id: data.user_id,
          title: data.title.trim(),
          content: data.content.trim(),
          type: data.type,
          data: data.data || null,
          from_user_id: data.from_user_id || null,
          post_id: data.post_id || null,
          comment_id: data.comment_id || null,
        },
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Criar notificação de like em post
   */
  static async createPostLikeNotification(
    postId: string,
    postOwnerId: string,
    likerId: string,
    likerName: string
  ) {
    // Não notificar se o usuário curtiu seu próprio post
    if (postOwnerId === likerId) return null;

    return this.createNotification({
      user_id: postOwnerId,
      title: 'Novo like no seu post',
      content: `${likerName} curtiu seu post`,
      type: 'like',
      from_user_id: likerId,
      post_id: postId,
      data: { action: 'like', target: 'post' },
    });
  }

  /**
   * Criar notificação de comentário em post
   */
  static async createPostCommentNotification(
    postId: string,
    postOwnerId: string,
    commenterId: string,
    commenterName: string,
    commentContent: string
  ) {
    // Não notificar se o usuário comentou em seu próprio post
    if (postOwnerId === commenterId) return null;

    return this.createNotification({
      user_id: postOwnerId,
      title: 'Novo comentário no seu post',
      content: `${commenterName} comentou: "${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}"`,
      type: 'comment',
      from_user_id: commenterId,
      post_id: postId,
      data: { action: 'comment', target: 'post' },
    });
  }

  /**
   * Criar notificação de follow
   */
  static async createFollowNotification(
    followedUserId: string,
    followerId: string,
    followerName: string
  ) {
    return this.createNotification({
      user_id: followedUserId,
      title: 'Novo seguidor',
      content: `${followerName} começou a te seguir`,
      type: 'follow',
      from_user_id: followerId,
      data: { action: 'follow' },
    });
  }

  /**
   * Criar notificação de mensagem
   */
  static async createMessageNotification(
    recipientId: string,
    senderId: string,
    senderName: string,
    messageContent: string,
    conversationId: string
  ) {
    return this.createNotification({
      user_id: recipientId,
      title: 'Nova mensagem',
      content: `${senderName}: ${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`,
      type: 'message',
      from_user_id: senderId,
      data: { 
        action: 'message', 
        conversationId,
        messagePreview: messageContent.substring(0, 100)
      },
    });
  }

  /**
   * Criar notificação de candidatura a vaga
   */
  static async createJobApplicationNotification(
    jobId: string,
    jobTitle: string,
    applicantId: string,
    applicantName: string
  ) {
    // Buscar o dono da vaga (assumindo que é o usuário que criou)
    const job = await prisma.jobOpportunity.findUnique({
      where: { id: jobId },
      select: { id: true, title: true },
    });

    if (!job) return null;

    // Por enquanto, vamos notificar um usuário admin ou o criador da vaga
    // Em um sistema real, você teria um campo owner_id na tabela de oportunidades
    return this.createNotification({
      user_id: applicantId, // Notificar o candidato sobre o status
      title: 'Candidatura enviada',
      content: `Sua candidatura para "${jobTitle}" foi enviada com sucesso`,
      type: 'job_application',
      data: { 
        action: 'application_sent', 
        jobId,
        jobTitle
      },
    });
  }

  /**
   * Criar notificação de match de vaga
   */
  static async createJobMatchNotification(
    userId: string,
    jobId: string,
    jobTitle: string,
    companyName: string,
    matchScore: number
  ) {
    return this.createNotification({
      user_id: userId,
      title: 'Nova oportunidade para você',
      content: `Encontramos uma vaga que combina com seu perfil: "${jobTitle}" na ${companyName} (${matchScore}% de compatibilidade)`,
      type: 'job_match',
      data: { 
        action: 'job_match', 
        jobId,
        jobTitle,
        companyName,
        matchScore
      },
    });
  }

  /**
   * Criar notificação de projeto curtido
   */
  static async createProjectLikeNotification(
    projectId: string,
    projectOwnerId: string,
    likerId: string,
    likerName: string
  ) {
    // Não notificar se o usuário curtiu seu próprio projeto
    if (projectOwnerId === likerId) return null;

    return this.createNotification({
      user_id: projectOwnerId,
      title: 'Novo like no seu projeto',
      content: `${likerName} curtiu seu projeto`,
      type: 'project_like',
      from_user_id: likerId,
      data: { action: 'like', target: 'project', projectId },
    });
  }

  /**
   * Criar notificação de menção
   */
  static async createMentionNotification(
    mentionedUserId: string,
    mentionerId: string,
    mentionerName: string,
    postId: string,
    postContent: string
  ) {
    return this.createNotification({
      user_id: mentionedUserId,
      title: 'Você foi mencionado',
      content: `${mentionerName} te mencionou em um post`,
      type: 'mention',
      from_user_id: mentionerId,
      post_id: postId,
      data: { 
        action: 'mention', 
        postContent: postContent.substring(0, 100)
      },
    });
  }

  /**
   * Criar notificação de sistema
   */
  static async createSystemNotification(
    userId: string,
    title: string,
    content: string,
    data?: any
  ) {
    return this.createNotification({
      user_id: userId,
      title,
      content,
      type: 'system',
      data: { action: 'system', ...data },
    });
  }

  /**
   * Criar notificação de verificação de email
   */
  static async createEmailVerificationNotification(
    userId: string,
    email: string
  ) {
    return this.createNotification({
      user_id: userId,
      title: 'Verifique seu email',
      content: `Enviamos um link de verificação para ${email}`,
      type: 'email_verification',
      data: { action: 'email_verification', email },
    });
  }

  /**
   * Criar notificação de reset de senha
   */
  static async createPasswordResetNotification(
    userId: string,
    email: string
  ) {
    return this.createNotification({
      user_id: userId,
      title: 'Reset de senha solicitado',
      content: `Solicitação de reset de senha para ${email}`,
      type: 'password_reset',
      data: { action: 'password_reset', email },
    });
  }

  /**
   * Marcar notificações como lidas
   */
  static async markAsRead(notificationIds: string[], userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        user_id: userId,
      },
      data: { is_read: true },
    });
  }

  /**
   * Marcar todas as notificações como lidas
   */
  static async markAllAsRead(userId: string, category?: string) {
    let whereClause: any = {
      user_id: userId,
      is_read: false,
    };

    // Se especificou categoria, filtrar por tipo
    if (category) {
      const categoryTypes = {
        community: ['like', 'comment', 'follow', 'mention', 'post_shared'],
        messages: ['message', 'conversation_started'],
        opportunities: ['job_application', 'job_match', 'job_recommendation'],
        projects: ['project_like', 'project_comment', 'project_shared'],
        system: ['system', 'email_verification', 'password_reset'],
      };
      
      if (categoryTypes[category as keyof typeof categoryTypes]) {
        whereClause.type = { in: categoryTypes[category as keyof typeof categoryTypes] };
      }
    }

    return prisma.notification.updateMany({
      where: whereClause,
      data: { is_read: true },
    });
  }

  /**
   * Deletar notificações antigas
   */
  static async deleteOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.notification.deleteMany({
      where: {
        created_at: { lt: cutoffDate },
        is_read: true,
      },
    });
  }

  /**
   * Obter contadores de notificações não lidas
   */
  static async getUnreadCounts(userId: string) {
    const [
      community,
      messages,
      opportunities,
      projects,
      system,
      total,
    ] = await Promise.all([
      prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
          type: { in: ['like', 'comment', 'follow', 'mention', 'post_shared'] },
        },
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
          type: { in: ['message', 'conversation_started'] },
        },
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
          type: { in: ['job_application', 'job_match', 'job_recommendation'] },
        },
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
          type: { in: ['project_like', 'project_comment', 'project_shared'] },
        },
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
          type: { in: ['system', 'email_verification', 'password_reset'] },
        },
      }),
      prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      }),
    ]);

    return {
      total,
      community,
      messages,
      opportunities,
      projects,
      system,
    };
  }
}
