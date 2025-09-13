import { useState, useEffect, useRef } from 'react';
import { WebContainer, FileSystemTree } from '@webcontainer/api';

interface UseWebContainerProps {
  githubUrl: string;
  file?: string;
}

interface WebContainerState {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  url: string | null;
  logs: string[];
}

export const useWebContainer = ({ githubUrl, file }: UseWebContainerProps) => {
  const [state, setState] = useState<WebContainerState>({
    isReady: false,
    isLoading: true,
    error: null,
    url: null,
    logs: []
  });

  const webcontainerRef = useRef<WebContainer | null>(null);
  const isInitialized = useRef(false);

  const addLog = (message: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${message}`]
    }));
  };

  const createProjectFiles = async (): Promise<FileSystemTree> => {
    try {
      // Extrair owner e repo da URL do GitHub
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:[\/#?]|$)/i);
      if (!match) {
        throw new Error('URL do GitHub inválida');
      }

      const [, owner, repo] = match;
      const repoName = repo.replace(/\.git$/i, '');

      // Criar estrutura básica baseada no tipo de projeto
      const isNext = file?.includes('pages/') || repoName.toLowerCase().includes('next');
      const isReact = file?.includes('src/App') || repoName.toLowerCase().includes('react');
      const isVue = file?.includes('.vue') || repoName.toLowerCase().includes('vue');

      if (isNext) {
        return {
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: repoName,
                version: '0.1.0',
                private: true,
                scripts: {
                  dev: 'next dev',
                  build: 'next build',
                  start: 'next start',
                  lint: 'next lint'
                },
                dependencies: {
                  next: '^14.0.0',
                  react: '^18.0.0',
                  'react-dom': '^18.0.0'
                }
              }, null, 2)
            }
          },
          'pages/index.js': {
            file: {
              contents: `import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Bem-vindo ao ${repoName}!</h1>
      <p>Este é um projeto Next.js rodando no WebContainer.</p>
      <div style={{ 
        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <h2>🚀 WebContainer API</h2>
        <p>Executando Node.js diretamente no navegador!</p>
      </div>
    </div>
  );
}`
            }
          },
          'next.config.js': {
            file: {
              contents: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`
            }
          }
        };
      }

      if (isVue) {
        return {
          'package.json': {
            file: {
              contents: JSON.stringify({
                name: repoName,
                version: '0.1.0',
                private: true,
                scripts: {
                  dev: 'vite',
                  build: 'vite build',
                  preview: 'vite preview'
                },
                dependencies: {
                  vue: '^3.0.0',
                  'vue-router': '^4.0.0'
                },
                devDependencies: {
                  '@vitejs/plugin-vue': '^4.0.0',
                  vite: '^4.0.0'
                }
              }, null, 2)
            }
          },
          'src/App.vue': {
            file: {
              contents: `<template>
  <div id="app">
    <h1>Bem-vindo ao ${repoName}!</h1>
    <p>Este é um projeto Vue.js rodando no WebContainer.</p>
    <div class="feature-box">
      <h2>🚀 WebContainer API</h2>
      <p>Executando Node.js diretamente no navegador!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  padding: 2rem;
}

.feature-box {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>`
            }
          },
          'src/main.js': {
            file: {
              contents: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`
            }
          },
          'index.html': {
            file: {
              contents: `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${repoName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`
            }
          },
          'vite.config.js': {
            file: {
              contents: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  }
})`
            }
          }
        };
      }

      // Default React
      return {
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: repoName,
              version: '0.1.0',
              private: true,
              scripts: {
                start: 'react-scripts start',
                build: 'react-scripts build',
                test: 'react-scripts test',
                eject: 'react-scripts eject'
              },
              dependencies: {
                react: '^18.0.0',
                'react-dom': '^18.0.0',
                'react-scripts': '5.0.1'
              }
            }, null, 2)
          }
        },
        'src/App.js': {
          file: {
            contents: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bem-vindo ao ${repoName}!</h1>
        <p>Este é um projeto React rodando no WebContainer.</p>
        <div className="feature-box">
          <h2>🚀 WebContainer API</h2>
          <p>Executando Node.js diretamente no navegador!</p>
        </div>
      </header>
    </div>
  );
}

export default App;`
          }
        },
        'src/App.css': {
          file: {
            contents: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 2rem;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.feature-box {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  max-width: 600px;
}`
          }
        },
        'src/index.js': {
          file: {
            contents: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
          }
        },
        'src/index.css': {
          file: {
            contents: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`
          }
        },
        'public/index.html': {
          file: {
            contents: `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${repoName} - Projeto React" />
    <title>${repoName}</title>
  </head>
  <body>
    <noscript>Você precisa habilitar JavaScript para executar este app.</noscript>
    <div id="root"></div>
  </body>
</html>`
          }
        }
      };
    } catch (error) {
      throw new Error(`Erro ao criar arquivos do projeto: ${error}`);
    }
  };

  const initializeWebContainer = async () => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      addLog('🚀 Inicializando WebContainer...');
      
      // Verificar se SharedArrayBuffer está disponível
      if (typeof SharedArrayBuffer === 'undefined') {
        throw new Error('SharedArrayBuffer não está disponível. Verifique os headers CORS.');
      }

      // Inicializar WebContainer
      const webcontainer = await WebContainer.boot();
      webcontainerRef.current = webcontainer;
      
      addLog('✅ WebContainer inicializado com sucesso!');

      // Criar arquivos do projeto
      const files = await createProjectFiles();
      addLog('📁 Arquivos do projeto criados');

      // Montar arquivos no WebContainer
      await webcontainer.mount(files);
      addLog('📂 Arquivos montados no WebContainer');

      // Instalar dependências
      addLog('📦 Instalando dependências...');
      const installProcess = await webcontainer.spawn('npm', ['install']);
      
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            addLog(`📦 ${data}`);
          },
        })
      );

      const exitCode = await installProcess.exit;
      if (exitCode !== 0) {
        throw new Error('Falha na instalação das dependências');
      }
      
      addLog('✅ Dependências instaladas com sucesso!');

      // Iniciar servidor de desenvolvimento
      addLog('🌐 Iniciando servidor de desenvolvimento...');
      await startDevServer(webcontainer);

    } catch (error) {
      addLog(`❌ Erro: ${error}`);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  const startDevServer = async (webcontainer: WebContainer) => {
    try {
      // Determinar comando baseado no tipo de projeto
      const packageJson = await webcontainer.fs.readFile('package.json', 'utf-8');
      const pkg = JSON.parse(packageJson);
      
      let command: string;
      let args: string[];

      if (pkg.scripts?.dev) {
        command = 'npm';
        args = ['run', 'dev'];
      } else if (pkg.scripts?.start) {
        command = 'npm';
        args = ['start'];
      } else {
        command = 'npm';
        args = ['start'];
      }

      addLog(`🚀 Executando: ${command} ${args.join(' ')}`);
      
      await webcontainer.spawn(command, args);

      // Aguardar servidor estar pronto
      webcontainer.on('server-ready', (port, url) => {
        addLog(`✅ Servidor rodando em: ${url}`);
        setState(prev => ({
          ...prev,
          isReady: true,
          isLoading: false,
          url: url
        }));
      });

    } catch (error) {
      throw new Error(`Erro ao iniciar servidor: ${error}`);
    }
  };

  useEffect(() => {
    if (githubUrl) {
      initializeWebContainer();
    }
  }, [githubUrl]);

  const restart = () => {
    isInitialized.current = false;
    webcontainerRef.current = null;
    setState({
      isReady: false,
      isLoading: true,
      error: null,
      url: null,
      logs: []
    });
    initializeWebContainer();
  };

  return {
    ...state,
    restart,
    addLog
  };
};
