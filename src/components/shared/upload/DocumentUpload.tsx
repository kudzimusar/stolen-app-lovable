import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Upload, 
  X, 
  File, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Scan,
  Download
} from 'lucide-react';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  ocrData?: {
    text: string;
    confidence: number;
    extractedFields?: Record<string, any>;
  };
  metadata?: {
    pageCount?: number;
    timestamp?: Date;
    scanned?: boolean;
  };
}

export interface DocumentUploadProps {
  onUpload: (documents: UploadedDocument[]) => void;
  maxSize?: number; // in MB
  multiple?: boolean;
  variant?: 'receipt' | 'invoice' | 'contract' | 'identity' | 'general';
  enableOCR?: boolean;
  autoExtract?: boolean;
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  maxSize = 5,
  multiple = false,
  variant = 'general',
  enableOCR = true,
  autoExtract = true,
  className = ''
}) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingOCR, setProcessingOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getVariantConfig = () => {
    switch (variant) {
      case 'receipt':
        return {
          title: 'Police Report Upload',
          description: 'Upload official police report (PDF, DOC, or image)',
          icon: <FileText className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,application/pdf,.pdf,.doc,.docx,.txt',
          maxFiles: multiple ? 3 : 1,
          ocrFields: ['case_number', 'date', 'station', 'officer']
        };
      case 'invoice':
        return {
          title: 'Invoice Upload',
          description: 'Upload invoices and billing documents',
          icon: <FileText className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,application/pdf,.doc,.docx',
          maxFiles: multiple ? 5 : 1,
          ocrFields: ['invoice_number', 'amount', 'due_date', 'vendor']
        };
      case 'contract':
        return {
          title: 'Contract Upload',
          description: 'Upload legal contracts and agreements',
          icon: <File className="w-12 h-12 text-primary mx-auto" />,
          accept: 'application/pdf,.doc,.docx',
          maxFiles: multiple ? 3 : 1,
          ocrFields: ['contract_number', 'parties', 'date', 'terms']
        };
      case 'identity':
        return {
          title: 'Identity Document Upload',
          description: 'Upload identity documents for verification',
          icon: <File className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,application/pdf',
          maxFiles: 1,
          ocrFields: ['id_number', 'name', 'date_of_birth', 'address']
        };
      case 'general':
      default:
        return {
          title: 'Additional Documents',
          description: 'Upload receipts, warranty, or proof of ownership (PDF, DOC, images)',
          icon: <Upload className="w-12 h-12 text-primary mx-auto" />,
          accept: 'image/*,application/pdf,.pdf,.doc,.docx,.txt,.rtf',
          maxFiles: multiple ? 10 : 1,
          ocrFields: []
        };
    }
  };

  const config = getVariantConfig();

  const processOCR = async (file: File): Promise<UploadedDocument['ocrData']> => {
    if (!enableOCR) return undefined;

    try {
      // Simulate OCR processing
      setProcessingOCR(true);
      
      // In a real implementation, this would call an OCR service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockOCRData = {
        text: `Extracted text from ${file.name}`,
        confidence: 0.85,
        extractedFields: config.ocrFields.reduce((acc, field) => {
          acc[field] = `Sample ${field} value`;
          return acc;
        }, {} as Record<string, any>)
      };

      return mockOCRData;
    } catch (error) {
      console.error('OCR processing failed:', error);
      return undefined;
    } finally {
      setProcessingOCR(false);
    }
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newDocuments: UploadedDocument[] = [];
    
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
      if (documents.length + newDocuments.length >= config.maxFiles) {
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
        const filePath = `lost-found/documents/${fileName}`;

        console.log('📤 Uploading document to Supabase Storage:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lost-found-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Document upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('lost-found-photos')
          .getPublicUrl(filePath);

        console.log('✅ Document uploaded to Supabase Storage, public URL:', publicUrl);

        const document: UploadedDocument = {
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl, // Use Supabase public URL
          metadata: {
            timestamp: new Date(),
            scanned: file.type.startsWith('image/')
          }
        };

        // Process OCR if enabled
        if (enableOCR && autoExtract) {
          document.ocrData = {
            text: `Extracted text from ${file.name}`,
            confidence: 0.85,
            extractedFields: {}
          };
        }

        newDocuments.push(document);

        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (error) {
        console.error('Error uploading document:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }

    if (newDocuments.length > 0) {
      const updatedDocuments = multiple ? [...documents, ...newDocuments] : newDocuments;
      setDocuments(updatedDocuments);
      onUpload(updatedDocuments);
      
      toast({
        title: "Upload successful",
        description: `${newDocuments.length} document(s) uploaded successfully`
      });
    }

    setUploading(false);
    setUploadProgress(0);
  }, [documents, maxSize, multiple, config.maxFiles, enableOCR, autoExtract, onUpload, toast]);

  const removeDocument = useCallback((documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocuments);
    onUpload(updatedDocuments);
  }, [documents, onUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    } else if (fileType.startsWith('image/')) {
      return <Scan className="w-4 h-4 text-green-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
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
          {uploading || processingOCR ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full h-2 bg-primary/10" />
              <p className="text-xs text-muted-foreground text-center font-medium">
                {processingOCR ? 'Processing...' : `Uploading... ${uploadProgress}%`}
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-2">
                <FileText className="w-8 h-8 text-primary/60 mx-auto mb-1" />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || processingOCR}
                  className="flex-1 h-10 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                >
                  <Upload className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Choose</span>
                </Button>
                
                {variant === 'receipt' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || processingOCR}
                    className="flex-1 h-10 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                  >
                    <Scan className="w-4 h-4 mr-1.5" />
                    <span className="text-sm font-medium">Scan</span>
                  </Button>
                )}
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
      
      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Documents ({documents.length})</h4>
          <div className="space-y-2">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(document.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{document.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(document.size)}</span>
                      {document.metadata?.scanned && (
                        <Badge variant="secondary" className="text-xs">
                          Scanned
                        </Badge>
                      )}
                      {document.ocrData && (
                        <Badge variant="outline" className="text-xs">
                          OCR: {Math.round(document.ocrData.confidence * 100)}%
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {document.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                    {document.ocrData && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <p className="truncate">{document.ocrData.text.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(document.id)}
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
