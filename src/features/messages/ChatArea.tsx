'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, Code, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Conversation } from '@/types/messages';
import { useMessages } from '@/features/messages/useMessages';

interface ChatAreaProps {
  conversation: Conversation;
  onBack: () => void;
  isMobile: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ conversation, onBack, isMobile }) => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Use the messages hook with SSE
  const { 
    messages, 
    loading: messagesLoading, 
    error: messagesError,
    sendMessage,
    loadMoreMessages,
    isConnected,
    connectionError
  } = useMessages(conversation.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage({
        content: message.trim(),
        type: 'text'
      });
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

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

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  const formatCodeBlock = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    return content.replace(codeBlockRegex, (match, language, code) => {
      return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-2"><code class="language-${language || 'javascript'}">${code.trim()}</code></pre>`;
    });
  };

  const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id) || conversation.participants[0];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipant.user.avatar_url || otherParticipant.user.image} alt={otherParticipant.user.name} />
                <AvatarFallback>
                  {conversation.type === 'group' 
                    ? conversation.name?.charAt(0) || 'G'
                    : otherParticipant.user.name.split(' ').map((n: string) => n[0]).join('')
                  }
                </AvatarFallback>
              </Avatar>
              {conversation.type === 'direct' && (
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(otherParticipant.user.online_status)}`} />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {conversation.type === 'group' ? conversation.name : otherParticipant.user.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {conversation.type === 'direct' 
                  ? otherParticipant.user.online_status === 'online' 
                    ? 'Online' 
                    : `Visto por último ${otherParticipant.user.last_seen}`
                  : `${conversation.participants.length} membros`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender_id === user?.id;
          const sender = isOwnMessage ? { name: 'Você' } : otherParticipant;
          
          return (
            <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={otherParticipant.user.avatar_url || otherParticipant.user.image} alt={otherParticipant.user.name} />
                    <AvatarFallback>
                      {otherParticipant.user.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-4 py-2 ${
                  isOwnMessage 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  {msg.type === 'code' ? (
                    <div className="space-y-2">
                      <div 
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: formatCodeBlock(msg.content) }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <div className={`flex items-center gap-1 mt-1 ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {isOwnMessage && (
                      <span className={`text-xs ${
                        msg.is_read ? 'text-blue-300' : 'opacity-70'
                      }`}>
                        {msg.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder={t('messages.typeMessage')}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Code className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
