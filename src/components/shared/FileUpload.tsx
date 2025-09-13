'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, File, Image, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUpload, UploadFile, UploadType } from '@/hooks/useUpload';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  type: UploadType;
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete?: (files: UploadFile[]) => void;
  onFileSelect?: (files: File[]) => void;
  className?: string;
  accept?: string;
  disabled?: boolean;
}

export function FileUpload({
  type,
  multiple = false,
  maxFiles = 1,
  onUploadComplete,
  onFileSelect,
  className = '',
  accept,
  disabled = false,
}: FileUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const {
    files,
    isUploading,
    config,
    error,
    uploadFile,
    uploadMultipleFiles,
    removeFile,
    clearFiles,
    getUploadConfig,
  } = useUpload();

  useEffect(() => {
    getUploadConfig(type);
  }, [type, getUploadConfig]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [disabled]);

  const handleFiles = (files: File[]) => {
    if (!config) return;

    // Validate file count
    if (files.length > maxFiles) {
      alert(t('upload.errors.maxFiles', { max: maxFiles }));
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(file => !config.allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert(t('upload.errors.invalidType', { types: config.allowedTypes.join(', ') }));
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > config.maxSize);
    if (oversizedFiles.length > 0) {
      alert(t('upload.errors.fileTooLarge', { maxSize: config.maxSizeMB }));
      return;
    }

    setSelectedFiles(files);
    onFileSelect?.(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      if (multiple) {
        const results = await uploadMultipleFiles(selectedFiles, type);
        onUploadComplete?.(results);
      } else {
        const result = await uploadFile(selectedFiles[0], type);
        if (result) {
          onUploadComplete?.([result]);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleRemoveSelected = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleRemoveUploaded = (id: string) => {
    removeFile(id);
  };

  const getStatusIcon = (file: UploadFile) => {
    switch (file.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const getAcceptString = () => {
    if (accept) return accept;
    if (config) return config.allowedTypes.join(',');
    return '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={getAcceptString()}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {dragActive
              ? t('upload.dropFiles')
              : t('upload.clickOrDrag')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {config && (
              <>
                {t('upload.maxSize', { size: config.maxSizeMB })} • {' '}
                {t('upload.allowedTypes', { types: config.allowedTypes.join(', ') })}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('upload.selectedFiles')}
          </h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSelected(index)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="w-full"
          >
            {isUploading ? t('upload.uploading') : t('upload.uploadFiles')}
          </Button>
        </div>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('upload.uploadedFiles')}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFiles}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('upload.clearAll')}
            </Button>
          </div>
          
          {files.map((file) => (
            <div
              key={file.id}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(file)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUploaded(file.id)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {file.status === 'uploading' && (
                <Progress value={file.progress} className="h-2" />
              )}
              
              {file.status === 'error' && file.error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {file.error}
                </p>
              )}
              
              {file.status === 'success' && file.result && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {t('upload.uploadSuccess')} - {file.result.filename}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
