'use client';

import React, { useState } from 'react';
import { Sparkles, FolderOpen, Camera, Link, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';

export const CreatePost: React.FC = () => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const [postType, setPostType] = useState('question');
  const [content, setContent] = useState('');

  const postTypes = [
    { key: 'project', label: t('community.createPost.project'), icon: <FolderOpen className="h-4 w-4" /> },
    { key: 'image', label: t('community.createPost.image'), icon: <Camera className="h-4 w-4" /> },
    { key: 'link', label: t('community.createPost.link'), icon: <Link className="h-4 w-4" /> },
    { key: 'question', label: t('community.createPost.question'), icon: <Lightbulb className="h-4 w-4" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post creation
    console.log('Creating post:', { type: postType, content });
    setContent('');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-4">
            {/* User Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar_url} alt={user?.name || 'User'} />
              <AvatarFallback>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* Post Content */}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('community.createPost.placeholder')}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
              />

              {/* Post Type Buttons and Submit */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  {postTypes.map((type) => (
                    <Button
                      key={type.key}
                      type="button"
                      variant={postType === type.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPostType(type.key)}
                      className={`text-xs px-2 py-1 h-8 ${postType === type.key ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                    >
                      {type.icon}
                      <span className="ml-1">{type.label}</span>
                    </Button>
                  ))}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={!content.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs px-3 py-1 h-8"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t('community.createPost.publish')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
