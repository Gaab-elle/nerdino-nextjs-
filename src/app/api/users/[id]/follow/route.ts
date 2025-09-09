import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notifications';

// POST /api/users/[id]/follow - Seguir/parar de seguir usuário
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUserId = params.id;

    // Não pode seguir a si mesmo
    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Verificar se o usuário alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, is_public: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar se já está seguindo
    const existingFollow = await prisma.follow.findFirst({
      where: {
        follower_id: session.user.id,
        following_id: targetUserId,
      },
    });

    if (existingFollow) {
      // Parar de seguir - remover follow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });

      return NextResponse.json({
        message: 'User unfollowed',
        following: false,
      });
    } else {
      // Seguir - adicionar follow
      await prisma.follow.create({
        data: {
          follower_id: session.user.id,
          following_id: targetUserId,
        },
      });

      // Criar notificação para o usuário seguido
      try {
        const follower = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, username: true },
        });

        if (follower) {
          await NotificationService.createFollowNotification(
            targetUserId,
            session.user.id,
            follower.name || follower.username || 'Usuário'
          );
        }
      } catch (notificationError) {
        console.error('Error creating follow notification:', notificationError);
        // Não falhar a operação principal por causa da notificação
      }

      return NextResponse.json({
        message: 'User followed',
        following: true,
      });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/follow - Verificar se está seguindo o usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUserId = params.id;

    const follow = await prisma.follow.findFirst({
      where: {
        follower_id: session.user.id,
        following_id: targetUserId,
      },
    });

    return NextResponse.json({
      following: !!follow,
      followId: follow?.id || null,
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}
