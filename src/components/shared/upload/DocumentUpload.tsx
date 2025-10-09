import React from 'react';
import { AdvancedUploadSystem, UploadedFile } from './AdvancedUploadSystem';

export interface DocumentUploadProps {
  onUpload: (documents: UploadedFile[]) => void;
  maxSize?: number; // in MB
  multiple?: boolean;
  variant?: 'receipt' | 'invoice' | 'contract' | 'identity' | 'general';
  enableOCR?: boolean;
  autoExtract?: boolean;
  className?: string;
  userId?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  maxSize = 5,
  multiple = false,
  variant = 'general',
  enableOCR = true,
  autoExtract = true,
  className = '',
  userId = 'anonymous'
}) => {
  // Map document variants to upload system variants
  const mapVariant = (docVariant: string): 'device-photo' | 'receipt' | 'document' | 'evidence' | 'general' => {
    switch (docVariant) {
      case 'receipt':
        return 'receipt';
      case 'invoice':
      case 'contract':
      case 'identity':
        return 'document';
      default:
        return 'general';
    }
  };

  return (
    <AdvancedUploadSystem
      onUpload={onUpload}
      maxSize={maxSize}
      multiple={multiple}
      variant={mapVariant(variant)}
      autoOptimize={true}
      enableLocation={false}
      enableOCR={enableOCR}
      enableCompression={true}
      enableDragDrop={true}
      enableCamera={false}
      className={className}
      userId={userId}
    />
  );
};