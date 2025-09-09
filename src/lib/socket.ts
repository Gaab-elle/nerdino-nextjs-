import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const SocketHandler = (req: any, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    res.socket.server.io = io;

    // Middleware para autenticação (simplificado para desenvolvimento)
    io.use(async (socket, next) => {
      try {
        // Por enquanto, vamos permitir conexões sem autenticação
        // Em produção, você deve implementar autenticação via JWT ou cookies
        const userId = socket.handshake.auth?.userId || 'anonymous';
        const userName = socket.handshake.auth?.userName || 'Anonymous User';
        
        socket.data.userId = userId;
        socket.data.user = { id: userId, name: userName };
        next();
      } catch (err) {
        console.error('Socket auth error:', err);
        next(new Error('Authentication failed'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User ${socket.data.userId} connected`);

      // Adicionar usuário à sala de presença
      socket.join('presence');
      socket.broadcast.to('presence').emit('user_online', {
        userId: socket.data.userId,
        user: socket.data.user,
        timestamp: new Date().toISOString(),
      });

      // Entrar em salas de conversas do usuário
      socket.on('join_conversations', async () => {
        try {
          const conversations = await prisma.conversation.findMany({
            where: {
              participants: {
                some: {
                  user_id: socket.data.userId,
                },
              },
            },
            select: { id: true },
          });

          conversations.forEach((conversation) => {
            socket.join(`conversation_${conversation.id}`);
          });
        } catch (error) {
          console.error('Error joining conversations:', error);
        }
      });

      // Entrar em uma conversa específica
      socket.on('join_conversation', async (conversationId: string) => {
        try {
          // Verificar se o usuário é participante da conversa
          const conversation = await prisma.conversation.findFirst({
            where: {
              id: conversationId,
              participants: {
                some: {
                  user_id: socket.data.userId,
                },
              },
            },
          });

          if (conversation) {
            socket.join(`conversation_${conversationId}`);
            socket.emit('joined_conversation', { conversationId });
          } else {
            socket.emit('error', { message: 'Not authorized to join this conversation' });
          }
        } catch (error) {
          console.error('Error joining conversation:', error);
          socket.emit('error', { message: 'Failed to join conversation' });
        }
      });

      // Sair de uma conversa
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation_${conversationId}`);
        socket.emit('left_conversation', { conversationId });
      });

      // Enviar mensagem
      socket.on('send_message', async (data: {
        conversationId: string;
        content: string;
        type?: string;
        file_url?: string;
        file_name?: string;
        file_size?: number;
      }) => {
        try {
          // Verificar se o usuário é participante da conversa
          const conversation = await prisma.conversation.findFirst({
            where: {
              id: data.conversationId,
              participants: {
                some: {
                  user_id: socket.data.userId,
                },
              },
            },
          });

          if (!conversation) {
            socket.emit('error', { message: 'Not authorized to send message to this conversation' });
            return;
          }

          // Criar mensagem no banco
          const message = await prisma.message.create({
            data: {
              content: data.content,
              type: data.type || 'text',
              file_url: data.file_url,
              file_name: data.file_name,
              file_size: data.file_size,
              conversation_id: data.conversationId,
              sender_id: socket.data.userId,
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
            where: { id: data.conversationId },
            data: { updated_at: new Date() },
          });

          // Enviar mensagem para todos os participantes da conversa
          io.to(`conversation_${data.conversationId}`).emit('new_message', {
            message,
            conversationId: data.conversationId,
          });

          // Enviar notificação para usuários offline
          const participants = await prisma.conversationParticipant.findMany({
            where: { conversation_id: data.conversationId },
            include: { user: true },
          });

          participants.forEach((participant) => {
            if (participant.user_id !== socket.data.userId) {
              socket.broadcast.to('presence').emit('message_notification', {
                conversationId: data.conversationId,
                message: {
                  id: message.id,
                  content: data.content,
                  type: data.type || 'text',
                },
                sender: {
                  id: socket.data.userId,
                  name: socket.data.user.name,
                },
                recipientId: participant.user_id,
              });
            }
          });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Indicador de digitação
      socket.on('typing_start', (data: { conversationId: string }) => {
        socket.broadcast.to(`conversation_${data.conversationId}`).emit('user_typing', {
          userId: socket.data.userId,
          user: socket.data.user,
          conversationId: data.conversationId,
          isTyping: true,
        });
      });

      socket.on('typing_stop', (data: { conversationId: string }) => {
        socket.broadcast.to(`conversation_${data.conversationId}`).emit('user_typing', {
          userId: socket.data.userId,
          user: socket.data.user,
          conversationId: data.conversationId,
          isTyping: false,
        });
      });

      // Marcar mensagens como lidas
      socket.on('mark_as_read', async (data: { conversationId: string; messageIds?: string[] }) => {
        try {
          if (data.messageIds) {
            // Marcar mensagens específicas como lidas
            await prisma.message.updateMany({
              where: {
                id: { in: data.messageIds },
                conversation_id: data.conversationId,
                sender_id: { not: socket.data.userId },
              },
              data: { is_read: true },
            });
          } else {
            // Marcar todas as mensagens da conversa como lidas
            await prisma.message.updateMany({
              where: {
                conversation_id: data.conversationId,
                is_read: false,
                sender_id: { not: socket.data.userId },
              },
              data: { is_read: true },
            });
          }

          // Notificar outros participantes
          socket.broadcast.to(`conversation_${data.conversationId}`).emit('messages_read', {
            conversationId: data.conversationId,
            userId: socket.data.userId,
            messageIds: data.messageIds,
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Atualizar status de presença
      socket.on('update_presence', async (data: { status: string }) => {
        try {
          await prisma.user.update({
            where: { id: socket.data.userId },
            data: { 
              online_status: data.status,
              last_seen: new Date(),
            },
          });

          socket.broadcast.to('presence').emit('presence_updated', {
            userId: socket.data.userId,
            status: data.status,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error updating presence:', error);
        }
      });

      // Desconexão
      socket.on('disconnect', async () => {
        console.log(`User ${socket.data.userId} disconnected`);
        
        try {
          // Atualizar status para offline
          await prisma.user.update({
            where: { id: socket.data.userId },
            data: { 
              online_status: 'offline',
              last_seen: new Date(),
            },
          });

          // Notificar outros usuários
          socket.broadcast.to('presence').emit('user_offline', {
            userId: socket.data.userId,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });
    });
  }
  res.end();
};
