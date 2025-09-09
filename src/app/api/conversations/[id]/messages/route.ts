import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/conversations/[id]/messages - Listar mensagens da conversa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Para paginação baseada em cursor

    const skip = (page - 1) * limit;

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

    // Construir filtros para mensagens
    const where: any = {
      conversation_id: params.id,
    };

    if (before) {
      where.created_at = { lt: new Date(before) };
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.message.count({ where: { conversation_id: params.id } }),
    ]);

    // Marcar mensagens como lidas
    await prisma.message.updateMany({
      where: {
        conversation_id: params.id,
        is_read: false,
        sender_id: { not: session.user.id },
      },
      data: { is_read: true },
    });

    return NextResponse.json({
      messages: messages.reverse(), // Reverter para ordem cronológica
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages - Enviar nova mensagem
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
    const { content, type, file_url, file_name, file_size } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
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

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        type: type || 'text',
        file_url,
        file_name,
        file_size,
        conversation_id: params.id,
        sender_id: session.user.id,
      },
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
    });

    // Atualizar timestamp da conversa
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updated_at: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
