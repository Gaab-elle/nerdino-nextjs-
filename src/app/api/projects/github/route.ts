import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    // Get projects that have GitHub URLs (synced from GitHub)
    const projects = await prisma.project.findMany({
      where: {
        github_url: {
          not: null,
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
          },
        },
        technologies: {
          include: {
            technology: true,
          },
        },
      },
    });

    const total = await prisma.project.count({
      where: {
        github_url: {
          not: null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('GitHub projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub projects' },
      { status: 500 }
    );
  }
}
