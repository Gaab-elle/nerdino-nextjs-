'use client';

import { useState, useRef } from 'react';
import { FileText, Upload, X, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUpload, UploadFile } from '@/hooks/useUpload';
import { useTranslation } from 'react-i18next';

interface CVUploadProps {
  currentCV?: string;
  onUploadComplete?: (file: UploadFile) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export function CVUpload({
  currentCV,
  onUploadComplete,
  onUploadError,
  className = '',
  disabled = false,
}: CVUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isUploading,
    error,
    uploadFile,
    removeFile,
    clearFiles,
  } = useUpload();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.(t('upload.errors.invalidCVType'));
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError?.(t('upload.errors.cvTooLarge'));
      return;
    }

    // Upload file
    try {
      const result = await uploadFile(file, 'cv');
      if (result && result.status === 'success') {
        onUploadComplete?.(result);
      } else if (result && result.status === 'error') {
        onUploadError?.(result.error || t('upload.errors.uploadFailed'));
      }
    } catch (err) {
      onUploadError?.(err instanceof Error ? err.message : t('upload.errors.uploadFailed'));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    clearFiles();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (mimetype: string) => {
    switch (mimetype) {
      case 'application/pdf':
        return 'PDF';
      case 'application/msword':
        return 'DOC';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'DOCX';
      default:
        return 'Document';
    }
  };

  const getUploadStatus = () => {
    if (files.length === 0) return null;
    const file = files[0];
    
    switch (file.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const currentFile = files.length > 0 ? files[0] : null;
  const displayFile = currentFile?.result || (currentCV ? { url: currentCV, filename: 'current-cv.pdf' } : null);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current CV Display */}
      {displayFile && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {displayFile.filename || 'CV.pdf'}
                </p>
                {currentFile?.result && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getFileType(currentFile.result.mimetype)} • {formatFileSize(currentFile.result.size)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getUploadStatus()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(displayFile.url, '_blank')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = displayFile.url;
                  link.download = displayFile.filename || 'cv.pdf';
                  link.click();
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {isUploading ? t('upload.uploading') : t('upload.selectCV')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('upload.cvInfo')}
          </p>
        </div>
        
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {t('upload.selectFile')}
        </Button>
      </div>

      {/* Upload Progress */}
      {currentFile && currentFile.status === 'uploading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('upload.uploading')} {currentFile.file.name}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {currentFile.progress}%
            </span>
          </div>
          <Progress value={currentFile.progress} className="h-2" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* File Error */}
      {currentFile && currentFile.status === 'error' && currentFile.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {currentFile.error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {currentFile && currentFile.status === 'success' && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">
            {t('upload.cvUploadSuccess')}
          </p>
        </div>
      )}

      {/* Remove Button */}
      {displayFile && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={disabled || isUploading}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          {t('upload.removeCV')}
        </Button>
      )}
    </div>
  );
}
