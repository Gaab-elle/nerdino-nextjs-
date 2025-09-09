import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/opportunities/[id]/favorite - Favoritar/desfavoritar oportunidade
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const opportunityId = params.id;

    // Verificar se a oportunidade existe
    const opportunity = await prisma.jobOpportunity.findUnique({
      where: { id: opportunityId },
      select: { id: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Verificar se o usuário já favoritou a oportunidade
    const existingFavorite = await prisma.jobFavorite.findFirst({
      where: {
        user_id: session.user.id,
        job_id: opportunityId,
      },
    });

    if (existingFavorite) {
      // Desfavoritar - remover favorito
      await prisma.jobFavorite.delete({
        where: { id: existingFavorite.id },
      });

      return NextResponse.json({
        message: 'Opportunity unfavorited',
        favorited: false,
      });
    } else {
      // Favoritar - adicionar favorito
      await prisma.jobFavorite.create({
        data: {
          user_id: session.user.id,
          job_id: opportunityId,
        },
      });

      return NextResponse.json({
        message: 'Opportunity favorited',
        favorited: true,
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}

// GET /api/opportunities/[id]/favorite - Verificar se a oportunidade está favoritada
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const opportunityId = params.id;

    const favorite = await prisma.jobFavorite.findFirst({
      where: {
        user_id: session.user.id,
        job_id: opportunityId,
      },
    });

    return NextResponse.json({
      favorited: !!favorite,
      favoriteId: favorite?.id || null,
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}
