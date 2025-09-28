import { supabase } from './auth';
import { useState } from 'react';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  size: number;
}

export class PhotoUploadService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly CLOUDINARY_CLOUD_NAME = 'stolen-app-dev';

  static async uploadPhoto(file: File, folder: string = 'lost-found'): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    // Compress image if needed
    const compressedFile = await this.compressImage(file);

    // Upload to Supabase Storage
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${compressedFile.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('lost-found-photos')
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lost-found-photos')
      .getPublicUrl(fileName);

    return {
      url: publicUrl,
      publicId: fileName,
      width: 0, // Will be updated after processing
      height: 0,
      size: compressedFile.size
    };
  }

  static async uploadMultiplePhotos(files: File[], folder: string = 'lost-found'): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadPhoto(file, folder));
    return Promise.all(uploadPromises);
  }

  static async deletePhoto(publicId: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('lost-found-photos')
        .remove([publicId]);

      if (error) {
        console.error('Delete failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  static validateFile(file: File): void {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }
  }

  static async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
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
              reject(new Error('Compression failed'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async createThumbnail(file: File, size: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = size;
      canvas.height = size;

      img.onload = () => {
        // Calculate crop dimensions for square thumbnail
        const minDimension = Math.min(img.width, img.height);
        const x = (img.width - minDimension) / 2;
        const y = (img.height - minDimension) / 2;

        ctx?.drawImage(img, x, y, minDimension, minDimension, 0, 0, size, size);
        
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailUrl);
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => reject(new Error('Thumbnail creation failed'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// React hook for photo upload

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadPhotos = async (files: File[], folder?: string): Promise<UploadResult[]> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const results = await PhotoUploadService.uploadMultiplePhotos(files, folder);
      setProgress(100);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const uploadPhoto = async (file: File, folder?: string): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await PhotoUploadService.uploadPhoto(file, folder);
      setProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    progress,
    error,
    uploadPhotos,
    uploadPhoto,
    clearError: () => setError(null)
  };
}
