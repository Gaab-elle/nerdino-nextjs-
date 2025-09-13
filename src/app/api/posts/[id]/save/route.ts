import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/posts/[id]/save - Salvar/remover post dos salvos
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = (await context.params).id;

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // TODO: Implement saved posts functionality
    // The SavedPost model is not defined in the Prisma schema
    return NextResponse.json({
      message: 'Post save functionality not implemented yet',
      saved: false,
    });
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
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = (await context.params).id;

    // TODO: Implement saved posts functionality
    // The SavedPost model is not defined in the Prisma schema
    return NextResponse.json({
      saved: false,
      savedPostId: null,
    });
  } catch (error) {
    console.error('Error checking save status:', error);
    return NextResponse.json(
      { error: 'Failed to check save status' },
      { status: 500 }
    );
  }
}
