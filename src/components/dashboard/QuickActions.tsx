'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, User, Github, FileText, Code, Share2, Settings, X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGitHub } from '@/hooks/useGitHub';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'outline' | 'secondary';
  onClick: () => void;
}

export const QuickActions: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected, syncGitHub, getGitHubStats } = useGitHub();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [githubStats, setGithubStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showShareProjectModal, setShowShareProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: ''
  });
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'project' as 'project' | 'image' | 'link' | 'code'
  });
  const [readmeData, setReadmeData] = useState({
    projectName: '',
    description: '',
    technologies: '',
    installation: '',
    usage: '',
    features: '',
    author: user?.name || '',
    license: 'MIT'
  });
  const [codeData, setCodeData] = useState({
    title: '',
    description: '',
    language: 'javascript',
    code: '',
    tags: ''
  });
  const [shareProjectData, setShareProjectData] = useState({
    selectedProject: '',
    customMessage: '',
    includeStats: true,
    includeTechnologies: true
  });
  const [userProjects, setUserProjects] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected) {
      loadGitHubStats();
    }
  }, [isConnected]);

  useEffect(() => {
    if (user) {
      loadUserProjects();
    }
  }, [user]);

  useEffect(() => {
    // Atualizar dados quando houver mudanças nos posts/projetos
    const handleDataUpdate = () => {
      if (user) {
        loadUserProjects();
      }
    };

    window.addEventListener('postAdded', handleDataUpdate);
    window.addEventListener('projectAdded', handleDataUpdate);
    window.addEventListener('commentAdded', handleDataUpdate);

    return () => {
      window.removeEventListener('postAdded', handleDataUpdate);
      window.removeEventListener('projectAdded', handleDataUpdate);
      window.removeEventListener('commentAdded', handleDataUpdate);
    };
  }, [user]);


  const loadGitHubStats = async () => {
    try {
      setIsLoading(true);
      const stats = await getGitHubStats();
      setGithubStats(stats);
    } catch (error) {
      console.error('Failed to load GitHub stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProjects = () => {
    try {
      const savedProjects = localStorage.getItem('userProjects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      
      // Filtrar projetos do usuário atual
      const userProjectsList = projects.filter((project: any) => 
        project.authorId === user?.id
      );
      
      setUserProjects(userProjectsList);
    } catch (error) {
      console.error('Error loading user projects:', error);
      setUserProjects([]);
    }
  };

  const handleSyncGitHub = async () => {
    try {
      setIsLoading(true);
      await syncGitHub();
      await loadGitHubStats();
    } catch (error) {
      console.error('Failed to sync GitHub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const handleSaveProject = () => {
    if (!newProject.name.trim()) {
      alert('Por favor, insira o nome do projeto.');
      return;
    }

    const projectData = {
      id: `project-${Date.now()}`,
      name: newProject.name,
      description: newProject.description,
      status: 'inProgress',
      lastActivity: 'Agora',
      technologies: newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
      githubUrl: newProject.githubUrl,
      liveUrl: newProject.liveUrl,
      progress: 10, // Novo projeto começa com 10%
      authorId: user?.id
    };

    // Salvar projeto no localStorage
    const savedProjects = localStorage.getItem('userProjects');
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    projects.push(projectData);
    localStorage.setItem('userProjects', JSON.stringify(projects));

    // Limpar formulário e fechar modal
    setNewProject({
      name: '',
      description: '',
      technologies: '',
      githubUrl: '',
      liveUrl: ''
    });
    setShowNewProjectModal(false);

    // Disparar evento customizado para atualizar a lista de projetos
    window.dispatchEvent(new CustomEvent('projectAdded'));
  };

  const handleCancelProject = () => {
    setNewProject({
      name: '',
      description: '',
      technologies: '',
      githubUrl: '',
      liveUrl: ''
    });
    setShowNewProjectModal(false);
  };

  const handleNewPost = () => {
    setShowNewPostModal(true);
  };

  const handleSavePost = () => {
    if (!newPost.content.trim()) {
      alert('Por favor, insira o conteúdo do post.');
      return;
    }

    const postData = {
      id: `post-${Date.now()}`,
      type: newPost.type,
      content: newPost.content,
      author: {
        id: user?.id,
        name: user?.name || 'Usuário',
        avatar_url: user?.avatar_url || ''
      },
      timestamp: new Date().toISOString(),
      stats: {
        likes: 0,
        comments: 0,
        shares: 0
      },
      userLiked: false,
      userSaved: false,
      userFollowed: false
    };

    // Salvar post no localStorage
    const savedPosts = localStorage.getItem('communityPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : [];
    posts.push(postData);
    localStorage.setItem('communityPosts', JSON.stringify(posts));

    // Se for um post de projeto, também criar o projeto
    if (newPost.type === 'project') {
      const projectData = {
        id: `project-${postData.id}`,
        name: newPost.content.split('\n')[0] || 'Novo Projeto',
        description: newPost.content,
        status: 'inProgress',
        lastActivity: 'Agora',
        technologies: ['React', 'JavaScript'],
        githubUrl: '',
        liveUrl: '',
        progress: 10,
        authorId: user?.id
      };

      const savedProjects = localStorage.getItem('userProjects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      projects.push(projectData);
      localStorage.setItem('userProjects', JSON.stringify(projects));
    }

    // Limpar formulário e fechar modal
    setNewPost({
      content: '',
      type: 'project'
    });
    setShowNewPostModal(false);

    // Disparar eventos para atualizar as listas
    window.dispatchEvent(new CustomEvent('postAdded'));
    window.dispatchEvent(new CustomEvent('projectAdded'));
  };

  const handleCancelPost = () => {
    setNewPost({
      content: '',
      type: 'project'
    });
    setShowNewPostModal(false);
  };

  const handleViewProfile = () => {
    // Verificar se o usuário está autenticado
    if (!user) {
      alert('Você precisa estar logado para ver seu perfil.');
      return;
    }

    // Adicionar um pequeno delay para feedback visual
    const button = document.querySelector('[data-action="view-profile"]') as HTMLButtonElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }
    
    // Navegar para o perfil
    router.push('/profile');
  };

  const handleCreateReadme = () => {
    setShowReadmeModal(true);
  };

  const generateReadme = () => {
    const readme = `# ${readmeData.projectName}

${readmeData.description}

## 🚀 Tecnologias

${readmeData.technologies.split(',').map(tech => `- ${tech.trim()}`).join('\n')}

## 📦 Instalação

\`\`\`bash
${readmeData.installation || 'npm install'}
\`\`\`

## 🎯 Como usar

${readmeData.usage}

## ✨ Funcionalidades

${readmeData.features.split(',').map(feature => `- ${feature.trim()}`).join('\n')}

## 👨‍💻 Autor

**${readmeData.author}**

## 📄 Licença

Este projeto está sob a licença ${readmeData.license}. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

⭐ Se este projeto te ajudou, considere dar uma estrela!`;

    return readme;
  };

  const handleSaveReadme = () => {
    if (!readmeData.projectName.trim()) {
      alert('Por favor, insira o nome do projeto.');
      return;
    }

    const readmeContent = generateReadme();
    
    // Criar e baixar o arquivo README.md
    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Limpar formulário e fechar modal
    setReadmeData({
      projectName: '',
      description: '',
      technologies: '',
      installation: '',
      usage: '',
      features: '',
      author: user?.name || '',
      license: 'MIT'
    });
    setShowReadmeModal(false);
  };

  const handleCancelReadme = () => {
    setReadmeData({
      projectName: '',
      description: '',
      technologies: '',
      installation: '',
      usage: '',
      features: '',
      author: user?.name || '',
      license: 'MIT'
    });
    setShowReadmeModal(false);
  };

  const handleShareCode = () => {
    setShowCodeModal(true);
  };

  const handleSaveCode = () => {
    if (!codeData.title.trim() || !codeData.code.trim()) {
      alert('Por favor, preencha o título e o código.');
      return;
    }

    // Criar post de código na comunidade
    const codePost = {
      id: `code-${Date.now()}`,
      type: 'code',
      content: codeData.description || `Snippet: ${codeData.title}`,
      author: {
        id: user?.id,
        name: user?.name || 'Usuário',
        avatar_url: user?.avatar_url || ''
      },
      timestamp: new Date().toISOString(),
      codeSnippet: {
        language: codeData.language,
        filename: `${codeData.title.toLowerCase().replace(/\s+/g, '-')}.${getFileExtension(codeData.language)}`,
        code: codeData.code
      },
      stats: {
        likes: 0,
        comments: 0,
        shares: 0
      },
      userLiked: false,
      userSaved: false,
      userFollowed: false
    };

    // Salvar post no localStorage
    const savedPosts = localStorage.getItem('communityPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : [];
    posts.push(codePost);
    localStorage.setItem('communityPosts', JSON.stringify(posts));

    // Limpar formulário e fechar modal
    setCodeData({
      title: '',
      description: '',
      language: 'javascript',
      code: '',
      tags: ''
    });
    setShowCodeModal(false);

    // Disparar evento para atualizar a lista de posts
    window.dispatchEvent(new CustomEvent('postAdded'));

    alert('Código compartilhado com sucesso na comunidade!');
  };

  const handleCancelCode = () => {
    setCodeData({
      title: '',
      description: '',
      language: 'javascript',
      code: '',
      tags: ''
    });
    setShowCodeModal(false);
  };

  const getFileExtension = (language: string) => {
    const extensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp',
      c: 'c',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sql: 'sql',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      markdown: 'md'
    };
    return extensions[language] || 'txt';
  };

  const handleShareProject = () => {
    if (userProjects.length === 0) {
      alert('Você não tem projetos para compartilhar. Crie um projeto primeiro!');
      return;
    }
    setShowShareProjectModal(true);
  };

  const handleSaveShareProject = () => {
    if (!shareProjectData.selectedProject) {
      alert('Por favor, selecione um projeto para compartilhar.');
      return;
    }

    const selectedProject = userProjects.find(p => p.id === shareProjectData.selectedProject);
    if (!selectedProject) {
      alert('Projeto não encontrado.');
      return;
    }

    // Criar post de projeto na comunidade
    let content = shareProjectData.customMessage || `Compartilhando meu projeto: ${selectedProject.name}`;
    
    if (shareProjectData.includeStats) {
      content += `\n\n📊 Status: ${selectedProject.status}`;
      content += `\n📈 Progresso: ${selectedProject.progress}%`;
    }
    
    if (shareProjectData.includeTechnologies && selectedProject.technologies) {
      content += `\n🛠️ Tecnologias: ${selectedProject.technologies.join(', ')}`;
    }
    
    if (selectedProject.description) {
      content += `\n\n📝 ${selectedProject.description}`;
    }

    const projectPost = {
      id: `project-share-${Date.now()}`,
      type: 'project',
      content: content,
      author: {
        id: user?.id,
        name: user?.name || 'Usuário',
        avatar_url: user?.avatar_url || ''
      },
      timestamp: new Date().toISOString(),
      projectData: {
        name: selectedProject.name,
        description: selectedProject.description,
        status: selectedProject.status,
        progress: selectedProject.progress,
        technologies: selectedProject.technologies,
        githubUrl: selectedProject.githubUrl,
        liveUrl: selectedProject.liveUrl,
        lastActivity: selectedProject.lastActivity
      },
      stats: {
        likes: 0,
        comments: 0,
        shares: 0
      },
      userLiked: false,
      userSaved: false,
      userFollowed: false
    };

    // Salvar post no localStorage
    const savedPosts = localStorage.getItem('communityPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : [];
    posts.push(projectPost);
    localStorage.setItem('communityPosts', JSON.stringify(posts));

    // Limpar formulário e fechar modal
    setShareProjectData({
      selectedProject: '',
      customMessage: '',
      includeStats: true,
      includeTechnologies: true
    });
    setShowShareProjectModal(false);

    // Disparar evento para atualizar a lista de posts
    window.dispatchEvent(new CustomEvent('postAdded'));

    alert('Projeto compartilhado com sucesso na comunidade!');
  };

  const handleCancelShareProject = () => {
    setShareProjectData({
      selectedProject: '',
      customMessage: '',
      includeStats: true,
      includeTechnologies: true
    });
    setShowShareProjectModal(false);
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-project',
      label: t('dashboard.newProject'),
      icon: <Plus size={16} />,
      variant: 'default',
      onClick: handleNewProject
    },
    {
      id: 'make-post',
      label: t('dashboard.makePost'),
      icon: <Edit3 size={16} />,
      variant: 'outline',
      onClick: handleNewPost
    },
    {
      id: 'view-profile',
      label: t('dashboard.viewPublicProfile'),
      icon: <User size={16} />,
      variant: 'outline',
      onClick: handleViewProfile
    },
    {
      id: 'sync-github',
      label: isLoading ? 'Sincronizando...' : t('dashboard.syncGitHub'),
      icon: <Github size={16} />,
      variant: 'outline',
      onClick: handleSyncGitHub
    }
  ];

  const additionalActions = [
    {
      id: 'create-readme',
      label: t('dashboard.quickActions.createReadme'),
      icon: <FileText size={16} />,
      onClick: handleCreateReadme
    },
    {
      id: 'code-snippet',
      label: t('dashboard.quickActions.shareCode'),
      icon: <Code size={16} />,
      onClick: handleShareCode
    },
    {
      id: 'share-project',
      label: t('dashboard.quickActions.shareProject'),
      icon: <Share2 size={16} />,
      onClick: handleShareProject
    },
    {
      id: 'settings',
      label: t('dashboard.quickActions.settings'),
      icon: <Settings size={16} />,
      onClick: handleSettings
    }
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.quickActions.title')}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        <div className="space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              className="w-full justify-start transition-transform duration-150"
              onClick={action.onClick}
              data-action={action.id}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('dashboard.quickActions.moreActions')}
          </h3>
          
          {/* Additional Actions Grid */}
          <div className="grid grid-cols-2 gap-2">
            {additionalActions.map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center p-3 h-auto"
                onClick={action.onClick}
              >
                {action.icon}
                <span className="text-xs mt-1 text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('dashboard.quickActions.quickSummary')}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {userProjects.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.quickActions.projects')}</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {(() => {
                  try {
                    const savedPosts = localStorage.getItem('communityPosts');
                    const posts = savedPosts ? JSON.parse(savedPosts) : [];
                    return Array.isArray(posts) ? posts.filter((post: any) => post.author.id === user?.id).length : 0;
                  } catch (error) {
                    return 0;
                  }
                })()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Posts</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {(() => {
                  try {
                    const savedComments = localStorage.getItem('communityComments');
                    const comments = savedComments ? JSON.parse(savedComments) : [];
                    return Array.isArray(comments) ? comments.filter((comment: any) => comment.author.id === user?.id).length : 0;
                  } catch (error) {
                    return 0;
                  }
                })()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Comentários</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {(() => {
                  try {
                    const savedPosts = localStorage.getItem('communityPosts');
                    const posts = savedPosts ? JSON.parse(savedPosts) : [];
                    if (!Array.isArray(posts)) return 0;
                    const userPosts = posts.filter((post: any) => post.author.id === user?.id);
                    return userPosts.reduce((total: number, post: any) => total + (post.stats?.likes || 0), 0);
                  } catch (error) {
                    return 0;
                  }
                })()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Curtidas</div>
            </div>
          </div>
        </div>

        {/* GitHub Integration Status */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Github size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected === null ? 'Verificando...' : 
                 isConnected ? 'GitHub conectado' : 'GitHub não conectado'}
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              isConnected === null ? 'bg-yellow-500' : 
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          {isConnected === true && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {githubStats ? 'Dados sincronizados' : 'Clique em sincronizar para carregar dados'}
            </p>
          )}
          {isConnected === false && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Conecte sua conta GitHub para sincronizar repositórios
            </p>
          )}
        </div>
      </CardContent>

      {/* Modal para Novo Projeto */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Novo Projeto
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelProject}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Projeto *
                  </label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="Ex: Meu App React"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Descreva seu projeto..."
                    className="w-full min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tecnologias
                  </label>
                  <Input
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                    placeholder="React, TypeScript, Node.js (separadas por vírgula)"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL do GitHub
                  </label>
                  <Input
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})}
                    placeholder="https://github.com/usuario/projeto"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL do Demo
                  </label>
                  <Input
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                    placeholder="https://meuprojeto.com"
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelProject}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveProject}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Criar Projeto
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Novo Post */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Novo Post
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelPost}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Post
                  </label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({...newPost, type: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="project">Projeto</option>
                    <option value="image">Imagem</option>
                    <option value="link">Link</option>
                    <option value="code">Código</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conteúdo *
                  </label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    placeholder={
                      newPost.type === 'project' ? 'Descreva seu projeto...' :
                      newPost.type === 'code' ? 'Cole seu código aqui...' :
                      newPost.type === 'link' ? 'Compartilhe um link interessante...' :
                      'Compartilhe uma imagem...'
                    }
                    className="w-full min-h-[120px]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelPost}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSavePost}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Criar README */}
      {showReadmeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Criar README
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelReadme}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Projeto *
                    </label>
                    <Input
                      value={readmeData.projectName}
                      onChange={(e) => setReadmeData({...readmeData, projectName: e.target.value})}
                      placeholder="Ex: Meu Projeto Incrível"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Autor
                    </label>
                    <Input
                      value={readmeData.author}
                      onChange={(e) => setReadmeData({...readmeData, author: e.target.value})}
                      placeholder="Seu nome"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <Textarea
                    value={readmeData.description}
                    onChange={(e) => setReadmeData({...readmeData, description: e.target.value})}
                    placeholder="Descreva seu projeto..."
                    className="w-full min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tecnologias
                  </label>
                  <Input
                    value={readmeData.technologies}
                    onChange={(e) => setReadmeData({...readmeData, technologies: e.target.value})}
                    placeholder="React, TypeScript, Node.js (separadas por vírgula)"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comando de Instalação
                  </label>
                  <Input
                    value={readmeData.installation}
                    onChange={(e) => setReadmeData({...readmeData, installation: e.target.value})}
                    placeholder="npm install"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Como Usar
                  </label>
                  <Textarea
                    value={readmeData.usage}
                    onChange={(e) => setReadmeData({...readmeData, usage: e.target.value})}
                    placeholder="Instruções de como usar o projeto..."
                    className="w-full min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Funcionalidades
                  </label>
                  <Input
                    value={readmeData.features}
                    onChange={(e) => setReadmeData({...readmeData, features: e.target.value})}
                    placeholder="Funcionalidade 1, Funcionalidade 2, Funcionalidade 3"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Licença
                  </label>
                  <select
                    value={readmeData.license}
                    onChange={(e) => setReadmeData({...readmeData, license: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="MIT">MIT</option>
                    <option value="Apache-2.0">Apache 2.0</option>
                    <option value="GPL-3.0">GPL 3.0</option>
                    <option value="BSD-3-Clause">BSD 3-Clause</option>
                    <option value="Unlicense">Unlicense</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelReadme}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveReadme}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar README
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Compartilhar Código */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Compartilhar Código
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelCode}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título do Snippet *
                    </label>
                    <Input
                      value={codeData.title}
                      onChange={(e) => setCodeData({...codeData, title: e.target.value})}
                      placeholder="Ex: Função para validar email"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Linguagem
                    </label>
                    <select
                      value={codeData.language}
                      onChange={(e) => setCodeData({...codeData, language: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                      <option value="php">PHP</option>
                      <option value="ruby">Ruby</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="swift">Swift</option>
                      <option value="kotlin">Kotlin</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="scss">SCSS</option>
                      <option value="sql">SQL</option>
                      <option value="json">JSON</option>
                      <option value="xml">XML</option>
                      <option value="yaml">YAML</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <Textarea
                    value={codeData.description}
                    onChange={(e) => setCodeData({...codeData, description: e.target.value})}
                    placeholder="Descreva o que este código faz..."
                    className="w-full min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código *
                  </label>
                  <Textarea
                    value={codeData.code}
                    onChange={(e) => setCodeData({...codeData, code: e.target.value})}
                    placeholder="Cole seu código aqui..."
                    className="w-full min-h-[200px] font-mono text-sm"
                    style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <Input
                    value={codeData.tags}
                    onChange={(e) => setCodeData({...codeData, tags: e.target.value})}
                    placeholder="react, hooks, validation (separadas por vírgula)"
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelCode}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveCode}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Compartilhar Código
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Compartilhar Projeto */}
      {showShareProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Compartilhar Projeto
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelShareProject}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selecionar Projeto *
                  </label>
                  <select
                    value={shareProjectData.selectedProject}
                    onChange={(e) => setShareProjectData({...shareProjectData, selectedProject: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Escolha um projeto...</option>
                    {userProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.status} ({project.progress}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem Personalizada
                  </label>
                  <Textarea
                    value={shareProjectData.customMessage}
                    onChange={(e) => setShareProjectData({...shareProjectData, customMessage: e.target.value})}
                    placeholder="Adicione uma mensagem personalizada para acompanhar o projeto..."
                    className="w-full min-h-[100px]"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Incluir no Post:
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeStats"
                      checked={shareProjectData.includeStats}
                      onChange={(e) => setShareProjectData({...shareProjectData, includeStats: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeStats" className="text-sm text-gray-700 dark:text-gray-300">
                      Estatísticas (Status e Progresso)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeTechnologies"
                      checked={shareProjectData.includeTechnologies}
                      onChange={(e) => setShareProjectData({...shareProjectData, includeTechnologies: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeTechnologies" className="text-sm text-gray-700 dark:text-gray-300">
                      Tecnologias Utilizadas
                    </label>
                  </div>
                </div>

                {shareProjectData.selectedProject && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview do Post:
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {(() => {
                        const selectedProject = userProjects.find(p => p.id === shareProjectData.selectedProject);
                        if (!selectedProject) return '';
                        
                        let preview = shareProjectData.customMessage || `Compartilhando meu projeto: ${selectedProject.name}`;
                        
                        if (shareProjectData.includeStats) {
                          preview += `\n\n📊 Status: ${selectedProject.status}`;
                          preview += `\n📈 Progresso: ${selectedProject.progress}%`;
                        }
                        
                        if (shareProjectData.includeTechnologies && selectedProject.technologies) {
                          preview += `\n🛠️ Tecnologias: ${selectedProject.technologies.join(', ')}`;
                        }
                        
                        if (selectedProject.description) {
                          preview += `\n\n📝 ${selectedProject.description}`;
                        }
                        
                        return preview;
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelShareProject}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveShareProject}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!shareProjectData.selectedProject}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar Projeto
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
