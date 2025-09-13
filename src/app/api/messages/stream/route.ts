import { NextRequest } from 'next/server';
import { addConnection, removeConnection } from '@/lib/sse-messages';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return new Response('User ID required', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Armazenar a conexão
      addConnection(userId, controller);
      
      // Enviar mensagem de conexão
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);
      
      console.log(`SSE connection established for user: ${userId}`);
    },
    cancel() {
      // Remover conexão quando cancelada
      removeConnection(userId);
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

