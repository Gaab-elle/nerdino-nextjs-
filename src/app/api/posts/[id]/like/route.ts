import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notifications';

// POST /api/posts/[id]/like - Curtir/descurtir post
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o post existe e buscar o dono
    const post = await prisma.post.findUnique({
      where: { id: (await context.params).id },
      select: { id: true, user_id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Verificar se o usuário já curtiu o post
    const existingLike = await prisma.like.findFirst({
      where: {
        user_id: session.user.id,
        post_id: (await context.params).id,
      },
    });

    if (existingLike) {
      // Descurtir - remover like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({ 
        message: 'Post unliked',
        liked: false 
      });
    } else {
      // Curtir - adicionar like
      await prisma.like.create({
        data: {
          user_id: session.user.id,
          post_id: (await context.params).id,
        },
      });

      // Criar notificação para o dono do post
      try {
        const liker = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, username: true },
        });

        if (liker) {
          await NotificationService.createPostLikeNotification(
            (await context.params).id,
            post.user_id,
            session.user.id,
            liker.name || liker.username || 'Usuário'
          );
        }
      } catch (notificationError) {
        console.error('Error creating like notification:', notificationError);
        // Não falhar a operação principal por causa da notificação
      }

      return NextResponse.json({ 
        message: 'Post liked',
        liked: true 
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

// GET /api/posts/[id]/like - Verificar se usuário curtiu o post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const like = await prisma.like.findFirst({
      where: {
        user_id: session.user.id,
        post_id: (await context.params).id,
      },
    });

    return NextResponse.json({ 
      liked: !!like,
      likeId: like?.id || null 
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}
