import { NextRequest } from 'next/server';

// Store para gerenciar conexões SSE
const connections = new Map<string, ReadableStreamDefaultController>();

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return new Response('User ID required', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Armazenar a conexão
      connections.set(userId, controller);
      
      // Enviar mensagem de conexão
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);
      
      console.log(`SSE connection established for user: ${userId}`);
    },
    cancel() {
      // Remover conexão quando cancelada
      connections.delete(userId);
      console.log(`SSE connection closed for user: ${userId}`);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Função para enviar mensagem para um usuário específico
export function sendMessageToUser(userId: string, message: any) {
  const controller = connections.get(userId);
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
    } catch (error) {
      console.error('Error sending SSE message:', error);
      connections.delete(userId);
    }
  }
}

// Função para enviar mensagem para múltiplos usuários
export function sendMessageToUsers(userIds: string[], message: any) {
  userIds.forEach(userId => sendMessageToUser(userId, message));
}

// Função para broadcast para todos os usuários conectados
export function broadcastMessage(message: any) {
  connections.forEach((controller, userId) => {
    try {
      controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
    } catch (error) {
      console.error('Error broadcasting SSE message:', error);
      connections.delete(userId);
    }
  });
}
