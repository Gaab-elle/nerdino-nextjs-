import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';

// GET /api/conversations/[id] - Buscar conversa específica
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: (await context.params).id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            image: true,
          },
        },
        participants: {
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
        },
        messages: {
          take: 50,
          orderBy: { created_at: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
            participants: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verificar se o usuário é participante da conversa
    const isParticipant = conversation.participants.some(
      p => p.user_id === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determinar o nome da conversa para conversas diretas
    let displayName = conversation.name;
    if (conversation.type === 'direct' && !displayName) {
      const otherParticipant = conversation.participants.find(
        p => p.user_id !== session.user.id
      );
      displayName = otherParticipant?.user.name || otherParticipant?.user.username || 'Unknown';
    }

    // Contar mensagens não lidas
    const unreadCount = await prisma.message.count({
      where: {
        conversation_id: (await context.params).id,
        is_read: false,
        sender_id: { not: session.user.id },
      },
    });

    return NextResponse.json({
      ...conversation,
      displayName,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[id] - Atualizar conversa
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, is_active } = body;

    // Verificar se a conversa existe e se o usuário é participante
    const existingConversation = await prisma.conversation.findUnique({
      where: { id: (await context.params).id },
      include: {
        participants: {
          where: { user_id: session.user.id },
        },
      },
    });

    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (existingConversation.participants.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Atualizar conversa
    const updatedConversation = await prisma.conversation.update({
      where: { id: (await context.params).id },
      data: {
        name: name || null,
        is_active: is_active !== undefined ? is_active : existingConversation.is_active,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            image: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
                image: true,
                online_status: true,
                last_seen: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { created_at: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
            participants: true,
          },
        },
      },
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Deletar conversa
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se a conversa existe e se o usuário é o criador
    const existingConversation = await prisma.conversation.findUnique({
      where: { id: (await context.params).id },
      select: { creator_id: true },
    });

    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (existingConversation.creator_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Deletar conversa (cascade vai deletar mensagens e participantes)
    await prisma.conversation.delete({
      where: { id: (await context.params).id },
    });

    return NextResponse.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
