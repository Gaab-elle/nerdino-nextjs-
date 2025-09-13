import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';

// GET /api/feed - Feed personalizado do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // 'following', 'trending', 'recommended'

    const skip = (page - 1) * limit;

    const where: any = {
      is_public: true,
    };

    // Feed baseado no tipo
    if (type === 'following') {
      // Posts de usuários que o usuário segue
      const following = await prisma.follow.findMany({
        where: { follower_id: session.user.id },
        select: { following_id: true },
      });

      const followingIds = following.map(f => f.following_id);
      
      if (followingIds.length > 0) {
        (where as any).author_id = { in: followingIds };
      } else {
        // Se não segue ninguém, retornar posts populares
        (where as any) = {
          is_public: true,
        };
      }
    } else if (type === 'trending') {
      // Posts em alta (baseado em likes e views recentes)
      (where as any) = {
        is_public: true,
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
        },
      };
    } else if (type === 'recommended') {
      // Posts recomendados baseados em tags que o usuário interage
      const userPosts = await prisma.post.findMany({
        where: { user_id: session.user.id },
        include: { tags: { include: { tag: true } } },
      });

      const userTags = userPosts.flatMap(post => 
        post.tags.map(pt => pt.tag.name)
      );

      if (userTags.length > 0) {
        (where as any).tags = {
          some: {
            tag: {
              name: { in: userTags },
            },
          },
        };
      }
    }

    // Buscar posts
    const posts = await prisma.post.findMany({
      where,
      orderBy: type === 'trending' 
        ? [
            { likes: { _count: 'desc' } },
            { views: 'desc' },
            { created_at: 'desc' },
          ]
        : { created_at: 'desc' },
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
    });

    // Buscar total para paginação
    const total = await prisma.post.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      type,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}
