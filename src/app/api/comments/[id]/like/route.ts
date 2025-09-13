import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/comments/[id]/like - Curtir/descurtir comentário
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o comentário existe
    const comment = await prisma.comment.findUnique({
      where: { id: (await context.params).id },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verificar se o usuário já curtiu o comentário
    const existingLike = await prisma.like.findFirst({
      where: {
        user_id: session.user.id,
        comment_id: (await context.params).id,
      },
    });

    if (existingLike) {
      // Descurtir - remover like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({ 
        message: 'Comment unliked',
        liked: false 
      });
    } else {
      // Curtir - adicionar like
      await prisma.like.create({
        data: {
          user_id: session.user.id,
          comment_id: (await context.params).id,
        },
      });

      return NextResponse.json({ 
        message: 'Comment liked',
        liked: true 
      });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle comment like' },
      { status: 500 }
    );
  }
}

// GET /api/comments/[id]/like - Verificar se usuário curtiu o comentário
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
        comment_id: (await context.params).id,
      },
    });

    return NextResponse.json({ 
      liked: !!like,
      likeId: like?.id || null 
    });
  } catch (error) {
    console.error('Error checking comment like status:', error);
    return NextResponse.json(
      { error: 'Failed to check comment like status' },
      { status: 500 }
    );
  }
}
