import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const SocketHandler = (req: { method: string; body?: unknown }, res: NextApiResponseServerIO) => {
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

    // Middleware para autenticação (simplificado)
    io.use(async (socket, next) => {
      try {
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

      // Entrar em uma conversa específica
      socket.on('join_conversation', async (conversationId: string) => {
        console.log(`User ${socket.data.userId} joining conversation ${conversationId}`);
        socket.join(`conversation_${conversationId}`);
        socket.emit('joined_conversation', { conversationId });
      });

      // Sair de uma conversa
      socket.on('leave_conversation', (conversationId: string) => {
        console.log(`User ${socket.data.userId} leaving conversation ${conversationId}`);
        socket.leave(`conversation_${conversationId}`);
        socket.emit('left_conversation', { conversationId });
      });

      // Enviar mensagem
      socket.on('send_message', async (data: {
        conversationId: string;
        content: string;
        type?: string;
      }) => {
        console.log(`User ${socket.data.userId} sending message to conversation ${data.conversationId}`);
        
        // Criar mensagem mock
        const message = {
          id: `msg_${Date.now()}_${Math.random()}`,
          content: data.content,
          type: data.type || 'text',
          conversation_id: data.conversationId,
          sender_id: socket.data.userId,
          created_at: new Date().toISOString(),
          is_read: false,
          sender: socket.data.user,
        };

        // Enviar mensagem para todos os participantes da conversa
        io.to(`conversation_${data.conversationId}`).emit('new_message', {
          message,
          conversationId: data.conversationId,
        });
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
        console.log(`User ${socket.data.userId} marking messages as read in conversation ${data.conversationId}`);
        
        // Notificar outros participantes
        socket.broadcast.to(`conversation_${data.conversationId}`).emit('messages_read', {
          conversationId: data.conversationId,
          userId: socket.data.userId,
          messageIds: data.messageIds,
        });
      });

      // Atualizar status de presença
      socket.on('update_presence', async (data: { status: string }) => {
        console.log(`User ${socket.data.userId} updating presence to ${data.status}`);
        
        socket.broadcast.to('presence').emit('presence_updated', {
          userId: socket.data.userId,
          status: data.status,
          timestamp: new Date().toISOString(),
        });
      });

      // Desconexão
      socket.on('disconnect', async () => {
        console.log(`User ${socket.data.userId} disconnected`);
        
        // Notificar outros usuários
        socket.broadcast.to('presence').emit('user_offline', {
          userId: socket.data.userId,
          timestamp: new Date().toISOString(),
        });
      });
    });
  }
  res.end();
};
