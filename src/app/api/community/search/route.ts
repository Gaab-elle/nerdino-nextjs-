import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/community/search - Busca avançada na comunidade
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // all, posts, users, tags
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, date, popularity

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const searchTerm = query.trim();

    let results: any = {};

    // Buscar posts
    if (type === 'all' || type === 'posts') {
      const whereClause = {
        AND: [
          { is_public: true },
          {
            OR: [
              { content: { contains: searchTerm, mode: 'insensitive' as const } },
              { title: { contains: searchTerm, mode: 'insensitive' as const } },
              {
                tags: {
                  some: {
                    tag: {
                      name: { contains: searchTerm, mode: 'insensitive' as const },
                    },
                  },
                },
              },
            ],
          },
        ],
      };

      let orderBy: any = { created_at: 'desc' };
      if (sortBy === 'popularity') {
        orderBy = [
          { likes: { _count: 'desc' } },
          { views: 'desc' },
          { comments: { _count: 'desc' } },
        ];
      }

      const [posts, totalPosts] = await Promise.all([
        prisma.post.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
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
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        }),
        prisma.post.count({ where: whereClause }),
      ]);

      results.posts = {
        data: posts,
        pagination: {
          page,
          limit,
          total: totalPosts,
          pages: Math.ceil(totalPosts / limit),
        },
      };
    }

    // Buscar usuários
    if (type === 'all' || type === 'users') {
      const whereClause = {
        AND: [
          { is_public: true },
          {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' as const } },
              { username: { contains: searchTerm, mode: 'insensitive' as const } },
              { bio: { contains: searchTerm, mode: 'insensitive' as const } },
            ],
          },
        ],
      };

      const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            image: true,
            bio: true,
            location: true,
            _count: {
              select: {
                followers: true,
                follows: true,
                posts: true,
              },
            },
          },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      results.users = {
        data: users,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit),
        },
      };
    }

    // Buscar tags
    if (type === 'all' || type === 'tags') {
      const whereClause = {
        name: { contains: searchTerm, mode: 'insensitive' as const },
      };

      const [tags, totalTags] = await Promise.all([
        prisma.tag.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                posts: true,
              },
            },
          },
        }),
        prisma.tag.count({ where: whereClause }),
      ]);

      results.tags = {
        data: tags,
        pagination: {
          page,
          limit,
          total: totalTags,
          pages: Math.ceil(totalTags / limit),
        },
      };
    }

    // Buscar projetos (se existir)
    if (type === 'all' || type === 'projects') {
      const whereClause = {
        AND: [
          { is_public: true },
          {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' as const } },
              { description: { contains: searchTerm, mode: 'insensitive' as const } },
              {
                technologies: {
                  some: {
                    technology: {
                      name: { contains: searchTerm, mode: 'insensitive' as const },
                    },
                  },
                },
              },
            ],
          },
        ],
      };

      const [projects, totalProjects] = await Promise.all([
        prisma.project.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
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
            technologies: {
              include: {
                technology: {
                  select: {
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
                likes: true,
                comments: true,
              },
            },
          },
        }),
        prisma.project.count({ where: whereClause }),
      ]);

      results.projects = {
        data: projects,
        pagination: {
          page,
          limit,
          total: totalProjects,
          pages: Math.ceil(totalProjects / limit),
        },
      };
    }

    return NextResponse.json({
      query: searchTerm,
      type,
      sortBy,
      results,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
