import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { photoUploadService } from '@/lib/photo-upload';
import { 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Scan,
  Download,
  Eye,
  Trash2,
  RotateCcw,
  Crop,
  Zap,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path?: string;
  preview?: string;
  metadata?: {
    width?: number;
    height?: number;
    timestamp?: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
    deviceInfo?: {
      make?: string;
      model?: string;
      orientation?: string;
    };
    ocrData?: {
      text: string;
      confidence: number;
      extractedFields?: Record<string, any>;
    };
    compression?: {
      originalSize: number;
      compressedSize: number;
      quality: number;
    };
  };
  processing?: {
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    stage?: string;
  };
}

export interface AdvancedUploadSystemProps {
  onUpload: (files: UploadedFile[]) => void;
  maxSize?: number; // in MB
  multiple?: boolean;
  variant?: 'device-photo' | 'receipt' | 'document' | 'evidence' | 'general';
  autoOptimize?: boolean;
  enableLocation?: boolean;
  enableOCR?: boolean;
  enableCompression?: boolean;
  enableDragDrop?: boolean;
  enableCamera?: boolean;
  enableScanning?: boolean;
  className?: string;
  userId?: string;
}

export const AdvancedUploadSystem: React.FC<AdvancedUploadSystemProps> = ({
  onUpload,
  maxSize = 10,
  multiple = false,
  variant = 'device-photo',
  autoOptimize = true,
  enableLocation = false,
  enableOCR = false,
  enableCompression = true,
  enableDragDrop = true,
  enableCamera = true,
  enableScanning = false,
  className = '',
  userId = 'anonymous'
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState<Record<string, UploadedFile['processing']>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const getVariantConfig = () => {
    switch (variant) {
      case 'device-photo':
        return {
          title: 'Device Photos',
          description: 'Upload clear photos of your device from multiple angles',
          icon: <Camera className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*',
          maxFiles: multiple ? 10 : 1,
          bucket: 'lost-found-photos',
          folder: 'device-photos'
        };
      case 'receipt':
        return {
          title: 'Receipt Upload',
          description: 'Upload purchase receipt or proof of ownership',
          icon: <FileText className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,application/pdf',
          maxFiles: 5,
          bucket: 'lost-found-photos',
          folder: 'receipts'
        };
      case 'document':
        return {
          title: 'Document Upload',
          description: 'Upload supporting documents',
          icon: <Upload className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,application/pdf,.doc,.docx',
          maxFiles: multiple ? 5 : 1,
          bucket: 'lost-found-photos',
          folder: 'documents'
        };
      case 'evidence':
        return {
          title: 'Evidence Photos',
          description: 'Upload photos as evidence for your report',
          icon: <Camera className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,video/mp4',
          maxFiles: multiple ? 15 : 1,
          bucket: 'lost-found-photos',
          folder: 'evidence'
        };
      default:
        return {
          title: 'File Upload',
          description: 'Upload your files',
          icon: <Upload className="w-12 h-12 text-primary mx-auto" />,
          accept: '*/*',
          maxFiles: multiple ? 5 : 1,
          bucket: 'lost-found-photos',
          folder: 'general'
        };
    }
  };

  const config = getVariantConfig();

  // Enhanced file processing with metadata extraction
  const processFile = async (file: File): Promise<UploadedFile> => {
    const fileId = Date.now().toString() + Math.random().toString(36).substring(7);
    
    // Set processing status
    setProcessing(prev => ({
      ...prev,
      [fileId]: { status: 'processing', progress: 0, stage: 'Initializing...' }
    }));

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      // Get basic metadata
      let metadata: UploadedFile['metadata'] = {
        timestamp: new Date(),
        compression: {
          originalSize: file.size,
          compressedSize: file.size,
          quality: 1.0
        }
      };

      // Get image dimensions and device info
      if (file.type.startsWith('image/')) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              metadata.width = img.naturalWidth;
              metadata.height = img.naturalHeight;
              resolve(null);
            };
            img.onerror = reject;
            img.src = preview;
          });

          // Extract EXIF data if available
          metadata.deviceInfo = {
            orientation: img.width > img.height ? 'landscape' : 'portrait'
          };
        } catch (error) {
          console.warn('Could not extract image metadata:', error);
        }
      }

      // Get location if enabled
      if (enableLocation && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 60000
            });
          });
          
          metadata.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.warn('Could not get location:', error);
        }
      }

      // Compress image if enabled and needed
      let processedFile = file;
      if (enableCompression && file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
        setProcessing(prev => ({
          ...prev,
          [fileId]: { status: 'processing', progress: 30, stage: 'Compressing image...' }
        }));

        processedFile = await photoUploadService.compressImage(file, 1920, 0.8);
        metadata.compression!.compressedSize = processedFile.size;
        metadata.compression!.quality = 0.8;
      }

      // Upload to Supabase Storage
      setProcessing(prev => ({
        ...prev,
        [fileId]: { status: 'processing', progress: 60, stage: 'Uploading to cloud...' }
      }));

      const fileName = `${config.folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(config.bucket)
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(config.bucket)
        .getPublicUrl(fileName);

      // OCR processing if enabled
      if (enableOCR && file.type.startsWith('image/')) {
        setProcessing(prev => ({
          ...prev,
          [fileId]: { status: 'processing', progress: 80, stage: 'Extracting text...' }
        }));

        try {
          // Simulate OCR processing (replace with actual OCR service)
          await new Promise(resolve => setTimeout(resolve, 1000));
          metadata.ocrData = {
            text: 'Sample extracted text from image',
            confidence: 0.85,
            extractedFields: {
              type: 'receipt',
              amount: '$99.99',
              date: '2024-01-15'
            }
          };
        } catch (error) {
          console.warn('OCR processing failed:', error);
        }
      }

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: processedFile.size,
        type: file.type,
        url: publicUrl,
        path: fileName,
        preview,
        metadata
      };

      // Mark as completed
      setProcessing(prev => ({
        ...prev,
        [fileId]: { status: 'completed', progress: 100, stage: 'Completed' }
      }));

      return uploadedFile;

    } catch (error) {
      console.error('File processing error:', error);
      setProcessing(prev => ({
        ...prev,
        [fileId]: { status: 'error', progress: 0, stage: 'Failed' }
      }));
      throw error;
    }
  };

  // Enhanced file selection handler
  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Validate file size
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
        const processedFile = await processFile(file);
        newFiles.push(processedFile);
        
        // Update overall progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Upload failed",
          description: `Failed to process ${file.name}`,
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
    
    // Clean up processing status after delay
    setTimeout(() => {
      setProcessing({});
    }, 3000);
  }, [files, maxSize, multiple, config.maxFiles, onUpload, toast, enableLocation, enableOCR, enableCompression, userId, config.folder, config.bucket]);

  // Advanced camera functionality
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
      
      cameraStreamRef.current = stream;
      
      // Create camera modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4';
      
      const container = document.createElement('div');
      container.className = 'bg-white rounded-lg p-6 max-w-md w-full space-y-4';
      
      // Camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'w-full rounded-lg';
      video.style.height = '300px';
      video.style.objectFit = 'cover';
      
      // Controls
      const controls = document.createElement('div');
      controls.className = 'flex gap-3';
      
      const captureBtn = document.createElement('button');
      captureBtn.innerHTML = '<div class="w-12 h-12 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center"><div class="w-8 h-8 bg-red-500 rounded-full"></div></div>';
      captureBtn.className = 'flex-1 flex justify-center';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.className = 'px-4 py-2 bg-gray-500 text-white rounded-lg';
      
      controls.appendChild(captureBtn);
      controls.appendChild(closeBtn);
      container.appendChild(video);
      container.appendChild(controls);
      modal.appendChild(container);
      document.body.appendChild(modal);
      
      // Capture functionality
      captureBtn.onclick = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `camera_photo_${Date.now()}.jpg`, {
                type: 'image/jpeg'
              });
              
              // Process the captured file
              await handleFileSelect(new DataTransfer().files);
            }
          }, 'image/jpeg', 0.9);
          
          // Clean up
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        } catch (error) {
          console.error('Capture failed:', error);
          toast({
            title: "Capture failed",
            description: "Failed to capture photo",
            variant: "destructive"
          });
        }
      };
      
      closeBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
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

  // Drag and drop functionality
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (enableDragDrop) {
      setDragActive(true);
    }
  }, [enableDragDrop]);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (enableDragDrop && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [enableDragDrop, handleFileSelect]);

  // File removal
  const removeFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.path) {
      try {
        await supabase.storage
          .from(config.bucket)
          .remove([file.path]);
      } catch (error) {
        console.warn('Failed to delete file from storage:', error);
      }
    }
    
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onUpload(updatedFiles);
  }, [files, onUpload, config.bucket]);

  // Utility functions
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <Upload className="w-4 h-4" />;
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
      
      {/* Upload Area */}
      <div 
        className={`relative p-6 border-2 border-dashed rounded-xl transition-all ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-primary/20 hover:border-primary/40'
        } ${uploading ? 'pointer-events-none opacity-75' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          {uploading ? (
            <div className="space-y-3 text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
              <Progress value={uploadProgress} className="w-full h-2 bg-primary/10" />
              <p className="text-sm text-muted-foreground font-medium">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                {config.icon}
                <h3 className="text-lg font-semibold mt-2">{config.title}</h3>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={capturing || scanning}
                  className="flex-1 h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="font-medium">Choose Files</span>
                </Button>
                
                {enableCamera && variant.includes('photo') && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openCamera}
                    disabled={capturing || scanning}
                    className="flex-1 h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                  >
                    {capturing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    <span className="font-medium">{capturing ? 'Capturing...' : 'Camera'}</span>
                  </Button>
                )}
              </div>
              
              {/* Feature indicators */}
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary/40" />
                  Max {maxSize}MB
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary/40" />
                  Up to {config.maxFiles} files
                </span>
                {enableDragDrop && (
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                    Drag & drop
                  </span>
                )}
                {enableCompression && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Auto-optimize
                  </span>
                )}
                {enableLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </span>
                )}
                {enableOCR && (
                  <span className="flex items-center gap-1">
                    <Scan className="w-3 h-3" />
                    OCR
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            Uploaded Files ({files.length})
            <Badge variant="secondary" className="text-xs">
              {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
            </Badge>
          </h4>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="group flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.metadata?.width && file.metadata?.height && (
                        <span>{file.metadata.width}×{file.metadata.height}</span>
                      )}
                      {file.metadata?.timestamp && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(file.metadata.timestamp).toLocaleDateString()}
                        </span>
                      )}
                      {file.metadata?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Located
                        </span>
                      )}
                      {file.metadata?.ocrData && (
                        <span className="flex items-center gap-1">
                          <Scan className="w-3 h-3" />
                          OCR
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {file.type.split('/')[1]?.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {/* Processing status */}
                    {processing[file.id] && (
                      <div className="mt-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{processing[file.id].stage}</span>
                          {processing[file.id].status === 'processing' && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          {processing[file.id].status === 'completed' && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                          {processing[file.id].status === 'error' && (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <Progress value={processing[file.id].progress} className="w-full h-1 mt-1" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.preview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.preview, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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
