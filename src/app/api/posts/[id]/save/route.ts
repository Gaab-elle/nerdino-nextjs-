import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/posts/[id]/save - Salvar/remover post dos salvos
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Verificar se o usuário já salvou o post
    const existingSave = await prisma.savedPost.findFirst({
      where: {
        user_id: session.user.id,
        post_id: postId,
      },
    });

    if (existingSave) {
      // Remover dos salvos
      await prisma.savedPost.delete({
        where: { id: existingSave.id },
      });

      return NextResponse.json({
        message: 'Post unsaved',
        saved: false,
      });
    } else {
      // Salvar post
      await prisma.savedPost.create({
        data: {
          user_id: session.user.id,
          post_id: postId,
        },
      });

      return NextResponse.json({
        message: 'Post saved',
        saved: true,
      });
    }
  } catch (error) {
    console.error('Error toggling save:', error);
    return NextResponse.json(
      { error: 'Failed to toggle save' },
      { status: 500 }
    );
  }
}

// GET /api/posts/[id]/save - Verificar se o post está salvo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    const savedPost = await prisma.savedPost.findFirst({
      where: {
        user_id: session.user.id,
        post_id: postId,
      },
    });

    return NextResponse.json({
      saved: !!savedPost,
      savedPostId: savedPost?.id || null,
    });
  } catch (error) {
    console.error('Error checking save status:', error);
    return NextResponse.json(
      { error: 'Failed to check save status' },
      { status: 500 }
    );
  }
}
