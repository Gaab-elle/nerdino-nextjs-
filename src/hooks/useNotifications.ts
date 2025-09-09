'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
  from_user?: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
    image?: string;
  };
  post?: {
    id: string;
    content: string;
    type: string;
  };
  comment?: {
    id: string;
    content: string;
  };
}

export interface NotificationCounts {
  total: number;
  community: number;
  messages: number;
  opportunities: number;
  projects: number;
  system: number;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  counts: NotificationCounts;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: (category?: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(
  page: number = 1,
  limit: number = 20,
  type?: string,
  unreadOnly: boolean = false,
  category?: string
): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    community: 0,
    messages: 0,
    opportunities: 0,
    projects: 0,
    system: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) params.append('type', type);
      if (unreadOnly) params.append('unreadOnly', 'true');
      if (category) params.append('category', category);

      const response = await fetch(`/api/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setCounts(data.unreadCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, page, limit, type, unreadOnly, category]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Update counts
      setCounts(prev => ({
        ...prev,
        total: Math.max(0, prev.total - notificationIds.length),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notifications as read');
    }
  }, [session?.user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (category?: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true, category }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      // Update counts
      if (category) {
        setCounts(prev => ({
          ...prev,
          [category]: 0,
          total: Math.max(0, prev.total - prev[category as keyof NotificationCounts]),
        }));
      } else {
        setCounts(prev => ({
          total: 0,
          community: 0,
          messages: 0,
          opportunities: 0,
          projects: 0,
          system: 0,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [session?.user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, [session?.user?.id]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // SSE connection for real-time notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onopen = () => {
      console.log('Notifications SSE connection opened');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
      } catch (e) {
        console.error('Error parsing SSE message:', e);
      }
    };

    eventSource.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse(event.data);
        console.log('New notification received:', notification);
        
        // Add new notification to the beginning of the list
        setNotifications(prev => [notification, ...prev]);
        
        // Update counts
        setCounts(prev => ({
          ...prev,
          total: prev.total + 1,
        }));
      } catch (e) {
        console.error('Error parsing notification SSE message:', e);
      }
    });

    eventSource.addEventListener('count_update', (event) => {
      try {
        const newCounts = JSON.parse(event.data);
        console.log('Notification counts updated:', newCounts);
        setCounts(newCounts);
      } catch (e) {
        console.error('Error parsing count update SSE message:', e);
      }
    });

    eventSource.onerror = (error) => {
      console.error('Notifications SSE error:', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [session?.user?.id]);

  // Fetch notifications on mount and when dependencies change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    counts,
    isLoading,
    error,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
}
