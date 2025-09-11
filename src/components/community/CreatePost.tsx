'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, FolderOpen, Camera, Link, X, Upload, Image as ImageIcon, RotateCw, RotateCcw, Crop, ZoomIn, ZoomOut, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const [postType, setPostType] = useState('project');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<{
    title: string;
    description: string;
    image: string;
    domain: string;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeFilename, setCodeFilename] = useState('');
  
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
  
  const [imageRotation, setImageRotation] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Função para calcular tempo relativo
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''} atrás`;
  };

  const postTypes = [
    { key: 'project', label: t('community.createPost.project'), icon: <FolderOpen className="h-4 w-4" /> },
    { key: 'image', label: t('community.createPost.image'), icon: <Camera className="h-4 w-4" /> },
    { key: 'link', label: t('community.createPost.link'), icon: <Link className="h-4 w-4" /> },
    { key: 'code', label: 'Código', icon: <Sparkles className="h-4 w-4" /> }
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      setSelectedImage(file);
      
      // Criar preview e abrir modal
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImagePreview(result);
          setShowImageModal(true);
          // Resetar transformações
          setImageRotation(0);
          setImageScale(1);
          setImagePosition({ x: 0, y: 0 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setShowImageModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Funções para edição de imagem
  const rotateImage = (direction: 'left' | 'right') => {
    setImageRotation(prev => prev + (direction === 'right' ? 90 : -90));
  };

  const zoomImage = (direction: 'in' | 'out') => {
    setImageScale(prev => {
      const newScale = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.5, Math.min(3, newScale));
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const confirmImageEdit = () => {
    setShowImageModal(false);
  };

  const cancelImageEdit = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setShowImageModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Funções para link
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const generateLinkPreview = async (url: string) => {
    if (!validateUrl(url)) {
      alert('Por favor, insira uma URL válida.');
      return;
    }

    setIsLoadingPreview(true);
    
    try {
      // Simular busca de preview (em produção, você usaria uma API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Preview real baseado na URL
      const realPreview = {
        title: `Link compartilhado de ${extractDomain(url)}`,
        description: `Compartilhamento de link: ${url}`,
        image: '', // Será implementado com API real
        domain: extractDomain(url)
      };
      
      setLinkPreview(realPreview);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      alert('Erro ao gerar preview do link. Tente novamente.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleLinkSubmit = () => {
    if (!linkUrl.trim()) {
      alert('Por favor, insira uma URL.');
      return;
    }
    generateLinkPreview(linkUrl);
  };

  const removeLink = () => {
    setLinkUrl('');
    setLinkPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (postType === 'image' && !selectedImage) {
      alert('Por favor, selecione uma imagem para publicar.');
      return;
    }
    
    if (postType === 'link' && !linkUrl.trim()) {
      alert('Por favor, insira uma URL.');
      return;
    }
    
    if (postType === 'code' && !codeContent.trim()) {
      alert('Por favor, insira o código.');
      return;
    }

    setIsUploading(true);
    
    try {
      // Simular upload da imagem
      if (selectedImage) {
        console.log('Uploading image:', selectedImage.name);
        // Aqui você faria o upload real para o servidor
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      }

      // Criar post
      const postData = {
        type: postType,
        content,
        image: selectedImage ? {
          name: selectedImage.name,
          size: selectedImage.size,
          type: selectedImage.type,
          preview: imagePreview
        } : null
      };

      console.log('Creating post:', postData);
      
      // Criar o post para adicionar ao feed
      const newPost = {
        id: Date.now(), // ID único baseado no timestamp
        type: postType,
        author: {
          id: user?.id || 1,
          name: user?.name || 'Usuário',
          username: user?.email?.split('@')[0] || 'usuario',
          avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          title: 'Developer',
          verified: false
        },
        content: content,
        tags: [], // Pode ser implementado depois
        timestamp: new Date().toISOString(),
        stats: {
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0
        },
        userLiked: false,
        userSaved: false,
        userFollowed: false,
        // Adicionar dados específicos do tipo
        ...(postType === 'image' && selectedImage && {
          imageUrl: imagePreview
        }),
        ...(postType === 'link' && linkPreview && {
          linkPreview: linkPreview,
          linkUrl: linkUrl
        }),
        ...(postType === 'code' && codeContent && {
          codeSnippet: {
            language: codeLanguage,
            filename: codeFilename || `${codeLanguage}.${codeLanguage}`,
            code: codeContent
          }
        })
      };
      
      // Chamar callback para adicionar ao feed
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Se for um post de projeto, salvar também como projeto
      if (postType === 'project') {
        const projectData = {
          id: `project-${newPost.id}`,
          name: content.split('\n')[0] || 'Novo Projeto', // Usar primeira linha como nome
          description: content,
          status: 'inProgress',
          lastActivity: getTimeAgo(newPost.timestamp),
          technologies: ['React', 'JavaScript'], // Tecnologias padrão
          githubUrl: '',
          liveUrl: '',
          progress: Math.floor(Math.random() * 80) + 20, // Progresso aleatório entre 20-100%
          authorId: user?.id
        };

        // Salvar projeto no localStorage
        const savedProjects = localStorage.getItem('userProjects');
        const projects = savedProjects ? JSON.parse(savedProjects) : [];
        projects.push(projectData);
        localStorage.setItem('userProjects', JSON.stringify(projects));
      }
      
      // Limpar formulário
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setLinkUrl('');
      setLinkPreview(null);
      setCodeContent('');
      setCodeLanguage('javascript');
      setCodeFilename('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert('Erro ao criar post. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.name || 'User'} />
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

                {/* Input de arquivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Preview da imagem selecionada */}
                {imagePreview && selectedImage && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedImage.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowImageModal(true)}
                          className="text-xs"
                        >
                          <Crop className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interface para Link */}
                {postType === 'link' && (
                  <div className="mt-3 space-y-3">
                    {/* Input para URL */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://exemplo.com"
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={handleLinkSubmit}
                        disabled={!linkUrl.trim() || isLoadingPreview}
                        size="sm"
                        className="px-4"
                      >
                        {isLoadingPreview ? (
                          <>
                            <Upload className="h-3 w-3 mr-1 animate-spin" />
                            Carregando...
                          </>
                        ) : (
                          'Preview'
                        )}
                      </Button>
                    </div>

                    {/* Preview do Link */}
                    {linkPreview && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex gap-3">
                          <img
                            src={linkPreview.image}
                            alt="Preview"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {linkPreview.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {linkPreview.description}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              {linkPreview.domain}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeLink}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Interface para Código */}
                {postType === 'code' && (
                  <div className="mt-3 space-y-3">
                    {/* Configurações do Código */}
                    <div className="flex gap-2">
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        {programmingLanguages.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        value={codeFilename}
                        onChange={(e) => setCodeFilename(e.target.value)}
                        placeholder="Nome do arquivo (opcional)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>

                    {/* Editor de Código */}
                    <div className="relative">
                      <textarea
                        value={codeContent}
                        onChange={(e) => setCodeContent(e.target.value)}
                        placeholder="Cole seu código aqui..."
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-900 text-gray-100 font-mono text-sm resize-none"
                        rows={12}
                        style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                      />
                      <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {codeLanguage.toUpperCase()}
                      </div>
                    </div>

                    {/* Preview do Código */}
                    {codeContent && (
                      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-300">
                              {codeLanguage} • {codeFilename || `${codeLanguage}.${codeLanguage}`}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {codeContent.split('\n').length} linhas
                          </div>
                        </div>
                        <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                          <code className={`language-${codeLanguage}`}>{codeContent}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Post Type Buttons and Submit */}
                <div className="flex items-center gap-3 mt-3 -ml-2">
                  {postTypes.map((type) => (
                    <Button
                      key={type.key}
                      type="button"
                      variant={postType === type.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (type.key === 'link') {
                          // Toggle do link - se já está ativo, desativa
                          if (postType === 'link') {
                            setPostType('project');
                            setLinkUrl('');
                            setLinkPreview(null);
                          } else {
                            setPostType('link');
                          }
                        } else if (type.key === 'code') {
                          // Toggle do código - se já está ativo, desativa
                          if (postType === 'code') {
                            setPostType('project');
                            setCodeContent('');
                            setCodeLanguage('javascript');
                            setCodeFilename('');
                          } else {
                            setPostType('code');
                          }
                        } else {
                          setPostType(type.key);
                          if (type.key === 'image') {
                            handleImageUpload();
                          }
                          // Limpar dados específicos se mudar para outro tipo
                          if (type.key !== 'link') {
                            setLinkUrl('');
                            setLinkPreview(null);
                          }
                          if (type.key !== 'code') {
                            setCodeContent('');
                            setCodeLanguage('javascript');
                            setCodeFilename('');
                          }
                        }
                      }}
                      className={`text-xs px-2 py-1 h-8 ${postType === type.key ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                    >
                      {type.icon}
                      <span className="ml-1">{type.label}</span>
                    </Button>
                  ))}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={!content.trim() || isUploading || (postType === 'image' && !selectedImage) || (postType === 'link' && !linkUrl.trim()) || (postType === 'code' && !codeContent.trim())}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs px-3 py-1 h-8"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="h-3 w-3 mr-1 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t('community.createPost.publish')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de Edição de Imagem */}
      {showImageModal && imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Imagem
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelImageEdit}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={confirmImageEdit}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Confirmar
                </Button>
              </div>
            </div>

            {/* Área de Edição */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Preview da Imagem */}
                <div className="lg:col-span-3">
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-h-[400px] flex items-center justify-center overflow-hidden">
                    <div
                      className="relative cursor-move"
                      onMouseDown={handleMouseDown}
                      style={{
                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale}) rotate(${imageRotation}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease'
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Imagem para editar"
                        className="max-w-full max-h-96 rounded-lg shadow-lg"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Controles de Edição */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Controles
                    </h3>
                    
                    {/* Rotação */}
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Rotação</label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rotateImage('left')}
                          className="flex-1"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rotateImage('right')}
                          className="flex-1"
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Zoom */}
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Zoom</label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => zoomImage('out')}
                          className="flex-1"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => zoomImage('in')}
                          className="flex-1"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {Math.round(imageScale * 100)}%
                      </div>
                    </div>

                    {/* Reset */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageRotation(0);
                          setImageScale(1);
                          setImagePosition({ x: 0, y: 0 });
                        }}
                        className="w-full"
                      >
                        Resetar
                      </Button>
                    </div>

                    {/* Informações da Imagem */}
                    {selectedImage && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">
                          Informações
                        </h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <p>Nome: {selectedImage.name}</p>
                          <p>Tamanho: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p>Tipo: {selectedImage.type}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
