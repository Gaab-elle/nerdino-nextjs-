'use client';

import { useState, useCallback } from 'react';
import { UploadType } from '@/lib/upload';

export type { UploadType };

export interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: {
    filename: string;
    url: string;
    size: number;
    mimetype: string;
  };
  error?: string;
}

export interface UploadConfig {
  maxSize: number;
  maxSizeMB: number;
  allowedTypes: string[];
  destination: string;
}

export interface UseUploadReturn {
  files: UploadFile[];
  isUploading: boolean;
  config: UploadConfig | null;
  error: string | null;
  uploadFile: (file: File, type: UploadType) => Promise<UploadFile | null>;
  uploadMultipleFiles: (files: File[], type: UploadType) => Promise<UploadFile[]>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  getUploadConfig: (type: UploadType) => Promise<void>;
  deleteFile: (filename: string, type: UploadType) => Promise<boolean>;
}

export function useUpload(): UseUploadReturn {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [config, setConfig] = useState<UploadConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const getUploadConfig = useCallback(async (type: UploadType) => {
    try {
      const response = await fetch(`/api/upload?type=${type}`);
      if (!response.ok) {
        throw new Error('Failed to get upload config');
      }
      const data = await response.json();
      setConfig(data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get upload config');
    }
  }, []);

  const uploadFile = useCallback(async (file: File, type: UploadType): Promise<UploadFile | null> => {
    const id = generateId();
    const uploadFile: UploadFile = {
      file,
      id,
      progress: 0,
      status: 'pending',
    };

    setFiles(prev => [...prev, uploadFile]);
    setIsUploading(true);
    setError(null);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'uploading' } : f));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Update file with success result
      const updatedFile: UploadFile = {
        ...uploadFile,
        status: 'success',
        progress: 100,
        result: data.data,
      };

      setFiles(prev => prev.map(f => f.id === id ? updatedFile : f));
      return updatedFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      
      // Update file with error
      const errorFile: UploadFile = {
        ...uploadFile,
        status: 'error',
        error: errorMessage,
      };

      setFiles(prev => prev.map(f => f.id === id ? errorFile : f));
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (files: File[], type: UploadType): Promise<UploadFile[]> => {
    const uploadFiles: UploadFile[] = files.map(file => ({
      file,
      id: generateId(),
      progress: 0,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
    setIsUploading(true);
    setError(null);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        uploadFiles.some(uf => uf.id === f.id) 
          ? { ...f, status: 'uploading' }
          : f
      ));

      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('type', type);

      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const results: UploadFile[] = [];

      // Update successful uploads
      data.data.successful.forEach((result: {
        filename: string;
        url: string;
        size: number;
        mimetype: string;
      }, index: number) => {
        const uploadFile = uploadFiles[index];
        if (uploadFile) {
          const updatedFile: UploadFile = {
            ...uploadFile,
            status: 'success',
            progress: 100,
            result,
          };
          results.push(updatedFile);
          setFiles(prev => prev.map(f => f.id === uploadFile.id ? updatedFile : f));
        }
      });

      // Update failed uploads
      data.data.failed.forEach((error: {
        filename: string;
        error: string;
      }, index: number) => {
        const uploadFile = uploadFiles[index + data.data.successful.length];
        if (uploadFile) {
          const errorFile: UploadFile = {
            ...uploadFile,
            status: 'error',
            error: error.error,
          };
          results.push(errorFile);
          setFiles(prev => prev.map(f => f.id === uploadFile.id ? errorFile : f));
        }
      });

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      
      // Update all files with error
      uploadFiles.forEach(uploadFile => {
        const errorFile: UploadFile = {
          ...uploadFile,
          status: 'error',
          error: errorMessage,
        };
        setFiles(prev => prev.map(f => f.id === uploadFile.id ? errorFile : f));
      });

      setError(errorMessage);
      return uploadFiles.map(uf => ({ ...uf, status: 'error', error: errorMessage }));
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  const deleteFile = useCallback(async (filename: string, type: UploadType): Promise<boolean> => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  }, []);

  return {
    files,
    isUploading,
    config,
    error,
    uploadFile,
    uploadMultipleFiles,
    removeFile,
    clearFiles,
    getUploadConfig,
    deleteFile,
  };
}
