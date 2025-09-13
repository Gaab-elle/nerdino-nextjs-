import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { NotificationAdapter } from '@/adapters/notificationAdapter';

// GET /api/notifications - Listar todas as notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // like, comment, follow, message, job, system, project
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const category = searchParams.get('category'); // community, messages, opportunities, projects, system

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: {
      user_id: string;
      type?: string | { in: string[] };
      is_read?: boolean;
    } = {
      user_id: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (unreadOnly) {
      where.is_read = false;
    }

    // Filtro por categoria baseado no tipo
    if (category) {
      const categoryTypes = {
        community: ['like', 'comment', 'follow', 'mention', 'post_shared'],
        messages: ['message', 'conversation_started'],
        opportunities: ['job_application', 'job_match', 'job_recommendation'],
        projects: ['project_like', 'project_comment', 'project_shared'],
        system: ['system', 'email_verification', 'password_reset'],
      };
      
      if (categoryTypes[category as keyof typeof categoryTypes]) {
        where.type = { in: categoryTypes[category as keyof typeof categoryTypes] };
      }
    }

    const [notificationsRaw, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
              image: true,
            },
          },
          // post: {
          //   select: {
          //     id: true,
          //     content: true,
          //     type: true,
          //   },
          // },
          // comment: {
          //   select: {
          //     id: true,
          //     content: true,
          //   },
          // },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    // Normalize notifications using adapter
    const notifications = NotificationAdapter.normalizeNotifications(notificationsRaw);

    // Contar notificações não lidas por categoria
    const unreadCounts = await Promise.all([
      // Community
      prisma.notification.count({
        where: {
          user_id: session.user.id,
          is_read: false,
          type: { in: ['like', 'comment', 'follow', 'mention', 'post_shared'] },
        },
      }),
      // Messages
      prisma.notification.count({
        where: {
          user_id: session.user.id,
          is_read: false,
          type: { in: ['message', 'conversation_started'] },
        },
      }),
      // Opportunities
      prisma.notification.count({
        where: {
          user_id: session.user.id,
          is_read: false,
          type: { in: ['job_application', 'job_match', 'job_recommendation'] },
        },
      }),
      // Projects
      prisma.notification.count({
        where: {
          user_id: session.user.id,
          is_read: false,
          type: { in: ['project_like', 'project_comment', 'project_shared'] },
        },
      }),
      // System
      prisma.notification.count({
        where: {
          user_id: session.user.id,
          is_read: false,
          type: { in: ['system', 'email_verification', 'password_reset'] },
        },
      }),
    ]);

    const totalUnread = unreadCounts.reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCounts: {
        total: totalUnread,
        community: unreadCounts[0],
        messages: unreadCounts[1],
        opportunities: unreadCounts[2],
        projects: unreadCounts[3],
        system: unreadCounts[4],
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Criar nova notificação (admin/system)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      user_id,
      title,
      content,
      type,
      data,
      from_user_id,
      post_id,
      comment_id,
    } = body;

    // Validações básicas
    if (!user_id || !title || !content || !type) {
      return NextResponse.json(
        { error: 'user_id, title, content, and type are required' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Criar notificação
    const notification = await prisma.notification.create({
      data: {
        user_id,
        title: title.trim(),
        content: content.trim(),
        type,
        data: data || null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Marcar notificações como lidas
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead, category } = body;

    if (markAllAsRead) {
      const whereClause: {
        user_id: string;
        is_read: boolean;
        type?: { in: string[] };
      } = {
        user_id: session.user.id,
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

      // Marcar todas as notificações como lidas
      await prisma.notification.updateMany({
        where: whereClause,
        data: { is_read: true },
      });

      return NextResponse.json({ message: 'Notifications marked as read' });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Marcar notificações específicas como lidas
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          user_id: session.user.id,
        },
        data: { is_read: true },
      });

      return NextResponse.json({ message: 'Notifications marked as read' });
    } else {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
