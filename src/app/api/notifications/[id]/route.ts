import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/notifications/[id] - Buscar notificação específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = params.id;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        from_user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            type: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Verificar se a notificação pertence ao usuário
    if (notification.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Marcar como lida se ainda não estiver
    if (!notification.is_read) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { is_read: true },
      });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/[id] - Atualizar notificação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = params.id;
    const body = await request.json();
    const { is_read, title, content, data } = body;

    // Verificar se a notificação existe e pertence ao usuário
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, user_id: true },
    });

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (existingNotification.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Atualizar notificação
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        is_read: is_read !== undefined ? is_read : undefined,
        title: title?.trim(),
        content: content?.trim(),
        data: data || undefined,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Deletar notificação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = params.id;

    // Verificar se a notificação existe e pertence ao usuário
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, user_id: true },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Deletar notificação
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
