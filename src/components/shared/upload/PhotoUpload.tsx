import React from 'react';
import { AdvancedUploadSystem, UploadedFile } from './AdvancedUploadSystem';

export interface PhotoUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  maxSize?: number; // in MB
  multiple?: boolean;
  variant?: 'device-photo' | 'receipt' | 'document' | 'evidence';
  autoOptimize?: boolean;
  enableLocation?: boolean;
  enableOCR?: boolean;
  enableCompression?: boolean;
  enableDragDrop?: boolean;
  enableCamera?: boolean;
  className?: string;
  userId?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
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
  className = '',
  userId = 'anonymous'
}) => {
  return (
    <AdvancedUploadSystem
      onUpload={onUpload}
      maxSize={maxSize}
      multiple={multiple}
      variant={variant}
      autoOptimize={autoOptimize}
      enableLocation={enableLocation}
      enableOCR={enableOCR}
      enableCompression={enableCompression}
      enableDragDrop={enableDragDrop}
      enableCamera={enableCamera}
      className={className}
      userId={userId}
    />
  );
};