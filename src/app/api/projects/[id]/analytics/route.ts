import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = params.id;
    
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Verificar se o projeto pertence ao usuário
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user_id: session.user.id
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            views: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Dados de analytics simulados (em produção, viriam de analytics reais)
    const analytics = {
      project: {
        id: project.id,
        title: project.title,
        status: project.status
      },
      metrics: {
        views: project.views || 0,
        likes: project._count.likes,
        comments: project._count.comments,
        stars: project.stars || 0,
        forks: project.forks || 0
      },
      timeline: {
        created: project.created_at,
        updated: project.updated_at,
        lastActivity: project.updated_at
      },
      performance: {
        progress: project.progress || 0,
        completionRate: project.progress || 0,
        averageRating: 4.2 // Simulado
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get project analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
