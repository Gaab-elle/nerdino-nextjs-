import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/conversations/[id]/participants/[userId] - Remover participante da conversa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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

    // Verificar se o participante a ser removido existe
    const participantToRemove = await prisma.conversationParticipant.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id: params.id,
          user_id: params.userId,
        },
      },
    });

    if (!participantToRemove) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Verificar permissões: usuário pode remover a si mesmo ou ser admin
    const currentUserParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id: params.id,
          user_id: session.user.id,
        },
      },
    });

    if (!currentUserParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const canRemove = 
      params.userId === session.user.id || // Pode remover a si mesmo
      currentUserParticipant.role === 'admin' || // É admin
      conversation.creator_id === session.user.id; // É o criador

    if (!canRemove) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Remover participante
    await prisma.conversationParticipant.delete({
      where: {
        conversation_id_user_id: {
          conversation_id: params.id,
          user_id: params.userId,
        },
      },
    });

    return NextResponse.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json(
      { error: 'Failed to remove participant' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[id]/participants/[userId] - Atualizar role do participante
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é admin ou criador da conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      select: { creator_id: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const currentUserParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id: params.id,
          user_id: session.user.id,
        },
      },
    });

    if (!currentUserParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const canUpdateRole = 
      currentUserParticipant.role === 'admin' || 
      conversation.creator_id === session.user.id;

    if (!canUpdateRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verificar se o participante a ser atualizado existe
    const participantToUpdate = await prisma.conversationParticipant.findUnique({
      where: {
        conversation_id_user_id: {
          conversation_id: params.id,
          user_id: params.userId,
        },
      },
    });

    if (!participantToUpdate) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Atualizar role
    const updatedParticipant = await prisma.conversationParticipant.update({
      where: {
        conversation_id_user_id: {
          conversation_id: params.id,
          user_id: params.userId,
        },
      },
      data: { role },
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

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error('Error updating participant role:', error);
    return NextResponse.json(
      { error: 'Failed to update participant role' },
      { status: 500 }
    );
  }
}
