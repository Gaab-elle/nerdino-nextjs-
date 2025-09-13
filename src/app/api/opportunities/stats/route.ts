import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/opportunities/stats - Estatísticas de oportunidades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // week, month, year, all

    // Calcular data de início baseada no período
    let startDate: Date | undefined;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = undefined;
    }

    const whereClause = startDate ? { created_at: { gte: startDate } } : {};

    // Buscar estatísticas em paralelo
    const [
      totalOpportunities,
      activeOpportunities,
      totalApplications,
      totalFavorites,
      averageSalary,
      topTechnologies,
      topCompanies,
      contractTypeStats,
      experienceLevelStats,
      locationStats,
      recentOpportunities,
    ] = await Promise.all([
      // Total de oportunidades
      prisma.jobOpportunity.count(),
      
      // Oportunidades ativas
      prisma.jobOpportunity.count({ where: { is_active: true } }),
      
      // Total de candidaturas
      prisma.jobApplication.count({ where: whereClause }),
      
      // Total de favoritos
      prisma.jobFavorite.count({ where: whereClause }),
      
      // Salário médio
      prisma.jobOpportunity.aggregate({
        where: {
          AND: [
            whereClause,
            { salary_max: { not: null } },
          ],
        },
        _avg: {
          salary_max: true,
        },
      }),
      
      // Tecnologias mais procuradas
      prisma.jobTechnology.groupBy({
        by: ['technology_id'],
        _count: {
          technology_id: true,
        },
        orderBy: {
          _count: {
            technology_id: 'desc',
          },
        },
        take: 10,
      }),
      
      // Empresas com mais oportunidades
      prisma.jobOpportunity.groupBy({
        by: ['company'],
        _count: {
          company: true,
        },
        where: whereClause,
        orderBy: {
          _count: {
            company: 'desc',
          },
        },
        take: 10,
      }),
      
      // Estatísticas por tipo de contrato
      prisma.jobOpportunity.groupBy({
        by: ['contract_type'],
        _count: {
          contract_type: true,
        },
        where: whereClause,
      }),
      
      // Estatísticas por nível de experiência
      prisma.jobOpportunity.groupBy({
        by: ['experience_level'],
        _count: {
          experience_level: true,
        },
        where: whereClause,
      }),
      
      // Estatísticas por localização
      prisma.jobOpportunity.groupBy({
        by: ['location'],
        _count: {
          location: true,
        },
        where: whereClause,
        orderBy: {
          _count: {
            location: 'desc',
          },
        },
        take: 10,
      }),
      
      // Oportunidades recentes
      prisma.jobOpportunity.findMany({
        where: whereClause,
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          technologies: {
            include: {
              technology: {
                select: {
                  name: true,
                  category: true,
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
      }),
    ]);

    // Buscar nomes das tecnologias
    const technologyIds = topTechnologies.map(t => t.technology_id);
    const technologies = await prisma.technology.findMany({
      where: { id: { in: technologyIds } },
      select: {
        id: true,
        name: true,
        category: true,
        icon_url: true,
        color: true,
      },
    });

    const topTechnologiesWithNames = topTechnologies.map(stat => {
      const tech = technologies.find(t => t.id === stat.technology_id);
      return {
        ...stat,
        technology: tech,
      };
    });

    // Calcular crescimento (comparar com período anterior)
    let growth = {};
    if (startDate) {
      const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const previousWhereClause = { created_at: { gte: previousStartDate, lt: startDate } };

      const [
        previousOpportunities,
        previousApplications,
        previousFavorites,
      ] = await Promise.all([
        prisma.jobOpportunity.count({ where: previousWhereClause }),
        prisma.jobApplication.count({ where: previousWhereClause }),
        prisma.jobFavorite.count({ where: previousWhereClause }),
      ]);

      growth = {
        opportunities: previousOpportunities > 0 ? ((totalOpportunities - previousOpportunities) / previousOpportunities * 100) : 0,
        applications: previousApplications > 0 ? ((totalApplications - previousApplications) / previousApplications * 100) : 0,
        favorites: previousFavorites > 0 ? ((totalFavorites - previousFavorites) / previousFavorites * 100) : 0,
      };
    }

    return NextResponse.json({
      period,
      stats: {
        totalOpportunities,
        activeOpportunities,
        totalApplications,
        totalFavorites,
        averageSalary: averageSalary._avg.salary_max,
        growth,
      },
      topTechnologies: topTechnologiesWithNames,
      topCompanies,
      contractTypeStats,
      experienceLevelStats,
      locationStats,
      recentOpportunities,
    });
  } catch (error) {
    console.error('Error fetching opportunity stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity stats' },
      { status: 500 }
    );
  }
}
