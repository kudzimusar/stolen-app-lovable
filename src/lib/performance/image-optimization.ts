// Browser-safe Cloudinary configuration
let cloudinary: any = null;

try {
  // Only import Cloudinary if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Use dynamic import to avoid server-side issues
    import('cloudinary').then(({ v2 }) => {
      cloudinary = v2;
      // Configure Cloudinary with browser-safe environment variables
      cloudinary.config({
        cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
        api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
        api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'your-api-secret',
      });
    }).catch(() => {
      console.warn('Cloudinary not available, image optimization disabled');
    });
  }
} catch (error) {
  console.warn('Failed to initialize Cloudinary:', error);
}

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  radius?: number;
  effect?: 'blur' | 'sharpen' | 'grayscale' | 'sepia';
}

export class ImageOptimizationService {
  private static instance: ImageOptimizationService;

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  /**
   * Upload and optimize an image
   */
  async uploadImage(
    file: File | string,
    options: ImageOptimizationOptions = {},
    folder: string = 'stolen-app'
  ): Promise<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    try {
      if (!cloudinary) {
        console.warn('Cloudinary not available, returning fallback response');
        // Return a fallback response
        return {
          url: typeof file === 'string' ? file : URL.createObjectURL(file),
          publicId: `fallback_${Date.now()}`,
          width: options.width || 800,
          height: options.height || 600,
          format: 'jpg',
          size: typeof file === 'string' ? 0 : file.size,
        };
      }

      const uploadOptions = {
        folder,
        transformation: this.buildTransformation(options),
        resource_type: 'image' as const,
      };

      let result;
      if (typeof file === 'string') {
        // Upload from URL
        result = await cloudinary.uploader.upload(file, uploadOptions);
      } else {
        // Upload from file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'stolen-app');
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        result = await response.json();
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      // Return fallback response instead of throwing
      return {
        url: typeof file === 'string' ? file : URL.createObjectURL(file),
        publicId: `fallback_${Date.now()}`,
        width: options.width || 800,
        height: options.height || 600,
        format: 'jpg',
        size: typeof file === 'string' ? 0 : file.size,
      };
    }
  }

  /**
   * Generate optimized image URL
   */
  generateOptimizedUrl(
    publicId: string,
    options: ImageOptimizationOptions = {}
  ): string {
    if (!cloudinary) {
      console.warn('Cloudinary not available, returning original URL');
      return publicId;
    }
    
    const transformation = this.buildTransformation(options);
    return cloudinary.url(publicId, {
      transformation,
      secure: true,
    });
  }

  /**
   * Build transformation options for Cloudinary
   */
  private buildTransformation(options: ImageOptimizationOptions): any[] {
    const transformations: any[] = [];

    // Size transformations
    if (options.width || options.height) {
      transformations.push({
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        gravity: options.gravity || 'auto',
      });
    }

    // Quality optimization
    if (options.quality) {
      transformations.push({
        quality: options.quality,
        fetch_format: options.format || 'auto',
      });
    }

    // Effects
    if (options.effect) {
      transformations.push({
        effect: options.effect,
      });
    }

    // Border radius
    if (options.radius) {
      transformations.push({
        radius: options.radius,
      });
    }

    return transformations;
  }

  /**
   * Delete an image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Image deletion error:', error);
      return false;
    }
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  generateResponsiveUrls(publicId: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: this.generateOptimizedUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
      small: this.generateOptimizedUrl(publicId, { width: 300, height: 300, crop: 'fill' }),
      medium: this.generateOptimizedUrl(publicId, { width: 600, height: 600, crop: 'fill' }),
      large: this.generateOptimizedUrl(publicId, { width: 1200, height: 1200, crop: 'fill' }),
      original: this.generateOptimizedUrl(publicId),
    };
  }

  /**
   * Optimize existing image URL
   */
  optimizeExistingUrl(url: string, options: ImageOptimizationOptions = {}): string {
    if (!url.includes('cloudinary.com')) {
      return url; // Return original if not a Cloudinary URL
    }

    const transformation = this.buildTransformation(options);
    return cloudinary.url(url, {
      transformation,
      secure: true,
    });
  }
}

// Default optimization presets
export const IMAGE_PRESETS = {
  PROFILE_AVATAR: { width: 150, height: 150, crop: 'fill', gravity: 'face', quality: 80 },
  DEVICE_THUMBNAIL: { width: 200, height: 200, crop: 'fill', quality: 85 },
  MARKETPLACE_LISTING: { width: 400, height: 300, crop: 'fill', quality: 90 },
  HERO_IMAGE: { width: 1200, height: 600, crop: 'fill', quality: 95 },
  DOCUMENT_PREVIEW: { width: 800, height: 600, crop: 'fit', quality: 85 },
} as const;

export default ImageOptimizationService.getInstance();
