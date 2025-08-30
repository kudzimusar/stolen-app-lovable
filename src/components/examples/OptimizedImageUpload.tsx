import React, { useState, useCallback } from 'react';
import { useImageOptimization, useBackgroundJobs } from '@/hooks/usePerformanceOptimization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';

interface UploadedImage {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
}

export const OptimizedImageUpload: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Use image optimization hooks
  const { uploadImage, generateResponsiveUrls } = useImageOptimization();
  const { addNotification } = useBackgroundJobs();

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Create temporary image object
      const tempImage: UploadedImage = {
        id: `temp_${Date.now()}_${i}`,
        url: URL.createObjectURL(file),
        publicId: '',
        width: 0,
        height: 0,
        format: file.type.split('/')[1] || 'unknown',
        size: file.size,
        status: 'uploading',
        progress: 0
      };

      newImages.push(tempImage);
      setUploadedImages(prev => [...prev, tempImage]);

      try {
        // Upload and optimize image
        const result = await uploadImage(file, {
          width: 800,
          height: 600,
          quality: 85,
          format: 'webp',
          crop: 'fill'
        });

        // Update image with results
        setUploadedImages(prev => prev.map(img => 
          img.id === tempImage.id 
            ? {
                ...img,
                url: result.url,
                publicId: result.publicId,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.size,
                status: 'completed',
                progress: 100
              }
            : img
        ));

        // Add background notification
        await addNotification({
          userId: 'current-user',
          type: 'image_uploaded',
          message: `Image "${file.name}" uploaded successfully`,
          metadata: { imageId: result.publicId }
        });

      } catch (error) {
        console.error('Upload failed:', error);
        
        // Update image with error status
        setUploadedImages(prev => prev.map(img => 
          img.id === tempImage.id 
            ? { ...img, status: 'error', progress: 0 }
            : img
        ));

        // Add error notification
        await addNotification({
          userId: 'current-user',
          type: 'image_upload_failed',
          message: `Failed to upload "${file.name}"`,
          metadata: { error: error.message }
        });
      }
    }
  }, [uploadImage, addNotification]);

  // Handle drag and drop
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  // Remove image
  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Get responsive URLs
  const getResponsiveUrls = (publicId: string) => {
    return generateResponsiveUrls(publicId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Optimized Image Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JPG, PNG, GIF. Images will be optimized automatically.
            </p>
            <Button asChild>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                Choose Files
              </label>
            </Button>
          </div>

          {/* Upload Progress */}
          {uploadedImages.some(img => img.status === 'uploading') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Uploading Images...</CardTitle>
              </CardHeader>
              <CardContent>
                {uploadedImages
                  .filter(img => img.status === 'uploading')
                  .map(img => (
                    <div key={img.id} className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">{img.url}</span>
                        <span className="text-sm text-muted-foreground">
                          {img.progress}%
                        </span>
                      </div>
                      <Progress value={img.progress} className="h-2" />
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Uploaded Images ({uploadedImages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {uploadedImages.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted relative">
                        <img
                          src={image.url}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={
                              image.status === 'completed' ? 'default' :
                              image.status === 'error' ? 'destructive' :
                              'secondary'
                            }
                            className="flex items-center gap-1"
                          >
                            {image.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                            {image.status === 'error' && <AlertCircle className="h-3 w-3" />}
                            {image.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin" />}
                            {image.status}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 left-2"
                          onClick={() => removeImage(image.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span>{(image.size / 1024).toFixed(1)} KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Format:</span>
                            <span>{image.format.toUpperCase()}</span>
                          </div>
                          {image.width > 0 && (
                            <div className="flex justify-between">
                              <span>Dimensions:</span>
                              <span>{image.width} × {image.height}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsive URLs (for completed images) */}
          {uploadedImages.some(img => img.status === 'completed' && img.publicId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Responsive URLs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uploadedImages
                    .filter(img => img.status === 'completed' && img.publicId)
                    .map(image => {
                      const responsiveUrls = getResponsiveUrls(image.publicId);
                      return (
                        <div key={image.id} className="space-y-2">
                          <h4 className="font-medium text-sm">{image.publicId}</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <strong>Thumbnail:</strong>
                              <div className="truncate text-muted-foreground">
                                {responsiveUrls.thumbnail}
                              </div>
                            </div>
                            <div>
                              <strong>Small:</strong>
                              <div className="truncate text-muted-foreground">
                                {responsiveUrls.small}
                              </div>
                            </div>
                            <div>
                              <strong>Medium:</strong>
                              <div className="truncate text-muted-foreground">
                                {responsiveUrls.medium}
                              </div>
                            </div>
                            <div>
                              <strong>Large:</strong>
                              <div className="truncate text-muted-foreground">
                                {responsiveUrls.large}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedImageUpload;
