import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, File, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface UploadComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onUpload?: (files: UploadedFile[]) => void;
  variant?: "receipt" | "photo" | "document";
}

export const UploadComponent = ({ 
  accept = "image/*", 
  multiple = false, 
  maxSize = 5,
  onUpload,
  variant = "document"
}: UploadComponentProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    
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

      // Create URL for preview
      const url = URL.createObjectURL(file);
      
      newFiles.push({
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        type: file.type,
        url
      });
    }

    if (newFiles.length > 0) {
      setUploading(true);
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      onUpload?.(updatedFiles);
      setUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload successful",
        description: `${newFiles.length} file(s) uploaded successfully`
      });
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onUpload?.(updatedFiles);
  };

  const handleCapturedFile = async (file: File) => {
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    };

    setUploading(true);
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(progress);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const updatedFiles = multiple ? [...files, newFile] : [newFile];
    setFiles(updatedFiles);
    onUpload?.(updatedFiles);
    setUploading(false);
    setUploadProgress(0);
    
    toast({
      title: "Photo captured",
      description: "Photo captured and uploaded successfully"
    });
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Create modal with camera preview
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4';
      
      const container = document.createElement('div');
      container.className = 'bg-white rounded-lg p-6 max-w-md w-full';
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'w-full rounded-lg mb-4';
      
      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture Photo';
      captureBtn.className = 'w-full bg-blue-600 text-white py-2 px-4 rounded-lg mb-2';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.className = 'w-full bg-gray-500 text-white py-2 px-4 rounded-lg';
      
      container.appendChild(video);
      container.appendChild(captureBtn);
      container.appendChild(closeBtn);
      modal.appendChild(container);
      document.body.appendChild(modal);
      
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a simple file object from blob
            const fileName = `camera-${Date.now()}.jpg`;
            const file = blob as File;
            // Add name property
            Object.defineProperty(file, 'name', { value: fileName });
            handleCapturedFile(file);
          }
        }, 'image/jpeg', 0.9);
        
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      closeBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      toast({
        title: "Camera opened",
        description: "Camera is now active - tap Capture Photo to take a picture"
      });
      
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera permissions to take photos",
        variant: "destructive"
      });
    }
  };

  const getVariantConfig = () => {
    switch (variant) {
      case "receipt":
        return {
          icon: <File className="w-8 h-8" />,
          title: "Upload Receipt",
          description: "Upload your purchase receipt or invoice"
        };
      case "photo":
        return {
          icon: <Camera className="w-8 h-8" />,
          title: "Device Photos",
          description: "Take or upload photos of your device"
        };
      default:
        return {
          icon: <Upload className="w-8 h-8" />,
          title: "Upload Files",
          description: "Upload your documents"
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <Card className="p-6 border-2 border-dashed border-muted-foreground/25">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">
            {config.icon}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">{config.title}</h3>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
          
          {uploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              
              {variant === "photo" && (
                <Button
                  variant="outline"
                  onClick={openCamera}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Max file size: {maxSize}MB
          </p>
        </div>
      </Card>
      
      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files</h4>
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-success" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(file.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};