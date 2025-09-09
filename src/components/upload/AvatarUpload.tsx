'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpload, UploadFile } from '@/hooks/useUpload';
import { useTranslation } from 'react-i18next';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadComplete?: (file: UploadFile) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarUpload({
  currentAvatar,
  onUploadComplete,
  onUploadError,
  className = '',
  disabled = false,
  size = 'lg',
}: AvatarUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    files,
    isUploading,
    error,
    uploadFile,
    removeFile,
    clearFiles,
  } = useUpload();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40',
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.(t('upload.errors.invalidImageType'));
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError?.(t('upload.errors.imageTooLarge'));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      const result = await uploadFile(file, 'avatar');
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
    setPreview(null);
    clearFiles();
  };

  const getDisplayImage = () => {
    if (preview) return preview;
    if (files.length > 0 && files[0].result?.url) return files[0].result.url;
    return currentAvatar;
  };

  const getUploadStatus = () => {
    if (files.length === 0) return null;
    const file = files[0];
    
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

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Avatar Display */}
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={getDisplayImage() || undefined} alt="Avatar" />
          <AvatarFallback>
            <Camera className="h-8 w-8 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        
        {/* Upload Status */}
        {getUploadStatus() && (
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
            {getUploadStatus()}
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col items-center space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? t('upload.uploading') : t('upload.selectImage')}
          </Button>
          
          {(preview || files.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              {t('upload.remove')}
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}

        {/* Upload Info */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
          {t('upload.avatarInfo')}
        </p>
      </div>
    </div>
  );
}
