import React from 'react';
import { WebContainerPreview } from './WebContainerPreview';
import { X } from 'lucide-react';

interface WebContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubUrl: string;
  file?: string;
  projectName?: string;
}

export const WebContainerModal: React.FC<WebContainerModalProps> = ({
  isOpen,
  onClose,
  githubUrl,
  file,
  projectName = 'Projeto'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-6xl h-[90vh] rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 dark:bg-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {projectName} - WebContainer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Executando Node.js diretamente no navegador
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 h-full">
          <WebContainerPreview
            githubUrl={githubUrl}
            file={file}
            height={window.innerHeight * 0.7}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};
