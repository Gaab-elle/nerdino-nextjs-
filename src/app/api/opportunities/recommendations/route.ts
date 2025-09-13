import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';

// GET /api/opportunities/recommendations - Recomendações personalizadas
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Buscar perfil do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        skills: {
          include: {
            technology: true,
          },
        },
        projects: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
        applications: {
          select: {
            job_id: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extrair tecnologias do usuário
    const userTechnologies = [
      ...user.skills.map((skill: { technology: { name: string } }) => skill.technology.name),
      ...user.projects.flatMap((project: { 
        technologies: Array<{ technology: { name: string } }> 
      }) => 
        project.technologies.map((pt: { technology: { name: string } }) => pt.technology.name)
      ),
    ];

    // Remover duplicatas
    const uniqueUserTechnologies = [...new Set(userTechnologies)];

    // IDs das oportunidades já aplicadas
    const appliedJobIds = user.applications.map((app: { job_id: string }) => app.job_id);

    // Buscar oportunidades recomendadas
    const recommendations = await prisma.jobOpportunity.findMany({
      where: {
        AND: [
          { is_active: true },
          { id: { notIn: appliedJobIds } },
          {
            OR: [
              // Oportunidades com tecnologias que o usuário conhece
              {
                technologies: {
                  some: {
                    technology: {
                      name: { in: uniqueUserTechnologies },
                    },
                  },
                },
              },
              // Oportunidades que correspondem às preferências do usuário
              {
                contract_type: user.contract_type || undefined,
              },
              // {
              //   work_mode: user.work_mode || undefined,
              // },
              {
                experience_level: 'mid', // Default para usuários sem preferência
              },
            ],
          },
        ],
      },
      take: limit * 2, // Buscar mais para filtrar depois
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

    // Calcular score de compatibilidade para cada oportunidade
    const scoredRecommendations = recommendations.map((opportunity: {
      technologies: Array<{ technology: { name: string } }>;
      contract_type?: string;
      _count: { applications: number };
      created_at: Date;
      id: string;
      is_remote?: boolean;
      salary_max?: number | null;
      salary_min?: number | null;
    }) => {
      let score = 0;  
      let matchedTechnologies = 0;
      const totalTechnologies = opportunity.technologies.length;

      // Score baseado em tecnologias
      opportunity.technologies.forEach((jobTech: { technology: { name: string } }) => {
        if (uniqueUserTechnologies.includes(jobTech.technology.name)) {
          matchedTechnologies++;
          score += 10; // 10 pontos por tecnologia compatível
        }
      });

      // Score baseado em preferências do usuário
      if (user.contract_type && opportunity.contract_type === user.contract_type) {
        score += 15;
      }

      if (user.work_mode && opportunity.is_remote === (user.work_mode === 'remote')) {
        score += 15;
      }

      if (user.salary_min && opportunity.salary_max && opportunity.salary_max >= user.salary_min) {
        score += 20;
      }

      if (user.salary_max && opportunity.salary_min && opportunity.salary_min <= user.salary_max) {
        score += 20;
      }

      // Score baseado em popularidade (menos aplicações = mais chance)
      if (opportunity._count.applications < 10) {
        score += 5;
      }

      // Score baseado em recência
      const daysSinceCreated = Math.floor(
        (Date.now() - opportunity.created_at.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreated < 7) {
        score += 10;
      } else if (daysSinceCreated < 30) {
        score += 5;
      }

      return {
        ...opportunity,
        compatibilityScore: score,
        technologyMatch: {
          matched: matchedTechnologies,
          total: totalTechnologies,
          percentage: totalTechnologies > 0 ? (matchedTechnologies / totalTechnologies) * 100 : 0,
        },
      };
    });

    // Ordenar por score e pegar os melhores
    const topRecommendations = scoredRecommendations
      .sort((a: { compatibilityScore: number }, b: { compatibilityScore: number }) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);

    // Buscar oportunidades em destaque se não houver recomendações suficientes
    if (topRecommendations.length < limit) {
      const featuredOpportunities = await prisma.jobOpportunity.findMany({
        where: {
          AND: [
            { is_active: true },
            { is_featured: true },
            { id: { notIn: [...appliedJobIds, ...topRecommendations.map((r: { id: string }) => r.id)] } },
          ],
        },
        take: limit - topRecommendations.length,
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

      const featuredWithScore = featuredOpportunities.map((opportunity: {
        id: string;
        title: string;
        company: string;
        description: string;
        location: string;
        is_remote: boolean;
        salary_min?: number | null;
        salary_max?: number | null;
        contract_type: string;
        experience_level: string;
        company_size?: string | null;
        is_featured: boolean;
        created_at: Date;
        technologies: Array<{ technology: { name: string; id: string; category: string; icon_url: string | null; color: string | null } }>;
        _count: { applications: number; favorites: number };
      }) => ({
        ...opportunity,
        compatibilityScore: 5, // Score baixo para destacadas
        technologyMatch: {
          matched: 0,
          total: opportunity.technologies.length,
          percentage: 0,
        },
      }));

      topRecommendations.push(...featuredWithScore);
    }

    return NextResponse.json({
      recommendations: topRecommendations,
      userProfile: {
        technologies: uniqueUserTechnologies,
        preferences: {
          contractType: user.contract_type,
          workMode: user.work_mode,
          salaryRange: {
            min: user.salary_min,
            max: user.salary_max,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
