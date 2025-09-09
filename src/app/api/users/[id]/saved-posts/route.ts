import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id]/saved-posts - Listar posts salvos do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Só pode ver seus próprios posts salvos
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const [savedPosts, total] = await Promise.all([
      prisma.savedPost.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          post: {
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
          },
        },
      }),
      prisma.savedPost.count({ where: { user_id: userId } }),
    ]);

    // Verificar se o usuário curtiu cada post
    const postsWithLikeStatus = await Promise.all(
      savedPosts.map(async (savedPost) => {
        const like = await prisma.like.findFirst({
          where: {
            user_id: session.user.id,
            post_id: savedPost.post.id,
          },
        });

        return {
          ...savedPost.post,
          liked: !!like,
          savedAt: savedPost.created_at,
        };
      })
    );

    return NextResponse.json({
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved posts' },
      { status: 500 }
    );
  }
}
