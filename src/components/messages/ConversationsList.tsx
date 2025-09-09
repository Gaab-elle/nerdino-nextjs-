'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, Pin, Archive, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Conversation } from '@/types/messages';
import { getConversationDisplayName, getConversationAvatar, formatConversationTime, getMessagePreview } from '@/lib/messages';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  loading?: boolean;
  error?: string | null;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading = false,
  error = null
}) => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { key: 'all', label: t('messages.filters.all') },
    { key: 'unread', label: t('messages.filters.unread') },
    { key: 'online', label: t('messages.filters.online') },
    { key: 'groups', label: t('messages.filters.groups') }
  ];

  const filteredConversations = conversations.filter(conv => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesName = conv.name?.toLowerCase().includes(searchLower);
      const matchesParticipant = conv.participants.some(p => 
        p.user.name.toLowerCase().includes(searchLower) || 
        p.user.username.toLowerCase().includes(searchLower)
      );
      if (!matchesName && !matchesParticipant) return false;
    }

    // Status filters
    switch (activeFilter) {
      case 'unread':
        return (conv.unreadCount || 0) > 0;
      case 'online':
        return conv.participants.some(p => p.user.online_status === 'online');
      case 'groups':
        return conv.type === 'group';
      default:
        return conv.is_active;
    }
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    // Then by unread count
    if ((a.unreadCount || 0) > 0 && (b.unreadCount || 0) === 0) return -1;
    if ((a.unreadCount || 0) === 0 && (b.unreadCount || 0) > 0) return 1;
    
    // Finally by timestamp (most recent first)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'do_not_disturb': return 'bg-red-600';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getMessagePreviewText = (conversation: Conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[0];
      return getMessagePreview(lastMessage);
    }
    return 'Nenhuma mensagem ainda';
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('messages.title')}
          </h1>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={t('messages.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              size="sm"
              variant={activeFilter === filter.key ? 'default' : 'ghost'}
              onClick={() => setActiveFilter(filter.key)}
              className={activeFilter === filter.key ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            {t('common.loading')}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {t('messages.noConversations')}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {sortedConversations.map((conversation) => {
              const isSelected = selectedConversation?.id === conversation.id;
              const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id) || conversation.participants[0];
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant.user.avatar_url || otherParticipant.user.image} alt={otherParticipant.user.name} />
                        <AvatarFallback>
                          {conversation.type === 'group' 
                            ? conversation.name?.charAt(0) || 'G'
                            : otherParticipant.user.name.split(' ').map(n => n[0]).join('')
                          }
                        </AvatarFallback>
                      </Avatar>
                      {conversation.type === 'direct' && (
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(otherParticipant.user.online_status)}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium truncate ${
                          (conversation.unreadCount || 0) > 0 
                            ? 'text-gray-900 dark:text-gray-100' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {getConversationDisplayName(conversation, user?.id || '')}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatConversationTime(conversation.updated_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          (conversation.unreadCount || 0) > 0 
                            ? 'text-gray-900 dark:text-gray-100 font-medium' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {getMessagePreviewText(conversation)}
                        </p>
                        {(conversation.unreadCount || 0) > 0 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {conversation.type === 'direct' && otherParticipant.user.online_status === 'offline' && otherParticipant.user.last_seen && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Visto por último {formatConversationTime(otherParticipant.user.last_seen)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
