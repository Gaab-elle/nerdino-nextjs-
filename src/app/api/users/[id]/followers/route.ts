import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Params } from '@/types/nextjs';

// GET /api/users/[id]/followers - Listar seguidores do usuário
export async function GET(
  request: NextRequest,
  { params }: Params<{ id: string }>
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;
    const userId = id;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, is_public: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar se pode ver os seguidores
    if (!user.is_public && session?.user?.id !== userId) {
      return NextResponse.json(
        { error: 'User profile is private' },
        { status: 403 }
      );
    }

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { following_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
              image: true,
              bio: true,
              _count: {
                select: {
                  followers: true,
                  follows: true,
                  posts: true,
                },
              },
            },
          },
        },
      }),
      prisma.follow.count({ where: { following_id: userId } }),
    ]);

    // Verificar se o usuário logado está seguindo cada seguidor
    const followersWithFollowStatus = await Promise.all(
      followers.map(async (follow) => {
        let isFollowing = false;
        if (session?.user?.id) {
          const followStatus = await prisma.follow.findFirst({
            where: {
              follower_id: session.user.id,
              following_id: follow.follower.id,
            },
          });
          isFollowing = !!followStatus;
        }

        return {
          ...follow.follower,
          isFollowing,
          followedAt: follow.created_at,
        };
      })
    );

    return NextResponse.json({
      followers: followersWithFollowStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    );
  }
}
