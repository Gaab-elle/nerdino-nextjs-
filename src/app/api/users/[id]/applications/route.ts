import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id]/applications - Listar candidaturas do usuário
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

    // Só pode ver suas próprias candidaturas
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // pending, reviewed, accepted, rejected

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      user_id: userId,
    };

    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
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
      prisma.jobApplication.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
