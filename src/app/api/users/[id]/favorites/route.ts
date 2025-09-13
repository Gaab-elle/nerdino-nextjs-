import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Params } from '@/types/nextjs';

// GET /api/users/[id]/favorites - Listar oportunidades favoritadas do usuário
export async function GET(
  request: NextRequest,
  { params }: Params<{ id: string }>
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = id;

    // Só pode ver seus próprios favoritos
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

    const [favorites, total] = await Promise.all([
      prisma.jobFavorite.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          job: {
            include: {
              technologies: {
                include: {
                  technology: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      icon_url: true,
                      color: true,
                    },
                  },
                },
              },
              applications: {
                select: {
                  id: true,
                  status: true,
                },
              },
              _count: {
                select: {
                  applications: true,
                  favorites: true,
                },
              },
            },
          },
        },
      }),
      prisma.jobFavorite.count({ where: { user_id: userId } }),
    ]);

    // Verificar se o usuário se candidatou a cada oportunidade
    const favoritesWithApplicationStatus = await Promise.all(
      favorites.map(async (favorite) => {
        const application = await prisma.jobApplication.findFirst({
          where: {
            user_id: userId,
            job_id: favorite.job.id,
          },
        });

        return {
          ...favorite.job,
          favoritedAt: favorite.created_at,
          hasApplied: !!application,
          applicationStatus: application?.status || null,
        };
      })
    );

    return NextResponse.json({
      favorites: favoritesWithApplicationStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}
