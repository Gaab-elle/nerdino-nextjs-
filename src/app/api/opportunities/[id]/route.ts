import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/opportunities/[id] - Buscar oportunidade específica
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const opportunityId = (await context.params).id;

    const opportunity = await prisma.jobOpportunity.findUnique({
      where: { id: opportunityId },
      include: {
        technologies: {
          include: {
            technology: {
              select: {
                id: true,
                name: true,
                category: true,
                icon_url: true,
                color: true,
              },
            },
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
            created_at: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
        favorites: {
          select: {
            id: true,
            user_id: true,
          },
        },
        _count: {
          select: {
            applications: true,
            favorites: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Incrementar visualizações
    await prisma.jobOpportunity.update({
      where: { id: opportunityId },
      data: { views: { increment: 1 } },
    });

    // Verificar se o usuário favoritou a oportunidade
    const session = await getServerSession(authOptions);
    let isFavorited = false;
    let hasApplied = false;
    let userApplication = null;

    if (session?.user?.id) {
      const favorite = await prisma.jobFavorite.findFirst({
        where: {
          user_id: session.user.id,
          job_id: opportunityId,
        },
      });
      isFavorited = !!favorite;

      const application = await prisma.jobApplication.findFirst({
        where: {
          user_id: session.user.id,
          job_id: opportunityId,
        },
      });
      hasApplied = !!application;
      userApplication = application;
    }

    return NextResponse.json({
      ...opportunity,
      isFavorited,
      hasApplied,
      userApplication,
    });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}

// PUT /api/opportunities/[id] - Atualizar oportunidade
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const opportunityId = (await context.params).id;
    const body = await request.json();
    const {
      title,
      company,
      description,
      requirements,
      benefits,
      location,
      is_remote,
      salary_min,
      salary_max,
      currency,
      contract_type,
      experience_level,
      company_size,
      is_featured,
      is_active,
      technologies,
    } = body;

    // Verificar se a oportunidade existe
    const existingOpportunity = await prisma.jobOpportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!existingOpportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Atualizar oportunidade
    const updatedOpportunity = await prisma.jobOpportunity.update({
      where: { id: opportunityId },
      data: {
        title: title?.trim(),
        company: company?.trim(),
        description: description?.trim(),
        requirements: requirements?.trim(),
        benefits: benefits?.trim(),
        location: location?.trim(),
        is_remote,
        salary_min: salary_min ? parseInt(salary_min) : null,
        salary_max: salary_max ? parseInt(salary_max) : null,
        currency,
        contract_type,
        experience_level,
        company_size,
        is_featured,
        is_active,
        updated_at: new Date(),
      },
    });

    // Atualizar tecnologias se fornecidas
    if (technologies && Array.isArray(technologies)) {
      // Remover tecnologias existentes
      await prisma.jobTechnology.deleteMany({
        where: { job_id: opportunityId },
      });

      // Adicionar novas tecnologias
      for (const techName of technologies) {
        const technology = await prisma.technology.upsert({
          where: { name: techName.toLowerCase() },
          update: {},
          create: {
            name: techName.toLowerCase(),
            category: 'other',
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          },
        });

        await prisma.jobTechnology.create({
          data: {
            job_id: opportunityId,
            technology_id: technology.id,
          },
        });
      }
    }

    // Buscar oportunidade atualizada com relacionamentos
    const fullOpportunity = await prisma.jobOpportunity.findUnique({
      where: { id: opportunityId },
      include: {
        technologies: {
          include: {
            technology: {
              select: {
                id: true,
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
            applications: true,
            favorites: true,
          },
        },
      },
    });

    return NextResponse.json(fullOpportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}

// DELETE /api/opportunities/[id] - Deletar oportunidade
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const opportunityId = (await context.params).id;

    // Verificar se a oportunidade existe
    const opportunity = await prisma.jobOpportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Deletar oportunidade (cascade deletará relacionamentos)
    await prisma.jobOpportunity.delete({
      where: { id: opportunityId },
    });

    return NextResponse.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    );
  }
}
