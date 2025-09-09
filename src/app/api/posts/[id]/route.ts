import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/posts/[id] - Buscar post específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            image: true,
            bio: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        likes: {
          select: {
            id: true,
            user_id: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
                image: true,
              },
            },
          },
        },
        comments: {
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
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Incrementar visualizações
    await prisma.post.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Atualizar post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, type, image_url, link_url, link_title, link_description, link_image, tags } = body;

    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      select: { user_id: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Atualizar post
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        content: content.trim(),
        type: type || 'text',
        image_url,
        link_url,
        link_title,
        link_description,
        link_image,
      },
    });

    // Atualizar tags se fornecidas
    if (tags !== undefined) {
      // Remover tags existentes
      await prisma.postTag.deleteMany({
        where: { post_id: params.id },
      });

      // Adicionar novas tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName.toLowerCase() },
            update: {},
            create: {
              name: tagName.toLowerCase(),
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            },
          });

          await prisma.postTag.create({
            data: {
              post_id: params.id,
              tag_id: tag.id,
            },
          });
        }
      }
    }

    // Buscar post atualizado com relacionamentos
    const fullPost = await prisma.post.findUnique({
      where: { id: params.id },
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
        tags: {
          include: {
            tag: true,
          },
        },
        likes: {
          select: {
            id: true,
            user_id: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(fullPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Deletar post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      select: { user_id: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Deletar post (cascade vai deletar likes, comments, tags)
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
