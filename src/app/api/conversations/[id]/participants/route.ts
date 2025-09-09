import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/conversations/[id]/participants - Listar participantes da conversa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o usuário é participante da conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          where: { user_id: session.user.id },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.participants.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Buscar todos os participantes
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversation_id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            image: true,
            bio: true,
            location: true,
            website: true,
            github_url: true,
            linkedin_url: true,
            twitter_url: true,
            online_status: true,
            last_seen: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/participants - Adicionar participante à conversa
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é participante da conversa e tem permissão para adicionar
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          where: { user_id: session.user.id },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.participants.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verificar se o usuário a ser adicionado existe
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar se o usuário já é participante
    const existingParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id: params.id,
          user_id: userId,
        },
      },
    });

    if (existingParticipant) {
      return NextResponse.json({ error: 'User is already a participant' }, { status: 400 });
    }

    // Adicionar participante
    const participant = await prisma.conversationParticipant.create({
      data: {
        conversation_id: params.id,
        user_id: userId,
        role: 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            image: true,
            bio: true,
            location: true,
            website: true,
            github_url: true,
            linkedin_url: true,
            twitter_url: true,
            online_status: true,
            last_seen: true,
            created_at: true,
          },
        },
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}
