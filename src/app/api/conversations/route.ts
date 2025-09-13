import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { prisma } from '@/lib/prisma';

// GET /api/conversations - Listar conversas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // direct, group
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: {
      participants: {
        some: {
          user_id: string;
        };
      };
      is_active: boolean;
      type?: string;
      title?: { contains: string; mode: 'insensitive' };
    } = {
      participants: {
        some: {
          user_id: session.user.id,
        },
      },
      is_active: true,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      (where as any).OR = [
        { name: { contains: search, mode: 'insensitive' } },
        {
          participants: {
            some: {
              user: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { username: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ];
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.conversation.count({ where }),
    ]);

    // Adicionar informações extras para cada conversa
    const conversationsWithExtras = await Promise.all(
      conversations.map(async (conversation) => {
        // Contar mensagens não lidas
        const unreadCount = await prisma.message.count({
          where: {
            conversation_id: conversation.id,
            is_read: false,
            sender_id: { not: session.user.id },
          },
        });

        // Determinar o nome da conversa para conversas diretas
        let displayName = conversation.name;
        if (conversation.type === 'direct' && !displayName) {
          const otherParticipant = conversation.participants.find(
            p => p.user_id !== session.user.id
          );
          displayName = otherParticipant?.user.name || otherParticipant?.user.username || 'Unknown';
        }

        return {
          ...conversation,
          displayName,
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      conversations: conversationsWithExtras,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Criar nova conversa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, name, participantIds } = body;

    if (!type || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: 'Type and participantIds are required' },
        { status: 400 }
      );
    }

    // Verificar se todos os participantes existem
    const participants = await prisma.user.findMany({
      where: { id: { in: participantIds } },
      select: { id: true },
    });

    if (participants.length !== participantIds.length) {
      return NextResponse.json(
        { error: 'Some participants not found' },
        { status: 400 }
      );
    }

    // Para conversas diretas, verificar se já existe uma conversa entre os dois usuários
    if (type === 'direct' && participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'direct',
          participants: {
            every: {
              user_id: { in: [session.user.id, participantIds[0]] },
            },
          },
        } as any,
        include: {
          participants: {
            include: {
              user: {
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
        },
      });

      if (existingConversation) {
        return NextResponse.json(existingConversation);
      }
    }

    // Criar conversa
    const conversation = await prisma.conversation.create({
      data: {
        type,
        name: name || null,
        creator_id: session.user.id,
        participants: {
          create: [
            // Adicionar o criador
            {
              user_id: session.user.id,
              role: 'admin',
            },
            // Adicionar os participantes
            ...participantIds.map((id: string) => ({
              user_id: id,
              role: 'member',
            })),
          ],
        },
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

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
