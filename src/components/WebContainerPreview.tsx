import React, { useState } from 'react';
import { useWebContainer } from '@/hooks/useWebContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RotateCcw, 
  ExternalLink, 
  Terminal, 
  Globe, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface WebContainerPreviewProps {
  githubUrl: string;
  file?: string;
  height?: number;
  className?: string;
}

export const WebContainerPreview: React.FC<WebContainerPreviewProps> = ({
  githubUrl,
  file,
  height = 600,
  className = ''
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const { isReady, isLoading, error, url, logs, restart } = useWebContainer({
    githubUrl,
    file
  });

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (isReady) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Terminal className="h-4 w-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Inicializando...';
    if (error) return 'Erro';
    if (isReady) return 'Rodando';
    return 'Aguardando';
  };

  const getStatusColor = () => {
    if (isLoading) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (error) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (isReady) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">WebContainer</span>
          <Badge className={`text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {isReady && url && (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-7 px-2"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir
              </a>
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={restart}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLogs(!showLogs)}
            className="h-7 px-2"
          >
            <Terminal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Inicializando WebContainer...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Isso pode levar alguns segundos
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
            <div className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                Erro ao inicializar WebContainer
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                {error}
              </p>
              <Button onClick={restart} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {isReady && url && (
          <iframe
            src={url}
            title="WebContainer Preview"
            className="w-full h-full border-0"
            allowFullScreen
          />
        )}

        {!isLoading && !error && !isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <Terminal className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aguardando inicialização...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Logs Panel */}
      {showLogs && (
        <div className="border-t bg-gray-900 text-green-400 p-3 max-h-48 overflow-y-auto">
          <div className="text-xs font-mono space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-500">Nenhum log disponível</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 border-t flex justify-between items-center">
        <span>Powered by WebContainer API</span>
        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3" />
          <span>Node.js no navegador</span>
        </div>
      </div>
    </div>
  );
};
