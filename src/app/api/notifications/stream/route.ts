import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { addClient, removeClient } from '@/lib/sse-notifications';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      addClient(userId, controller);
      
      // Send initial connection message
      controller.enqueue(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to notifications stream' })}\n\n`);
      
      console.log(`SSE notification connection established for user: ${userId}`);
    },
    cancel(controller) {
      removeClient(userId, controller);
      console.log(`SSE notification connection closed for user: ${userId}`);
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
      avatar_url: (session.user as { image?: string }).image || undefined,
    },
  };

  // Send to SSE clients
  const { sendNotificationToUser } = await import('@/lib/sse-notifications');
  sendNotificationToUser(userId, {
    id: mockNotification.id,
    type: mockNotification.type,
    title: mockNotification.title,
    message: mockNotification.content,
    data: (mockNotification as { data?: unknown }).data,
    timestamp: mockNotification.created_at,
  });

  return NextResponse.json({ message: 'Notification sent', notification: mockNotification }, { status: 200 });
}
