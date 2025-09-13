import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = (await context.params).id;
    
    if (!projectId || isNaN(parseInt(projectId))) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Verificar se o projeto pertence ao usuário
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        user_id: session.user.id
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Arquivar o projeto
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'archived',
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Project archived successfully',
      data: {
        id: updatedProject.id,
        status: updatedProject.status
      }
    });

  } catch (error) {
    console.error('Archive project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
