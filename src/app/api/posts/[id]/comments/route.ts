import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notifications';

// GET /api/posts/[id]/comments - Listar comentários do post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const parentId = searchParams.get('parentId'); // Para comentários aninhados

    const skip = (page - 1) * limit;

    const where: any = {
      post_id: params.id,
      is_public: true,
    };

    if (parentId) {
      where.parent_id = parentId;
    } else {
      where.parent_id = null; // Apenas comentários de primeiro nível
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { created_at: 'asc' },
        skip,
        take: limit,
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
          likes: {
            select: {
              id: true,
              user_id: true,
            },
          },
          replies: {
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
              likes: {
                select: {
                  id: true,
                  user_id: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  replies: true,
                },
              },
            },
            orderBy: { created_at: 'asc' },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - Criar novo comentário
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, parent_id } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verificar se o post existe e buscar o dono
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true, user_id: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Se parent_id for fornecido, verificar se o comentário pai existe
    if (parent_id) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parent_id },
        select: { id: true, post_id: true },
      });

      if (!parentComment || parentComment.post_id !== params.id) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Criar comentário
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        user_id: session.user.id,
        post_id: params.id,
        parent_id: parent_id || null,
      },
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
        likes: {
          select: {
            id: true,
            user_id: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    // Criar notificação para o dono do post
    try {
      const commenter = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true },
      });

      if (commenter) {
        await NotificationService.createPostCommentNotification(
          params.id,
          post.user_id,
          session.user.id,
          commenter.name || commenter.username || 'Usuário',
          content.trim()
        );
      }
    } catch (notificationError) {
      console.error('Error creating comment notification:', notificationError);
      // Não falhar a operação principal por causa da notificação
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
