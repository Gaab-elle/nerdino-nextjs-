import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Buscar projetos do perfil com visibilidade
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('🔐 Session check:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userEmail: session?.user?.email 
    });
    
    if (!session?.user?.id) {
      console.log('❌ No session found - using development mode');
      // TODO: Remove this in production - only for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: allowing access without session');
      } else {
        return NextResponse.json(
          { error: 'Unauthorized - No session found' },
          { status: 401 }
        );
      }
    }

    // Buscar projetos do usuário com informações de visibilidade
    const projects = await prisma.project.findMany({
      where: {
        // Em modo de desenvolvimento, não filtrar por user_id
        ...(session?.user?.id ? { user_id: session.user.id } : {})
      },
      include: {
        technologies: {
          include: {
            technology: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transformar para o formato esperado pelo frontend
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.title,
      description: project.description,
      technologies: project.technologies.map((t: { technology: { name: string } }) => t.technology.name),
      status: project.status,
      stars: project.stars || 0,
      forks: project.forks || 0,
      progress: project.progress || 0,
      lastUpdate: formatLastUpdate(project.updated_at),
      createdAt: project.created_at.toISOString().split('T')[0],
      demoUrl: project.demo_url,
      githubUrl: project.github_url,
      image: project.image_url || getDefaultProjectImage(project.title),
      isVisible: project.is_public, // Usar is_public como visibilidade no perfil
      featured: false // Por enquanto, todos não são destaque
    }));

    return NextResponse.json({
      success: true,
      data: transformedProjects
    });

  } catch (error) {
    console.error('Get profile projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar visibilidade dos projetos
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session found - using development mode');
      // TODO: Remove this in production - only for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: allowing update without session');
      } else {
        return NextResponse.json(
          { error: 'Unauthorized - No session found' },
          { status: 401 }
        );
      }
    }

    const body = await request.json() as any;
    const { projectId, isVisible, featured } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verificar se o projeto pertence ao usuário
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        // Em modo de desenvolvimento, não verificar user_id
        ...(session?.user?.id ? { user_id: session.user.id } : {})
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Atualizar visibilidade do projeto
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        is_public: isVisible !== undefined ? isVisible : existingProject.is_public,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Project visibility updated successfully',
      data: {
        id: updatedProject.id,
        isVisible: updatedProject.is_public
      }
    });

  } catch (error) {
    console.error('Update project visibility error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Função auxiliar para formatar última atualização
function formatLastUpdate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Agora mesmo';
  } else if (diffInDays === 1) {
    return '1 dia atrás';
  } else if (diffInDays < 7) {
    return `${diffInDays} dias atrás`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
}

// Função auxiliar para gerar imagem padrão
function getDefaultProjectImage(title: string): string {
  const images = [
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop'
  ];
  
  // Usar hash simples do título para escolher imagem consistente
  const hash = title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return images[Math.abs(hash) % images.length];
}
