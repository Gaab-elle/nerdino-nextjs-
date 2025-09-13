'use client';

import React from 'react';
import { User, MapPin, Calendar, Code, Github, Linkedin, Twitter, Mail, Phone, MoreVertical, Bell, Archive, Flag, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { Conversation } from '@/types/messages';

interface ContactInfoProps {
  conversation: Conversation;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ conversation }) => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;

  const contact = conversation.participants.find(p => p.user_id !== user?.id) || conversation.participants[0];

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return t('messages.status.online');
      case 'away': return t('messages.status.away');
      case 'offline': return t('messages.status.offline');
      default: return t('messages.status.offline');
    }
  };

  const skills = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'];
  const sharedFiles = [
    { name: 'component.tsx', type: 'code', date: '2 dias atrás' },
    { name: 'screenshot.png', type: 'image', date: '1 semana atrás' },
    { name: 'document.pdf', type: 'document', date: '2 semanas atrás' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="h-4 w-4" />;
      case 'image': return <User className="h-4 w-4" />;
      case 'document': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('messages.contactInfo.title')}
          </h2>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Section */}
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={contact.user.avatar_url || contact.user.image} alt={contact.user.name} />
              <AvatarFallback>
                {contact.user.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 ${getStatusColor(contact.user.online_status)}`} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {contact.user.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            @{contact.user.username}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {contact.user.bio || 'Desenvolvedor'}
          </p>
          <Badge variant={contact.user.online_status === 'online' ? 'default' : 'secondary'} className="mb-4">
            {getStatusText(contact.user.online_status)}
          </Badge>
        </div>

        {/* Contact Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('messages.contactInfo.viewProfile')}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            {t('messages.contactInfo.projects')}
          </Button>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {t('messages.contactInfo.contactInfo')}
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {contact.user.username}@example.com
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                São Paulo, Brasil
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('messages.contactInfo.memberSince')} Jan 2023
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {t('messages.contactInfo.skills')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {t('messages.contactInfo.socialLinks')}
          </h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Twitter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Shared Files */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {t('messages.contactInfo.sharedFiles')}
          </h4>
          <div className="space-y-2">
            {sharedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div className="text-gray-400">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {file.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Settings */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {t('messages.contactInfo.conversationSettings')}
          </h4>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-2" />
              {t('messages.contactInfo.notifications')}
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Archive className="h-4 w-4 mr-2" />
              {t('messages.contactInfo.archive')}
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 dark:text-red-400">
              <Flag className="h-4 w-4 mr-2" />
              {t('messages.contactInfo.report')}
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 dark:text-red-400">
              <Shield className="h-4 w-4 mr-2" />
              {t('messages.contactInfo.block')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
