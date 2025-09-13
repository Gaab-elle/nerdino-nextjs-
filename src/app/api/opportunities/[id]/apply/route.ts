import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notifications';

// POST /api/opportunities/[id]/apply - Candidatar-se a uma oportunidade
export async function POST(
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
    const { cover_letter, cv_url } = body;

    // Verificar se a oportunidade existe e está ativa
    const opportunity = await prisma.jobOpportunity.findUnique({
      where: { id: opportunityId },
      select: { id: true, is_active: true, title: true },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    if (!opportunity.is_active) {
      return NextResponse.json(
        { error: 'This opportunity is no longer active' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já se candidatou
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        user_id: session.user.id,
        job_id: opportunityId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this opportunity' },
        { status: 400 }
      );
    }

    // Criar candidatura
    const application = await prisma.jobApplication.create({
      data: {
        user_id: session.user.id,
        job_id: opportunityId,
        cover_letter: cover_letter?.trim(),
        cv_url: cv_url?.trim(),
        status: 'pending',
      },
    });

    // Buscar candidatura completa com relacionamentos
    const fullApplication = await prisma.jobApplication.findUnique({
      where: { id: application.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    });

    // Criar notificação para o candidato
    try {
      const applicant = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true },
      });

      if (applicant) {
        await NotificationService.createJobApplicationNotification(
          opportunityId,
          opportunity.title,
          session.user.id,
          applicant.name || applicant.username || 'Usuário'
        );
      }
    } catch (notificationError) {
      console.error('Error creating application notification:', notificationError);
      // Não falhar a operação principal por causa da notificação
    }

    return NextResponse.json(fullApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

// GET /api/opportunities/[id]/apply - Verificar se o usuário se candidatou
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const opportunityId = (await context.params).id;

    const application = await prisma.jobApplication.findFirst({
      where: {
        user_id: session.user.id,
        job_id: opportunityId,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json({
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json(
      { error: 'Failed to check application status' },
      { status: 500 }
    );
  }
}
