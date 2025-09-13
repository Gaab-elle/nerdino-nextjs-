// Store para gerenciar conexões SSE de mensagens
const connections = new Map<string, ReadableStreamDefaultController>();

// Função para enviar mensagem para um usuário específico
export function sendMessageToUser(userId: string, message: {
  type: string;
  data?: unknown;
  timestamp?: string;
  [key: string]: unknown;
}) {
  const controller = connections.get(userId);
  if (controller) {
    try {
      const data = `data: ${JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      })}\n\n`;
      controller.enqueue(data);
    } catch (error) {
      console.error('Error sending SSE message:', error);
      connections.delete(userId);
    }
  }
}

// Função para enviar mensagem para múltiplos usuários
export function sendMessageToUsers(userIds: string[], message: {
  type: string;
  data?: unknown;
  timestamp?: string;
  [key: string]: unknown;
}) {
  userIds.forEach(userId => sendMessageToUser(userId, message));
}

// Função para broadcast para todos os usuários conectados
export function broadcastMessage(message: {
  type: string;
  data?: unknown;
  timestamp?: string;
  [key: string]: unknown;
}) {
  connections.forEach((controller, userId) => {
    try {
      const data = `data: ${JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      })}\n\n`;
      controller.enqueue(data);
    } catch (error) {
      console.error('Error broadcasting SSE message:', error);
      connections.delete(userId);
    }
  });
}

// Função para adicionar conexão
export function addConnection(userId: string, controller: ReadableStreamDefaultController) {
  connections.set(userId, controller);
}

// Função para remover conexão
export function removeConnection(userId: string) {
  connections.delete(userId);
}
