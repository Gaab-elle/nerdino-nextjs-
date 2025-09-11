'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Copy, Check, ExternalLink, Github, Send, X, Facebook, Twitter, Linkedin, Mail, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';

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
  project?: {
    name: string;
    description: string;
    githubUrl: string;
    demoUrl?: string;
    technologies: string[];
  };
  imageUrl?: string;
  linkPreview?: {
    title: string;
    description: string;
    image: string;
    domain: string;
  };
  linkUrl?: string;
  codeSnippet?: {
    language: string;
    filename: string;
    code: string;
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

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface CommunityFeedProps {
  posts: Post[];
  onPostsUpdate?: (updatedPosts: Post[]) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ posts, onPostsUpdate }) => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const [postsState, setPostsState] = useState<Post[]>(posts);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<{[postId: number]: Comment[]}>({});
  const [showShareModal, setShowShareModal] = useState<number | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCodeContent, setEditCodeContent] = useState('');
  const [editCodeLanguage, setEditCodeLanguage] = useState('javascript');
  const [editCodeFilename, setEditCodeFilename] = useState('');

  const programmingLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'bash', label: 'Bash' }
  ];

  // Atualizar estado quando posts mudarem
  React.useEffect(() => {
    setPostsState(posts);
  }, [posts]);

  // Carregar comentários salvos do localStorage
  React.useEffect(() => {
    const savedComments = localStorage.getItem('communityComments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  // Fechar menu de opções quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu !== null) {
        setShowOptionsMenu(null);
      }
    };

    if (showOptionsMenu !== null) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptionsMenu]);

  // Salvar comentários no localStorage quando mudarem
  React.useEffect(() => {
    localStorage.setItem('communityComments', JSON.stringify(comments));
  }, [comments]);

  const handleLike = (postId: number) => {
    const updatedPosts = postsState.map(post => 
      post.id === postId 
        ? {
            ...post,
            userLiked: !post.userLiked,
            stats: {
              ...post.stats,
              likes: post.userLiked ? post.stats.likes - 1 : post.stats.likes + 1
            }
          }
        : post
    );
    
    setPostsState(updatedPosts);
    if (onPostsUpdate) {
      onPostsUpdate(updatedPosts);
    }
  };

  const handleSave = (postId: number) => {
    const updatedPosts = postsState.map(post => 
      post.id === postId 
        ? {
            ...post,
            userSaved: !post.userSaved,
            stats: {
              ...post.stats,
              saves: post.userSaved ? post.stats.saves - 1 : post.stats.saves + 1
            }
          }
        : post
    );
    
    setPostsState(updatedPosts);
    if (onPostsUpdate) {
      onPostsUpdate(updatedPosts);
    }
  };

  const handleComment = (postId: number) => {
    setShowComments(showComments === postId ? null : postId);
  };

  const handleAddComment = (postId: number) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      author: {
        name: user?.name || 'Você',
        avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      content: newComment,
      timestamp: 'Agora'
    };

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }));

    // Atualizar contador de comentários
    const updatedPosts = postsState.map(post => 
      post.id === postId 
        ? {
            ...post,
            stats: {
              ...post.stats,
              comments: post.stats.comments + 1
            }
          }
        : post
    );
    
    setPostsState(updatedPosts);
    if (onPostsUpdate) {
      onPostsUpdate(updatedPosts);
    }

    setNewComment('');
  };

  const handleShare = (postId: number) => {
    setShowShareModal(postId);
  };

  const shareToSocial = (platform: string, post: Post) => {
    const postUrl = `${window.location.origin}/community#post-${post.id}`;
    const shareText = `Confira este post interessante: "${post.content.substring(0, 100)}..."`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Post interessante da comunidade')}&body=${encodeURIComponent(`${shareText}\n\n${postUrl}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        alert('Link copiado para a área de transferência!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    // Incrementar contador de compartilhamentos
    const updatedPosts = postsState.map(p => 
      p.id === post.id 
        ? {
            ...p,
            stats: {
              ...p.stats,
              shares: p.stats.shares + 1
            }
          }
        : p
    );
    
    setPostsState(updatedPosts);
    if (onPostsUpdate) {
      onPostsUpdate(updatedPosts);
    }
    
    setShowShareModal(null);
  };

  const handleEditPost = (postId: number) => {
    const post = postsState.find(p => p.id === postId);
    if (!post) return;

    setEditingPost(post);
    setEditContent(post.content);
    
    // Se for um post de código, carregar dados específicos
    if (post.codeSnippet) {
      setEditCodeContent(post.codeSnippet.code);
      setEditCodeLanguage(post.codeSnippet.language);
      setEditCodeFilename(post.codeSnippet.filename);
    } else {
      setEditCodeContent('');
      setEditCodeLanguage('javascript');
      setEditCodeFilename('');
    }
    
    setShowEditModal(postId);
    setShowOptionsMenu(null);
  };

  const handleDeletePost = (postId: number) => {
    if (confirm('Tem certeza que deseja apagar este post?')) {
      const updatedPosts = postsState.filter(p => p.id !== postId);
      setPostsState(updatedPosts);
      if (onPostsUpdate) {
        onPostsUpdate(updatedPosts);
      }
      
      // Salvar no localStorage
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    }
    setShowOptionsMenu(null);
  };

  const handleSaveEdit = () => {
    if (!editingPost) return;

    const updatedPosts = postsState.map(p => {
      if (p.id === editingPost.id) {
        const updatedPost = {
          ...p,
          content: editContent,
          ...(editingPost.type === 'code' && editCodeContent && {
            codeSnippet: {
              language: editCodeLanguage,
              filename: editCodeFilename || `${editCodeLanguage}.${editCodeLanguage}`,
              code: editCodeContent
            }
          })
        };
        return updatedPost;
      }
      return p;
    });

    setPostsState(updatedPosts);
    if (onPostsUpdate) {
      onPostsUpdate(updatedPosts);
    }

    // Salvar no localStorage
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));

    // Limpar estados
    setShowEditModal(null);
    setEditingPost(null);
    setEditContent('');
    setEditCodeContent('');
    setEditCodeLanguage('javascript');
    setEditCodeFilename('');
  };

  const handleCancelEdit = () => {
    setShowEditModal(null);
    setEditingPost(null);
    setEditContent('');
    setEditCodeContent('');
    setEditCodeLanguage('javascript');
    setEditCodeFilename('');
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

  if (postsState.length === 0) {
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
      {postsState.map((post) => (
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
              <div className="flex items-center gap-2 relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowOptionsMenu(showOptionsMenu === post.id ? null : post.id)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                
                {/* Menu de Opções */}
                {showOptionsMenu === post.id && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                    <div className="py-1">
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                        Editar Post
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Apagar Post
                      </button>
                    </div>
                  </div>
                )}
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
                    onClick={() => copyCode(post.codeSnippet?.code || '', post.id)}
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

            {/* Image Post */}
            {post.imageUrl && (
              <div className="mb-4">
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="w-full max-h-96 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}

            {/* Link Preview */}
            {post.linkPreview && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <img
                    src={post.linkPreview.image}
                    alt="Link preview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {post.linkPreview.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {post.linkPreview.description}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {post.linkPreview.domain}
                    </p>
                  </div>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleComment(post.id)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.stats.comments}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleShare(post.id)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                >
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
                  <span>{post.userSaved ? 'Salvo' : t('community.actions.save')}</span>
                </Button>
              </div>
            </div>

            {/* Seção de Comentários */}
            {showComments === post.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  {/* Lista de Comentários */}
                  {comments[post.id] && comments[post.id].length > 0 && (
                    <div className="space-y-3">
                      {comments[post.id].map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                            <AvatarFallback>
                              {comment.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {comment.author.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {comment.timestamp}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Campo para Novo Comentário */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || undefined} alt={user?.name || 'Você'} />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || 'V'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment.trim()}
                        size="sm"
                        className="px-3"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Compartilhamento */}
            {showShareModal === post.id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Compartilhar Post
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowShareModal(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Escolha onde compartilhar este post:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => shareToSocial('twitter', post)}
                        className="flex items-center gap-2 h-12"
                      >
                        <Twitter className="h-5 w-5 text-blue-400" />
                        Twitter
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => shareToSocial('facebook', post)}
                        className="flex items-center gap-2 h-12"
                      >
                        <Facebook className="h-5 w-5 text-blue-600" />
                        Facebook
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => shareToSocial('linkedin', post)}
                        className="flex items-center gap-2 h-12"
                      >
                        <Linkedin className="h-5 w-5 text-blue-700" />
                        LinkedIn
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => shareToSocial('email', post)}
                        className="flex items-center gap-2 h-12"
                      >
                        <Mail className="h-5 w-5 text-gray-600" />
                        Email
                      </Button>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => shareToSocial('copy', post)}
                        className="w-full flex items-center gap-2 h-12"
                      >
                        <Copy className="h-5 w-5" />
                        Copiar Link
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      <div className="text-center py-6">
        <Button variant="outline" size="lg">
          {t('community.loadMore')}
        </Button>
      </div>

      {/* Modal de Edição de Post */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Editar Post
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Conteúdo do Post */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conteúdo do Post
                  </label>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Escreva seu post..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Se for um post de código, mostrar editor de código */}
                {editingPost.type === 'code' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={editCodeLanguage}
                        onChange={(e) => setEditCodeLanguage(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        {programmingLanguages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                      
                      <Input
                        type="text"
                        value={editCodeFilename}
                        onChange={(e) => setEditCodeFilename(e.target.value)}
                        placeholder="Nome do arquivo (opcional)"
                        className="flex-1"
                      />
                    </div>

                    <div className="relative">
                      <Textarea
                        value={editCodeContent}
                        onChange={(e) => setEditCodeContent(e.target.value)}
                        placeholder="Cole seu código aqui..."
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-900 text-gray-100 font-mono text-sm resize-none min-h-[200px]"
                        style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                      />
                      <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {editCodeLanguage.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
