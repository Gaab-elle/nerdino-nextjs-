import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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
        console.log('🔧 Development mode: allowing creation without session');
      } else {
        return NextResponse.json(
          { error: 'Unauthorized - No session found' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    console.log('📝 Dados recebidos para criação:', body);
    const { name, description, technologies, status, progress, demoUrl, githubUrl, image } = body;

    // Validar dados obrigatórios
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Em modo de desenvolvimento, criar ou usar usuário padrão
    let userId = session?.user?.id;
    if (!userId) {
      // Verificar se existe usuário de desenvolvimento
      let devUser = await prisma.user.findFirst({
        where: { email: 'dev@nerdino.com' }
      });
      
      if (!devUser) {
        // Criar usuário de desenvolvimento
        devUser = await prisma.user.create({
          data: {
            email: 'dev@nerdino.com',
            name: 'Developer',
            username: 'developer',
            avatar_url: '',
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
      
      userId = devUser.id;
    }

    // Criar o projeto
    const newProject = await prisma.project.create({
      data: {
        title: name,
        description: description,
        status: status || 'active',
        progress: progress || 0,
        demo_url: demoUrl || null,
        github_url: githubUrl || null,
        image_url: image || null,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Projeto criado:', newProject.title);

    // Adicionar tecnologias se fornecidas
    if (technologies && Array.isArray(technologies) && technologies.length > 0) {
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
            project_id: newProject.id,
            technology_id: technology.id
          }
        });
      }
    }

    // Buscar o projeto criado com tecnologias
    const createdProject = await prisma.project.findUnique({
      where: { id: newProject.id },
      include: {
        technologies: {
          include: {
            technology: true
          }
        }
      }
    });

    if (!createdProject) {
      return NextResponse.json(
        { error: 'Project not found after creation' },
        { status: 500 }
      );
    }

    // Transformar para o formato esperado pelo frontend
    const transformedProject = {
      id: createdProject.id,
      name: createdProject.title,
      description: createdProject.description,
      technologies: createdProject.technologies.map((t: any) => t.technology.name),
      status: createdProject.status,
      stars: createdProject.stars || 0,
      forks: createdProject.forks || 0,
      progress: createdProject.progress || 0,
      lastUpdate: 'Agora mesmo',
      createdAt: createdProject.created_at.toISOString().split('T')[0],
      demoUrl: createdProject.demo_url,
      githubUrl: createdProject.github_url,
      image: createdProject.image_url || getDefaultProjectImage(createdProject.title)
    };

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: transformedProject
    });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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