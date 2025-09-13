import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
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
        console.log('🔧 Development mode: allowing edit without session');
      } else {
        return NextResponse.json(
          { error: 'Unauthorized - No session found' },
          { status: 401 }
        );
      }
    }

    const projectId = (await context.params).id;
    
    if (!projectId) {
      console.log('❌ Project ID is missing');
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }
    
    console.log('🆔 Project ID:', projectId, 'type:', typeof projectId);

    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    const { name, description, technologies, status, progress, demoUrl, githubUrl, image } = body;

    // Verificar se o projeto pertence ao usuário
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        // Em modo de desenvolvimento, não verificar user_id
        ...(session?.user?.id ? { user_id: session.user.id } : {})
      }
    });

    if (!existingProject) {
      console.log('❌ Projeto não encontrado:', projectId);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Projeto encontrado:', existingProject.title);

    // Atualizar tecnologias se fornecidas
    if (technologies && Array.isArray(technologies)) {
      // Remover tecnologias existentes
      await prisma.projectTechnology.deleteMany({
        where: { project_id: projectId }
      });

      // Adicionar novas tecnologias
      for (const techName of technologies) {
        // Verificar se a tecnologia existe, se não, criar
        let technology = await prisma.technology.findFirst({
          where: { name: techName }
        });

        if (!technology) {
          technology = await prisma.technology.create({
            data: { 
              name: techName,
              category: 'other' // Categoria padrão
            }
          });
        }

        // Conectar tecnologia ao projeto
        await prisma.projectTechnology.create({
          data: {
            project_id: projectId,
            technology_id: technology.id
          }
        });
      }
    }

    // Atualizar o projeto
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: name || existingProject.title,
        description: description || existingProject.description,
        status: status || existingProject.status,
        progress: progress !== undefined ? progress : existingProject.progress,
        demo_url: demoUrl || existingProject.demo_url,
        github_url: githubUrl || existingProject.github_url,
        image_url: image || existingProject.image_url,
        updated_at: new Date()
      },
      include: {
        technologies: {
          include: {
            technology: true
          }
        }
      }
    });

    // Transformar para o formato esperado pelo frontend
    const transformedProject = {
      id: parseInt(updatedProject.id),
      name: updatedProject.title,
      description: updatedProject.description,
      technologies: updatedProject.technologies.map((t: { technology: { name: string } }) => t.technology.name),
      status: updatedProject.status,
      stars: updatedProject.stars || 0,
      forks: updatedProject.forks || 0,
      progress: updatedProject.progress || 0,
      lastUpdate: formatLastUpdate(updatedProject.updated_at),
      createdAt: updatedProject.created_at.toISOString().split('T')[0],
      demoUrl: updatedProject.demo_url,
      githubUrl: updatedProject.github_url,
      image: updatedProject.image_url || getDefaultProjectImage(updatedProject.title)
    };

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: transformedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatLastUpdate(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

  if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`
  } else if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'} atrás`
  } else {
    return 'Agora mesmo'
  }
}

function getDefaultProjectImage(title: string): string {
  // Generate a default image based on project title
  const images = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop", // Code
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop", // E-commerce
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop", // Task management
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop", // Analytics
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"  // Dashboard
  ];
  
  // Use project title to determine image
  const hash = title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return images[Math.abs(hash) % images.length];
}