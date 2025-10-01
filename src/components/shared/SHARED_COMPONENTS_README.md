# STOLEN Platform - Shared Components Library

## Overview
This library contains all reusable tools, components, and features extracted from the STOLEN ecosystem. These components ensure consistency in styling, design, and technology stack across the entire application.

## Component Categories

### 📸 **Upload & Media Components**
- `PhotoUpload` - Camera capture and photo upload
- `DocumentUpload` - Document scanning and upload
- `ReceiptUpload` - Receipt scanning with OCR
- `OptimizedUpload` - Performance-optimized upload with compression

### 🗺️ **Location & Mapping Components**
- `InteractiveMap` - Google Maps integration
- `LocationSelector` - Location picker with geocoding
- `GPSLocation` - Real-time GPS tracking
- `GeoFence` - Location-based alerts

### 📱 **Scanning & Recognition Tools**
- `QRScanner` - QR code scanning
- `BarcodeScanner` - Barcode scanning
- `OCRScanner` - Document text recognition
- `SerialNumberScanner` - Device serial number recognition

### 🤖 **AI & Machine Learning Components**
- `FraudDetection` - AI-powered fraud analysis
- `SmartMatching` - Intelligent user matching
- `RiskAssessment` - Device risk scoring
- `AIChatAssistant` - Intelligent chat support

### 🔗 **Blockchain & Security Components**
- `BlockchainVerification` - Device ownership verification
- `SmartContract` - Blockchain transaction handling
- `CryptoWallet` - Digital wallet integration
- `SecurityEnhancement` - Security verification tools

### 💳 **Payment & Financial Components**
- `PaymentGateway` - Multi-gateway payment processing
- `WalletBalance` - S-Pay wallet management
- `TransactionHistory` - Payment history display
- `EscrowProtection` - Secure transaction handling

### 🔐 **Authentication & Identity Components**
- `MultiFactorAuth` - MFA authentication
- `IdentityVerification` - KYC verification
- `BiometricAuth` - Biometric authentication
- `SessionManager` - User session handling

## Usage Examples

### Photo Upload Component
```tsx
import { PhotoUpload } from '@/components/shared/upload/PhotoUpload';

<PhotoUpload
  onUpload={(files) => console.log('Uploaded:', files)}
  maxSize={10}
  multiple={true}
  variant="device-photo"
/>
```

### Interactive Map Component
```tsx
import { InteractiveMap } from '@/components/shared/maps/InteractiveMap';

<InteractiveMap
  center={[-26.2041, 28.0473]}
  zoom={10}
  onLocationSelect={(location) => console.log('Selected:', location)}
  markers={deviceLocations}
/>
```

### AI Fraud Detection Component
```tsx
import { FraudDetection } from '@/components/shared/ai/FraudDetection';

<FraudDetection
  deviceData={deviceInfo}
  onAnalysisComplete={(result) => console.log('Analysis:', result)}
  confidenceThreshold={0.8}
/>
```

## Technology Stack
- **React 18** - Component framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling system
- **Shadcn/ui** - UI components
- **TensorFlow.js** - AI/ML processing
- **Web3.js** - Blockchain integration
- **Google Maps API** - Location services
- **Tesseract.js** - OCR processing

## Benefits
- ✅ **Consistency** - Unified design and behavior
- ✅ **Reusability** - Use across entire ecosystem
- ✅ **Maintainability** - Single source of truth
- ✅ **Performance** - Optimized and tested components
- ✅ **Technology** - Preserved tech stack integration
