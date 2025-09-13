import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Params } from '@/types/nextjs';

// GET /api/users/[id]/posts - Listar posts de um usuário específico
export async function GET(
  request: NextRequest,
  { params }: Params<{ id: string }>
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'recent';

    const skip = (page - 1) * limit;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, is_public: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Construir filtros
    const where: {
      user_id: string;
      is_public: boolean;
      type?: string;
    } = {
      user_id: id,
      is_public: true,
    };

    if (type) {
      where.type = type;
    }

    // Construir ordenação
    let orderBy: Record<string, unknown> | Record<string, unknown>[] = { created_at: 'desc' };
    if (sortBy === 'popular') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'trending') {
      orderBy = [
        { likes: { _count: 'desc' } },
        { views: 'desc' },
        { comments: { _count: 'desc' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
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
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    );
  }
}
