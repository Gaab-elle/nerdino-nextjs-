import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/conversations/[id]/read - Marcar mensagens como lidas
export async function POST(
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

    // Marcar todas as mensagens não lidas como lidas
    const result = await prisma.message.updateMany({
      where: {
        conversation_id: params.id,
        is_read: false,
        sender_id: { not: session.user.id },
      },
      data: { is_read: true },
    });

    return NextResponse.json({ 
      message: 'Messages marked as read',
      updatedCount: result.count 
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
