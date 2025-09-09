'use client';

import { useState } from 'react';
import { Bell, X, Check, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from 'react-i18next';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const {
    notifications,
    counts,
    isLoading,
    error,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications(1, 20, undefined, false, selectedCategory);

  const categories = [
    { key: 'community', label: t('notifications.categories.community'), count: counts.community },
    { key: 'messages', label: t('notifications.categories.messages'), count: counts.messages },
    { key: 'opportunities', label: t('notifications.categories.opportunities'), count: counts.opportunities },
    { key: 'projects', label: t('notifications.categories.projects'), count: counts.projects },
    { key: 'system', label: t('notifications.categories.system'), count: counts.system },
  ];

  const handleMarkAsRead = async (notificationIds: string[]) => {
    await markAsRead(notificationIds);
    setSelectedNotifications([]);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(selectedCategory);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t('notifications.time.justNow');
    if (diffInSeconds < 3600) return t('notifications.time.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('notifications.time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 2592000) return t('notifications.time.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '👍';
      case 'comment': return '💬';
      case 'follow': return '👥';
      case 'message': return '💌';
      case 'job_application': return '📝';
      case 'job_match': return '🎯';
      case 'project_like': return '⭐';
      case 'mention': return '📢';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {counts.total > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {counts.total > 99 ? '99+' : counts.total}
          </Badge>
        )}
      </Button>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
      )}

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('notifications.title')}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshNotifications}
                  disabled={isLoading}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 mt-3 overflow-x-auto">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
                className="whitespace-nowrap"
              >
                {t('notifications.all')} ({counts.total})
              </Button>
              {categories.map(category => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className="whitespace-nowrap"
                >
                  {category.label} {category.count > 0 && `(${category.count})`}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedNotifications.length === notifications.length ? t('notifications.deselectAll') : t('notifications.selectAll')}
                  </Button>
                  {selectedNotifications.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(selectedNotifications)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {t('notifications.markAsRead')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          selectedNotifications.forEach(id => handleDeleteNotification(id));
                          setSelectedNotifications([]);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t('notifications.delete')}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  {t('notifications.markAllAsRead')}
                </Button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                {t('notifications.loading')}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t('notifications.empty')}
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleSelectNotification(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {notification.from_user && (
                          <span className="text-xs text-gray-500">
                            {notification.from_user.name || notification.from_user.username}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="rounded"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
              >
                {t('notifications.viewAll')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
