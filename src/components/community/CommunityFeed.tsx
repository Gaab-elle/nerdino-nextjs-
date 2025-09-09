'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Copy, Check, ExternalLink, Github } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';

interface Post {
  id: number;
  type: string;
  author: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    title: string;
    verified: boolean;
  };
  content: string;
  codeSnippet?: {
    language: string;
    filename: string;
    code: string;
  };
  project?: {
    name: string;
    description: string;
    githubUrl: string;
    demoUrl?: string;
    technologies: string[];
  };
  tags: string[];
  timestamp: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  userLiked: boolean;
  userSaved: boolean;
  userFollowed: boolean;
}

interface CommunityFeedProps {
  posts: Post[];
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ posts }) => {
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const handleLike = (postId: number) => {
    // Handle like/unlike
    console.log('Toggle like for post:', postId);
  };

  const handleSave = (postId: number) => {
    // Handle save/unsave
    console.log('Toggle save for post:', postId);
  };

  const handleFollow = (authorId: number) => {
    // Handle follow/unfollow
    console.log('Toggle follow for author:', authorId);
  };

  const copyCode = async (code: string, postId: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(postId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🎉';
      case 'tutorial':
        return '📚';
      case 'code':
        return '💡';
      case 'project':
        return '🚀';
      case 'question':
        return '❓';
      default:
        return '📝';
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg">
          {t('community.noPosts')}
        </div>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          {t('community.noPostsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {post.author.name}
                    </h3>
                    {post.author.verified && (
                      <Badge variant="secondary" className="text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {post.author.title} • {post.timestamp}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getPostTypeIcon(post.type)}</span>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Code Snippet */}
            {post.codeSnippet && (
              <div className="mb-4 bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">
                      {post.codeSnippet.language} • {post.codeSnippet.filename}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCode(post.codeSnippet.code, post.id)}
                    className="text-gray-300 hover:text-white"
                  >
                    {copiedCode === post.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="ml-1">
                      {copiedCode === post.id ? t('community.copied') : t('community.copy')}
                    </span>
                  </Button>
                </div>
                <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                  <code>{post.codeSnippet.code}</code>
                </pre>
              </div>
            )}

            {/* Project Preview */}
            {post.project && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {post.project.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {post.project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.project.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  {post.project.demoUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={post.project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('community.viewDemo')}
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <a href={post.project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-3 w-3 mr-1" />
                      GitHub
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <button
                    key={index}
                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 ${
                    post.userLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`} />
                  <span>{post.stats.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.stats.comments}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Share2 className="h-4 w-4" />
                  <span>{post.stats.shares}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(post.id)}
                  className={`flex items-center gap-2 ${
                    post.userSaved ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${post.userSaved ? 'fill-current' : ''}`} />
                  <span>{post.userSaved ? t('community.saved') : t('community.save')}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      <div className="text-center py-6">
        <Button variant="outline" size="lg">
          {t('community.loadMore')}
        </Button>
      </div>
    </div>
  );
};
