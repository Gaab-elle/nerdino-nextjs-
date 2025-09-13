import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';

// GET /api/posts - Listar posts com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: {
      is_public: boolean;
      type?: string;
      content?: { contains: string; mode: 'insensitive' };
      tags?: { some: { tag: { name: string } } };
    } = {
      is_public: true,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      };
    }

    // Construir ordenação
    let orderBy: any = { created_at: 'desc' };
    if (sortBy === 'popular') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'trending') {
      // Ordenar por likes + views + comentários
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
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Criar novo post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, type, image_url, link_url, link_title, link_description, link_image, tags } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Criar post
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        type: type || 'text',
        image_url,
        link_url,
        link_title,
        link_description,
        link_image,
        user_id: session.user.id,
      },
    });

    // Adicionar tags se fornecidas
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Criar ou encontrar tag
        const tag = await prisma.tag.upsert({
          where: { name: tagName.toLowerCase() },
          update: {},
          create: {
            name: tagName.toLowerCase(),
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          },
        });

        // Conectar post com tag
        await prisma.postTag.create({
          data: {
            post_id: post.id,
            tag_id: tag.id,
          },
        });
      }
    }

    // Buscar post completo com relacionamentos
    const fullPost = await prisma.post.findUnique({
      where: { id: post.id },
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

    return NextResponse.json(fullPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
