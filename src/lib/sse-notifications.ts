// In-memory store for SSE clients de notificações
const clients: { [userId: string]: ResponseController[] } = {};

interface ResponseController {
  response: Response;
  controller: ReadableStreamDefaultController;
}

// Função para enviar notificação para um usuário específico
export function sendNotificationToUser(userId: string, notification: {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: unknown;
  timestamp: string;
}) {
  const userClients = clients[userId];
  if (userClients) {
    userClients.forEach(({ controller }) => {
      try {
        const data = `data: ${JSON.stringify({
          type: 'notification',
          data: notification
        })}\n\n`;
        controller.enqueue(data);
      } catch (error) {
        console.error('Error sending notification:', error);
        // Remove client if connection is broken
        const index = userClients.findIndex(client => client.controller === controller);
        if (index > -1) {
          userClients.splice(index, 1);
        }
      }
    });
  }
}

// Função para adicionar cliente
export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  if (!clients[userId]) {
    clients[userId] = [];
  }
  
  const responseController: ResponseController = {
    response: new Response(), // Placeholder
    controller,
  };
  
  clients[userId].push(responseController);
}

// Função para remover cliente
export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
  const userClients = clients[userId];
  if (userClients) {
    const index = userClients.findIndex(client => client.controller === controller);
    if (index > -1) {
      userClients.splice(index, 1);
    }
    
    // Clean up empty arrays
    if (userClients.length === 0) {
      delete clients[userId];
    }
  }
}
