# STOLEN Platform - Shared Components Implementation Guide

## 🎯 Overview

This guide provides comprehensive instructions for implementing and using the shared components library extracted from the STOLEN ecosystem. These components ensure consistency in styling, design, and technology stack across the entire application.

## 📁 Component Structure

```
src/components/shared/
├── README.md                    # Library overview
├── index.ts                     # Main exports
├── IMPLEMENTATION_GUIDE.md      # This guide
├── examples/
│   └── UsageExamples.tsx        # Complete usage examples
├── upload/
│   ├── PhotoUpload.tsx         # Photo upload component
│   └── DocumentUpload.tsx      # Document upload component
├── maps/
│   └── InteractiveMap.tsx      # Interactive map component
├── scanning/
│   └── QRScanner.tsx           # QR code scanner
├── ai/
│   └── FraudDetection.tsx      # AI fraud detection
└── blockchain/
    └── BlockchainVerification.tsx # Blockchain verification
```

## 🚀 Quick Start

### 1. Import Components

```tsx
// Import individual components
import { PhotoUpload, InteractiveMap, QRScanner } from '@/components/shared';

// Or import by category
import { UploadComponents, MapComponents } from '@/components/shared';
```

### 2. Basic Usage

```tsx
import React from 'react';
import { PhotoUpload, InteractiveMap } from '@/components/shared';

export const MyComponent = () => {
  const handlePhotoUpload = (files) => {
    console.log('Uploaded files:', files);
  };

  const handleLocationSelect = (location) => {
    console.log('Selected location:', location);
  };

  return (
    <div className="space-y-6">
      <PhotoUpload
        onUpload={handlePhotoUpload}
        variant="device-photo"
        maxSize={10}
        multiple={true}
      />
      
      <InteractiveMap
        center={[-26.2041, 28.0473]}
        onLocationSelect={handleLocationSelect}
        enableGPS={true}
      />
    </div>
  );
};
```

## 📸 Upload Components

### PhotoUpload Component

**Purpose**: Camera capture and photo upload with optimization

**Features**:
- Camera access and photo capture
- File upload with drag & drop
- Image optimization and compression
- Location metadata capture
- Multiple variants (device-photo, receipt, evidence)

**Usage**:
```tsx
<PhotoUpload
  onUpload={(files) => console.log('Uploaded:', files)}
  variant="device-photo"
  maxSize={10}
  multiple={true}
  autoOptimize={true}
  enableLocation={true}
/>
```

**Props**:
- `onUpload`: Callback when files are uploaded
- `variant`: 'device-photo' | 'receipt' | 'document' | 'evidence'
- `maxSize`: Maximum file size in MB (default: 10)
- `multiple`: Allow multiple files (default: false)
- `autoOptimize`: Enable image optimization (default: true)
- `enableLocation`: Capture location metadata (default: false)

### DocumentUpload Component

**Purpose**: Document scanning and upload with OCR

**Features**:
- Document upload with OCR processing
- Multiple file format support
- Automatic text extraction
- Structured data parsing
- Receipt and invoice processing

**Usage**:
```tsx
<DocumentUpload
  onUpload={(documents) => console.log('Documents:', documents)}
  variant="receipt"
  maxSize={5}
  enableOCR={true}
  autoExtract={true}
/>
```

## 🗺️ Map Components

### InteractiveMap Component

**Purpose**: Interactive maps with location services

**Features**:
- Google Maps integration with OpenStreetMap fallback
- Location search and geocoding
- GPS location tracking
- Custom markers and clustering
- Multiple map styles (default, dark, satellite)

**Usage**:
```tsx
<InteractiveMap
  center={[-26.2041, 28.0473]}
  zoom={10}
  markers={deviceMarkers}
  onLocationSelect={(location) => console.log('Location:', location)}
  enableSearch={true}
  enableGPS={true}
  height="400px"
/>
```

**Props**:
- `center`: Map center coordinates [lat, lng]
- `zoom`: Initial zoom level (default: 10)
- `markers`: Array of map markers
- `onLocationSelect`: Callback when location is selected
- `enableSearch`: Enable location search (default: true)
- `enableGPS`: Enable GPS location (default: true)
- `height`: Map height (default: '400px')

## 📱 Scanning Components

### QRScanner Component

**Purpose**: QR code scanning with camera and file upload

**Features**:
- Real-time camera scanning
- File upload for image scanning
- Multiple QR code format support
- Automatic result parsing
- Copy and external link actions

**Usage**:
```tsx
<QRScanner
  onScan={(result) => console.log('QR Code:', result)}
  enableCamera={true}
  enableFileUpload={true}
  autoStart={false}
/>
```

## 🤖 AI Components

### FraudDetection Component

**Purpose**: AI-powered fraud detection and risk assessment

**Features**:
- Multi-factor fraud analysis
- Risk scoring and confidence levels
- Real-time analysis capabilities
- Detailed factor breakdown
- Actionable recommendations

**Usage**:
```tsx
<FraudDetection
  deviceData={{
    serialNumber: 'DEVICE123',
    imei: '123456789012345',
    model: 'iPhone 13 Pro',
    price: 1200,
    location: { latitude: -26.2041, longitude: 28.0473 }
  }}
  onAnalysisComplete={(result) => console.log('Analysis:', result)}
  confidenceThreshold={0.8}
  enableRealTime={false}
/>
```

## 🔗 Blockchain Components

### BlockchainVerification Component

**Purpose**: Blockchain-based device verification

**Features**:
- Multi-network verification (Ethereum, Polygon, BSC)
- Transaction history analysis
- Ownership verification
- Gas usage tracking
- Network-specific validation

**Usage**:
```tsx
<BlockchainVerification
  deviceId="DEVICE123456"
  onVerificationComplete={(result) => console.log('Verified:', result)}
  networks={['ethereum', 'polygon']}
  enableMultiNetwork={true}
/>
```

## 🎨 Styling and Theming

### Consistent Design System

All components use the same design system:
- **Colors**: Primary, secondary, muted, destructive
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized padding and margins
- **Borders**: Consistent border radius and styles
- **Shadows**: Unified shadow system

### Custom Styling

```tsx
// Override component styles
<PhotoUpload
  className="custom-upload-styles"
  // Component will apply custom styles
/>

// Use CSS variables for theming
:root {
  --upload-border-color: #e2e8f0;
  --upload-hover-color: #f1f5f9;
}
```

## 🔧 Advanced Configuration

### Environment Setup

```bash
# Required environment variables
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### API Integration

```tsx
// Configure API endpoints
const apiConfig = {
  uploadEndpoint: '/api/upload',
  ocrEndpoint: '/api/ocr',
  fraudDetectionEndpoint: '/api/fraud-detection',
  blockchainEndpoint: '/api/blockchain'
};

// Components automatically use these endpoints
```

## 📊 Performance Optimization

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const PhotoUpload = lazy(() => import('@/components/shared/upload/PhotoUpload'));

export const MyComponent = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PhotoUpload onUpload={handleUpload} />
  </Suspense>
);
```

### Memoization

```tsx
import { memo, useCallback } from 'react';

const MemoizedPhotoUpload = memo(PhotoUpload);

export const MyComponent = () => {
  const handleUpload = useCallback((files) => {
    // Handle upload
  }, []);

  return <MemoizedPhotoUpload onUpload={handleUpload} />;
};
```

## 🧪 Testing

### Unit Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoUpload } from '@/components/shared';

test('PhotoUpload renders correctly', () => {
  render(<PhotoUpload onUpload={jest.fn()} />);
  expect(screen.getByText('Device Photos')).toBeInTheDocument();
});
```

### Integration Testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { InteractiveMap } from '@/components/shared';

test('InteractiveMap handles location selection', async () => {
  const handleLocationSelect = jest.fn();
  render(
    <InteractiveMap 
      onLocationSelect={handleLocationSelect}
      enableGPS={true}
    />
  );
  
  // Test location selection
  await waitFor(() => {
    expect(handleLocationSelect).toHaveBeenCalled();
  });
});
```

## 🚀 Deployment

### Build Optimization

```bash
# Build with tree shaking
npm run build -- --mode production

# Analyze bundle size
npm run build -- --analyze
```

### CDN Integration

```tsx
// Load components from CDN
import { PhotoUpload } from 'https://cdn.stolen.app/components/shared';
```

## 📚 Best Practices

### 1. Component Composition

```tsx
// Compose multiple components
export const DeviceRegistration = () => (
  <div className="space-y-6">
    <PhotoUpload variant="device-photo" />
    <QRScanner onScan={handleScan} />
    <InteractiveMap onLocationSelect={handleLocation} />
    <FraudDetection deviceData={deviceData} />
  </div>
);
```

### 2. Error Handling

```tsx
<PhotoUpload
  onUpload={handleUpload}
  onError={(error) => {
    console.error('Upload failed:', error);
    showNotification('Upload failed. Please try again.');
  }}
/>
```

### 3. Accessibility

```tsx
// Components include proper ARIA labels
<PhotoUpload
  onUpload={handleUpload}
  aria-label="Upload device photos"
  role="button"
/>
```

## 🔄 Migration Guide

### From Existing Components

```tsx
// Before: Custom upload component
<CustomUploadComponent />

// After: Shared PhotoUpload
<PhotoUpload
  onUpload={handleUpload}
  variant="device-photo"
  maxSize={10}
/>
```

### Gradual Migration

1. **Phase 1**: Replace upload components
2. **Phase 2**: Replace map components  
3. **Phase 3**: Replace scanning components
4. **Phase 4**: Replace AI components
5. **Phase 5**: Replace blockchain components

## 📞 Support

### Documentation
- Component API documentation
- Usage examples and patterns
- Troubleshooting guide

### Community
- GitHub issues and discussions
- Discord community support
- Developer forums

### Updates
- Regular component updates
- New feature announcements
- Breaking change notifications

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: STOLEN Platform Team



