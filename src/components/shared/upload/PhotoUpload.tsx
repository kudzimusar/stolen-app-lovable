import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  preview?: string;
  metadata?: {
    width?: number;
    height?: number;
    timestamp?: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface PhotoUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  maxSize?: number; // in MB
  multiple?: boolean;
  variant?: 'device-photo' | 'receipt' | 'document' | 'evidence';
  autoOptimize?: boolean;
  enableLocation?: boolean;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onUpload,
  maxSize = 10,
  multiple = false,
  variant = 'device-photo',
  autoOptimize = true,
  enableLocation = false,
  className = ''
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getVariantConfig = () => {
    switch (variant) {
      case 'device-photo':
        return {
          title: 'Device Photos',
          description: 'Upload clear photos of your device from multiple angles',
          icon: <Camera className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*',
          maxFiles: multiple ? 5 : 1
        };
      case 'receipt':
        return {
          title: 'Receipt Upload',
          description: 'Upload purchase receipt or proof of ownership',
          icon: <ImageIcon className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,application/pdf',
          maxFiles: 1
        };
      case 'document':
        return {
          title: 'Document Upload',
          description: 'Upload supporting documents',
          icon: <Upload className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,application/pdf,.doc,.docx',
          maxFiles: multiple ? 3 : 1
        };
      case 'evidence':
        return {
          title: 'Evidence Photos',
          description: 'Upload photos as evidence for your report',
          icon: <Camera className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*',
          maxFiles: multiple ? 10 : 1
        };
      default:
        return {
          title: 'Photo Upload',
          description: 'Upload photos',
          icon: <Camera className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*',
          maxFiles: multiple ? 5 : 1
        };
    }
  };

  const config = getVariantConfig();

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSize}MB limit`,
          variant: "destructive"
        });
        continue;
      }

      // Check file count
      if (files.length + newFiles.length >= config.maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${config.maxFiles} files allowed`,
          variant: "destructive"
        });
        break;
      }

      try {
        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const filePath = `lost-found/photos/${fileName}`;

        console.log('📤 Uploading to Supabase Storage:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lost-found-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('lost-found-photos')
          .getPublicUrl(filePath);

        console.log('✅ File uploaded to Supabase Storage, public URL:', publicUrl);

        // Get image metadata
        let metadata: UploadedFile['metadata'] = {
          timestamp: new Date()
        };

        if (file.type.startsWith('image/')) {
          try {
            const img = new Image();
            await new Promise((resolve) => {
              img.onload = () => {
                metadata.width = img.naturalWidth;
                metadata.height = img.naturalHeight;
                resolve(null);
              };
              img.src = publicUrl;
            });
          } catch (error) {
            console.warn('Could not get image metadata:', error);
          }
        }

        newFiles.push({
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl, // Use Supabase public URL
          metadata
        });

        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      onUpload(updatedFiles);
      
      toast({
        title: "Upload successful",
        description: `${newFiles.length} file(s) uploaded successfully`
      });
    }

    setUploading(false);
    setUploadProgress(0);
  }, [files, maxSize, multiple, config.maxFiles, onUpload, toast]);

  const openCamera = useCallback(async () => {
    setCapturing(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      // Create video element for camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Create canvas for capture
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Capture photo
        context?.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `camera_photo_${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });
            
            // Stop camera stream
            stream.getTracks().forEach(track => track.stop());
            
            // Process the captured file
            await handleFileSelect(new DataTransfer().files);
          }
        }, 'image/jpeg', 0.9);
      });
      
    } catch (error) {
      console.error('Camera access failed:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to take photos",
        variant: "destructive"
      });
    } finally {
      setCapturing(false);
    }
  }, [handleFileSelect, toast]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onUpload(updatedFiles);
  }, [files, onUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <div className="relative p-4 border-2 border-dashed border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all">
        <div className="space-y-3">
          {uploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full h-2 bg-primary/10" />
              <p className="text-xs text-muted-foreground text-center font-medium">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-2">
                <Camera className="w-8 h-8 text-primary/60 mx-auto mb-1" />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={capturing}
                  className="flex-1 h-10 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                >
                  <Upload className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Choose</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openCamera}
                  disabled={capturing}
                  className="flex-1 h-10 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                >
                  {capturing ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-1.5" />
                  )}
                  <span className="text-sm font-medium">{capturing ? 'Capturing...' : 'Camera'}</span>
                </Button>
              </div>
            </>
          )}
          
          <div className="flex justify-center gap-2 text-xs text-muted-foreground/80 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              Max {maxSize}MB
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              Up to {config.maxFiles} files
            </span>
          </div>
        </div>
      </div>
      
      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.metadata?.width && file.metadata?.height && (
                        <span>{file.metadata.width}×{file.metadata.height}</span>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {file.type.split('/')[1]?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
