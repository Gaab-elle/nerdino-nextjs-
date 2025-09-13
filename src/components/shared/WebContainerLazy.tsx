import React, { useState } from 'react';
import { WebContainerModal } from './WebContainerModal';
import { Button } from '@/components/ui/button';
import { Play, Code } from 'lucide-react';

interface WebContainerLazyProps {
  githubUrl: string;
  file?: string;
  buttonLabel?: string;
  projectName?: string;
  className?: string;
}

export const WebContainerLazy: React.FC<WebContainerLazyProps> = ({
  githubUrl,
  file,
  buttonLabel = 'WebContainer',
  projectName,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={`flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 ${className}`}
        title="Abrir no WebContainer"
      >
        <Code className="h-4 w-4" />
        {buttonLabel}
      </Button>

      <WebContainerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        githubUrl={githubUrl}
        file={file}
        projectName={projectName}
      />
    </>
  );
};
