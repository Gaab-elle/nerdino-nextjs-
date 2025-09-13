import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OpportunityAdapter } from '@/adapters/opportunityAdapter';

// GET /api/opportunities - Listar oportunidades com filtros avançados
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const contractType = searchParams.get('contractType');
    const experienceLevel = searchParams.get('experienceLevel');
    const workMode = searchParams.get('workMode');
    const companySize = searchParams.get('companySize');
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');
    const technologies = searchParams.get('technologies');
    const isRemote = searchParams.get('isRemote');
    const isFeatured = searchParams.get('isFeatured');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, salary, views, featured

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Record<string, unknown> = {
      is_active: true,
    };

    // Filtro de busca
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { requirements: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (contractType) {
      where.contract_type = contractType;
    }

    if (experienceLevel) {
      where.experience_level = experienceLevel;
    }

    if (workMode) {
      if (workMode === 'remote') {
        where.is_remote = true;
      } else if (workMode === 'onsite') {
        where.is_remote = false;
      }
    }

    if (companySize) {
      where.company_size = companySize;
    }

    if (salaryMin) {
      where.salary_min = { gte: parseInt(salaryMin) };
    }

    if (salaryMax) {
      where.salary_max = { lte: parseInt(salaryMax) };
    }

    if (isRemote === 'true') {
      where.is_remote = true;
    } else if (isRemote === 'false') {
      where.is_remote = false;
    }

    if (isFeatured === 'true') {
      where.is_featured = true;
    }

    // Filtro por tecnologias
    if (technologies) {
      const techArray = technologies.split(',').map(t => t.trim());
      where.technologies = {
        some: {
          technology: {
            name: { in: techArray },
          },
        },
      };
    }

    // Construir ordenação
    let orderBy: Record<string, unknown> | Record<string, unknown>[] = { created_at: 'desc' };
    if (sortBy === 'salary') {
      orderBy = { salary_max: 'desc' };
    } else if (sortBy === 'views') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'featured') {
      orderBy = [
        { is_featured: 'desc' },
        { created_at: 'desc' },
      ];
    }

    const [opportunities, total] = await Promise.all([
      prisma.jobOpportunity.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.jobOpportunity.count({ where }),
    ]);

    // Verificar se o usuário favoritou cada oportunidade
    const session = await getServerSession(authOptions);
    const opportunitiesWithFavorites = await Promise.all(
      opportunities.map(async (opportunity) => {
        let isFavorited = false;
        if (session?.user?.id) {
          const favorite = await prisma.jobFavorite.findFirst({
            where: {
              user_id: session.user.id,
              job_id: opportunity.id,
            },
          });
          isFavorited = !!favorite;
        }

        return {
          ...opportunity,
          isFavorited,
        };
      })
    );

    return NextResponse.json({
      opportunities: opportunitiesWithFavorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        search,
        location,
        contractType,
        experienceLevel,
        workMode,
        companySize,
        salaryMin,
        salaryMax,
        technologies,
        isRemote,
        isFeatured,
        sortBy,
      },
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

// POST /api/opportunities - Criar nova oportunidade (admin/recruiter)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      title: string;
      company: string;
      description: string;
      requirements: string;
      benefits?: string;
      location: string;
      is_remote?: boolean;
      salary_min?: string | number;
      salary_max?: string | number;
      currency?: string;
      contract_type?: string;
      experience_level?: string;
      company_size?: string;
      is_featured?: boolean;
      technologies?: string[];
    };
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
      technologies,
    } = body;

    // Validações básicas
    if (!title || !company || !description || !requirements || !location) {
      return NextResponse.json(
        { error: 'Title, company, description, requirements, and location are required' },
        { status: 400 }
      );
    }

    // Criar oportunidade
    const opportunity = await prisma.jobOpportunity.create({
      data: {
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        benefits: benefits?.trim(),
        location: location.trim(),
        is_remote: is_remote || false,
        salary_min: salary_min ? parseInt(String(salary_min)) : null,
        salary_max: salary_max ? parseInt(String(salary_max)) : null,
        currency: currency || 'BRL',
        contract_type: contract_type || 'CLT',
        experience_level: experience_level || 'mid',
        company_size: company_size || null,
        is_featured: is_featured || false,
      },
    });

    // Adicionar tecnologias se fornecidas
    if (technologies && technologies.length > 0) {
      for (const techName of technologies) {
        // Criar ou encontrar tecnologia
        const technology = await prisma.technology.upsert({
          where: { name: techName.toLowerCase() },
          update: {},
          create: {
            name: techName.toLowerCase(),
            category: 'other',
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          },
        });

        // Conectar oportunidade com tecnologia
        await prisma.jobTechnology.create({
          data: {
            job_id: opportunity.id,
            technology_id: technology.id,
          },
        });
      }
    }

    // Buscar oportunidade completa com relacionamentos
    const fullOpportunity = await prisma.jobOpportunity.findUnique({
      where: { id: opportunity.id },
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

    return NextResponse.json(fullOpportunity, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
