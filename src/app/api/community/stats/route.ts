import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/community/stats - Estatísticas da comunidade
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, year, all

    // Calcular data de início baseada no período
    let startDate: Date | undefined;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = undefined;
    }

    const whereClause = startDate ? { created_at: { gte: startDate } } : {};

    // Buscar estatísticas em paralelo
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalLikes,
      totalFollows,
      activeUsers,
      popularTags,
      topPosts,
      recentActivity,
    ] = await Promise.all([
      // Total de usuários
      prisma.user.count(),
      
      // Total de posts
      prisma.post.count({ where: whereClause }),
      
      // Total de comentários
      prisma.comment.count({ where: whereClause }),
      
      // Total de likes
      prisma.like.count({ where: whereClause }),
      
      // Total de follows
      prisma.follow.count({ where: whereClause }),
      
      // Usuários ativos (que fizeram posts, comentários ou likes no período)
      prisma.user.count({
        where: {
          OR: [
            { posts: { some: whereClause } },
            { comments: { some: whereClause } },
            { likes: { some: whereClause } },
          ],
        },
      }),
      
      // Tags mais populares
      prisma.tag.findMany({
        take: 10,
        orderBy: {
          posts: { _count: 'desc' },
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      }),
      
      // Posts mais populares
      prisma.post.findMany({
        where: whereClause,
        take: 5,
        orderBy: [
          { likes: { _count: 'desc' } },
          { views: 'desc' },
          { comments: { _count: 'desc' } },
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
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
      
      // Atividade recente
      prisma.post.findMany({
        where: whereClause,
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar_url: true,
            },
          },
          tags: {
            include: {
              tag: true,
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
    ]);

    // Calcular crescimento (comparar com período anterior)
    let growth = {};
    if (startDate) {
      const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const previousWhereClause = { created_at: { gte: previousStartDate, lt: startDate } };

      const [
        previousPosts,
        previousComments,
        previousLikes,
        previousFollows,
      ] = await Promise.all([
        prisma.post.count({ where: previousWhereClause }),
        prisma.comment.count({ where: previousWhereClause }),
        prisma.like.count({ where: previousWhereClause }),
        prisma.follow.count({ where: previousWhereClause }),
      ]);

      growth = {
        posts: previousPosts > 0 ? ((totalPosts - previousPosts) / previousPosts * 100) : 0,
        comments: previousComments > 0 ? ((totalComments - previousComments) / previousComments * 100) : 0,
        likes: previousLikes > 0 ? ((totalLikes - previousLikes) / previousLikes * 100) : 0,
        follows: previousFollows > 0 ? ((totalFollows - previousFollows) / previousFollows * 100) : 0,
      };
    }

    return NextResponse.json({
      period,
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        totalLikes,
        totalFollows,
        activeUsers,
        growth,
      },
      popularTags,
      topPosts,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community stats' },
      { status: 500 }
    );
  }
}
