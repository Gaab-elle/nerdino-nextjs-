import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In-memory store for SSE clients
const clients: { [userId: string]: ResponseController[] } = {};

interface ResponseController {
  response: NextResponse;
  controller: ReadableStreamDefaultController;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      const responseController: ResponseController = {
        response: new NextResponse(), // Placeholder, actual response is built later
        controller,
      };

      if (!clients[userId]) {
        clients[userId] = [];
      }
      clients[userId].push(responseController);

      // Send initial connection message
      controller.enqueue(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to notifications stream' })}\n\n`);

      request.signal.onabort = () => {
        console.log(`Notification SSE client ${userId} disconnected`);
        clients[userId] = clients[userId].filter(c => c !== responseController);
        if (clients[userId].length === 0) {
          delete clients[userId];
        }
        controller.close();
      };
    },
    cancel() {
      console.log(`Notification SSE stream cancelled for ${userId}`);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// Function to send notifications to connected clients
export function sendNotificationToUser(userId: string, notification: any) {
  if (clients[userId]) {
    clients[userId].forEach(({ controller }) => {
      controller.enqueue(`event: notification\ndata: ${JSON.stringify(notification)}\n\n`);
    });
  }
}

// Function to send notification count updates
export function sendNotificationCountUpdate(userId: string, counts: any) {
  if (clients[userId]) {
    clients[userId].forEach(({ controller }) => {
      controller.enqueue(`event: count_update\ndata: ${JSON.stringify(counts)}\n\n`);
    });
  }
}

// POST /api/notifications/stream - Send a test notification (for testing/demonstration)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, title, content, targetUserId } = await request.json();

  if (!type || !title || !content) {
    return NextResponse.json({ error: 'type, title, and content are required' }, { status: 400 });
  }

  const userId = targetUserId || session.user.id;

  const mockNotification = {
    id: `notif_${Date.now()}`,
    type,
    title,
    content,
    is_read: false,
    created_at: new Date().toISOString(),
    from_user: {
      id: session.user.id,
      name: session.user.name || 'Anonymous',
      username: session.user.email || 'anonymous',
      avatar_url: session.user.image || undefined,
    },
  };

  // Send to SSE clients
  sendNotificationToUser(userId, mockNotification);

  return NextResponse.json({ message: 'Notification sent', notification: mockNotification }, { status: 200 });
}
