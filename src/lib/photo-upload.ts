import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export interface PhotoUploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class PhotoUploadService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly BUCKET_NAME = 'lost-found-photos';

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' };
    }

    return { valid: true };
  }

  // Compress image if needed
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Generate unique filename
  generateFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${userId}/${timestamp}_${random}.${extension}`;
  }

  // Upload single photo
  async uploadPhoto(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<PhotoUploadResult> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Compress image if it's too large
    let processedFile = file;
    if (file.size > 2 * 1024 * 1024) { // 2MB
      processedFile = await this.compressImage(file);
    }

    // Generate filename
    const fileName = this.generateFileName(processedFile.name, userId);
    const filePath = `${this.BUCKET_NAME}/${fileName}`;

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        size: processedFile.size,
        type: processedFile.type
      };
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  }

  // Upload multiple photos
  async uploadPhotos(
    files: File[],
    userId: string,
    onProgress?: (index: number, progress: UploadProgress) => void
  ): Promise<PhotoUploadResult[]> {
    const results: PhotoUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadPhoto(files[i], userId);
        results.push(result);
        
        if (onProgress) {
          onProgress(i, {
            loaded: 1,
            total: 1,
            percentage: 100
          });
        }
      } catch (error) {
        console.error(`Failed to upload photo ${i + 1}:`, error);
        // Continue with other photos
      }
    }

    return results;
  }

  // Delete photo
  async deletePhoto(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete photo error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete photo error:', error);
      return false;
    }
  }

  // Get photo URL
  getPhotoUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // Create photo preview
  createPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to create preview'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

// Create a singleton instance
export const photoUploadService = new PhotoUploadService();

// React hook for photo upload
export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoUploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (file: File, userId: string) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const result = await photoUploadService.uploadPhoto(file, userId, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadedPhotos(prev => [...prev, result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const uploadPhotos = async (files: File[], userId: string) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const results = await photoUploadService.uploadPhotos(files, userId, (index, progress) => {
        setUploadProgress(progress);
      });
      
      setUploadedPhotos(prev => [...prev, ...results]);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const deletePhoto = async (filePath: string) => {
    try {
      const success = await photoUploadService.deletePhoto(filePath);
      if (success) {
        setUploadedPhotos(prev => prev.filter(photo => photo.path !== filePath));
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      return false;
    }
  };

  const clearPhotos = () => {
    setUploadedPhotos([]);
    setError(null);
  };

  const createPreview = async (file: File) => {
    try {
      return await photoUploadService.createPreview(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Preview failed';
      setError(errorMessage);
      return null;
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadedPhotos,
    error,
    uploadPhoto,
    uploadPhotos,
    deletePhoto,
    clearPhotos,
    createPreview
  };
}
