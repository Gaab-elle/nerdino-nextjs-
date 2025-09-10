import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface UploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  error?: string;
  size?: number;
  mimetype?: string;
}

export interface UploadConfig {
  maxSize: number; // in bytes
  allowedTypes: readonly string[];
  destination: string;
}

export const UPLOAD_CONFIGS = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    destination: 'uploads/avatars',
  },
  project: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    destination: 'uploads/projects',
  },
  post: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    destination: 'uploads/posts',
  },
  document: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ],
    destination: 'uploads/documents',
  },
  cv: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    destination: 'uploads/cvs',
  },
} as const;

export type UploadType = keyof typeof UPLOAD_CONFIGS;

export class UploadService {
  private static async ensureDirectoryExists(path: string): Promise<void> {
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true });
    }
  }

  private static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  private static validateFile(
    file: File,
    config: UploadConfig
  ): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${config.maxSize / (1024 * 1024)}MB`,
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  static async uploadFile(
    file: File,
    type: UploadType,
    userId?: string
  ): Promise<UploadResult> {
    try {
      const config = UPLOAD_CONFIGS[type];
      
      // Validate file
      const validation = this.validateFile(file, config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique filename
      const filename = this.generateUniqueFilename(file.name);
      
      // Create destination path
      const destinationPath = join(process.cwd(), 'public', config.destination);
      await this.ensureDirectoryExists(destinationPath);

      // Add user folder if userId is provided
      const finalPath = userId 
        ? join(destinationPath, userId)
        : destinationPath;
      
      if (userId) {
        await this.ensureDirectoryExists(finalPath);
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write file
      const filePath = join(finalPath, filename);
      await writeFile(filePath, buffer);

      // Generate URL
      const url = userId 
        ? `/${config.destination}/${userId}/${filename}`
        : `/${config.destination}/${filename}`;

      return {
        success: true,
        filename,
        url,
        size: file.size,
        mimetype: file.type,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    type: UploadType,
    userId?: string
  ): Promise<UploadResult[]> {
    const results = await Promise.all(
      files.map(file => this.uploadFile(file, type, userId))
    );
    return results;
  }

  static getFileUrl(filename: string, type: UploadType, userId?: string): string {
    const config = UPLOAD_CONFIGS[type];
    return userId 
      ? `/${config.destination}/${userId}/${filename}`
      : `/${config.destination}/${filename}`;
  }

  static async deleteFile(
    filename: string,
    type: UploadType,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const config = UPLOAD_CONFIGS[type];
      const filePath = join(
        process.cwd(),
        'public',
        config.destination,
        userId || '',
        filename
      );

      if (existsSync(filePath)) {
        await import('fs/promises').then(fs => fs.unlink(filePath));
        return { success: true };
      } else {
        return { success: false, error: 'File not found' };
      }
    } catch (error) {
      console.error('Delete file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }
}
