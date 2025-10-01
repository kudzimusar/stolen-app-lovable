# STOLEN Platform - Shared Components Reference Guide

## 📍 **File Location**
All shared components are located in: `/src/components/shared/`

## 📁 **Directory Structure**
```
src/components/shared/
├── SHARED_COMPONENTS_README.md          # Main documentation
├── IMPLEMENTATION_GUIDE.md              # Implementation instructions
├── COMPONENT_REFERENCE_GUIDE.md        # This reference guide
├── index.ts                             # Main exports
├── ComponentShowcase.tsx                # Interactive showcase
├── examples/
│   └── UsageExamples.tsx                # Usage examples
├── styles/
│   └── shared-styles.css                # Consistent styling
├── upload/
│   ├── PhotoUpload.tsx                  # Photo upload component
│   └── DocumentUpload.tsx               # Document upload component
├── maps/
│   └── InteractiveMap.tsx               # Interactive map component
├── scanning/
│   └── QRScanner.tsx                    # QR code scanner
├── ai/
│   └── FraudDetection.tsx               # AI fraud detection
├── blockchain/
│   └── BlockchainVerification.tsx      # Blockchain verification
├── payment/
│   └── WalletBalance.tsx               # Wallet balance component
├── notifications/
│   └── NotificationCenter.tsx          # Notification center
└── security/
    └── MultiFactorAuth.tsx             # Multi-factor authentication
```

## 🚀 **How to Access and Use Components**

### **Method 1: Import Individual Components**
```tsx
// Import specific components
import { PhotoUpload, InteractiveMap, OpenStreetMap, QRScanner, AIWalletInsights, EnhancedSelect, RealTimeUpdates } from '@/components/shared';

// Use in your component
<PhotoUpload
  onUpload={handleUpload}
  variant="device-photo"
  maxSize={10}
  multiple={true}
/>
```

### **Method 2: Import by Category**
```tsx
// Import component categories
import { UploadComponents, MapComponents, AIComponents, FormComponents, CommunicationComponents } from '@/components/shared';

// Use components
<UploadComponents.PhotoUpload onUpload={handleUpload} />
<MapComponents.OpenStreetMap center={[-26.2041, 28.0473]} />
<AIComponents.AIWalletInsights walletData={walletData} transactions={transactions} />
<FormComponents.EnhancedSelect options={DEVICE_BRANDS} />
<CommunicationComponents.RealTimeUpdates userId="user123" />
```

### **Method 3: Import All Components**
```tsx
// Import all shared components
import { SharedComponents } from '@/components/shared';

// Use any component
<SharedComponents.PhotoUpload onUpload={handleUpload} />
<SharedComponents.OpenStreetMap center={[-26.2041, 28.0473]} />
<SharedComponents.AIWalletInsights walletData={walletData} />
<SharedComponents.EnhancedSelect options={DEVICE_BRANDS} />
<SharedComponents.RealTimeUpdates userId="user123" />
```

## 📋 **Complete Component List**

### **📸 Upload & Media Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `PhotoUpload` | `upload/PhotoUpload.tsx` | Camera capture and photo upload | Camera access, file upload, image optimization, location metadata |
| `DocumentUpload` | `upload/DocumentUpload.tsx` | Document scanning and upload | OCR processing, multiple formats, structured data parsing |

### **🗺️ Map & Location Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `InteractiveMap` | `maps/InteractiveMap.tsx` | Interactive maps with location services | Google Maps integration, GPS tracking, custom markers, search |
| `OpenStreetMap` | `maps/OpenStreetMap.tsx` | Free OpenStreetMap integration | Leaflet integration, Nominatim geocoding, South African localization, clustering |

### **📱 Scanning & Recognition Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `QRScanner` | `scanning/QRScanner.tsx` | QR code scanning | Real-time camera scanning, file upload, multiple formats |

### **🤖 AI & Machine Learning Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `FraudDetection` | `ai/FraudDetection.tsx` | AI-powered fraud detection | Multi-factor analysis, risk scoring, confidence levels |
| `AIWalletInsights` | `ai/AIWalletInsights.tsx` | AI-powered wallet analysis | Spending patterns, security insights, optimization suggestions, predictions |

### **🔗 Blockchain & Security Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `BlockchainVerification` | `blockchain/BlockchainVerification.tsx` | Blockchain-based verification | Multi-network support, transaction tracking, ownership verification |

### **💳 Payment & Financial Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `WalletBalance` | `payment/WalletBalance.tsx` | Wallet balance display | Balance breakdown, transaction summary, privacy controls |

### **🔔 Notification & Communication Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `NotificationCenter` | `notifications/NotificationCenter.tsx` | Notification management | Real-time notifications, filtering, priority management |

### **🔐 Security & Authentication Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `MultiFactorAuth` | `security/MultiFactorAuth.tsx` | Multi-factor authentication | SMS, email, TOTP, backup codes, biometric support |

### **📝 Form Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `EnhancedSelect` | `forms/EnhancedSelect.tsx` | Enhanced dropdown select | South African data, searchable, multiple options, device/geo data |

### **💬 Communication Components**
| Component | File | Purpose | Key Features |
|-----------|------|---------|--------------|
| `RealTimeUpdates` | `communication/RealTimeUpdates.tsx` | Real-time notification system | WebSocket integration, priority management, mobile optimization |

## 🎯 **Usage Examples by Use Case**

### **Device Registration Flow**
```tsx
import { PhotoUpload, QRScanner, InteractiveMap, FraudDetection } from '@/components/shared';

export const DeviceRegistration = () => {
  return (
    <div className="space-y-6">
      {/* Step 1: Upload device photos */}
      <PhotoUpload
        onUpload={handlePhotoUpload}
        variant="device-photo"
        maxSize={10}
        multiple={true}
      />
      
      {/* Step 2: Scan device QR code */}
      <QRScanner
        onScan={handleQRScan}
        enableCamera={true}
        enableFileUpload={true}
      />
      
      {/* Step 3: Select location */}
      <InteractiveMap
        center={[-26.2041, 28.0473]}
        onLocationSelect={handleLocationSelect}
        enableGPS={true}
      />
      
      {/* Step 4: Run fraud analysis */}
      <FraudDetection
        deviceData={deviceData}
        onAnalysisComplete={handleFraudAnalysis}
        confidenceThreshold={0.8}
      />
    </div>
  );
};
```

### **Payment Dashboard**
```tsx
import { WalletBalance, NotificationCenter } from '@/components/shared';

export const PaymentDashboard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Wallet balance */}
      <WalletBalance
        userId="user123"
        onBalanceUpdate={handleBalanceUpdate}
        showQuickActions={true}
        enablePrivacy={true}
      />
      
      {/* Notifications */}
      <NotificationCenter
        userId="user123"
        onNotificationClick={handleNotificationClick}
        showFilters={true}
        maxNotifications={20}
      />
    </div>
  );
};
```

### **Security Settings**
```tsx
import { MultiFactorAuth, BlockchainVerification } from '@/components/shared';

export const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      {/* MFA Setup */}
      <MultiFactorAuth
        userId="user123"
        onSetupComplete={handleMFASetup}
        enableBiometric={true}
        requireBackupCodes={true}
      />
      
      {/* Blockchain Verification */}
      <BlockchainVerification
        deviceId="DEVICE123456"
        onVerificationComplete={handleVerification}
        networks={['ethereum', 'polygon']}
        enableMultiNetwork={true}
      />
    </div>
  );
};
```

## 🔧 **Copy and Paste Usage**

### **For Quick Copy-Paste Implementation:**

1. **Copy the component file** from `/src/components/shared/[category]/[ComponentName].tsx`
2. **Paste into your project** at the desired location
3. **Update imports** to match your project structure
4. **Customize props** as needed for your use case

### **Example Copy-Paste Workflow:**
```bash
# Copy PhotoUpload component
cp src/components/shared/upload/PhotoUpload.tsx src/components/your-project/

# Copy InteractiveMap component  
cp src/components/shared/maps/InteractiveMap.tsx src/components/your-project/

# Copy WalletBalance component
cp src/components/shared/payment/WalletBalance.tsx src/components/your-project/
```

## 🎨 **Styling and Theming**

### **Consistent Styling**
All components use the same design system:
- **Colors**: Primary, secondary, muted, destructive
- **Typography**: Consistent font sizes and weights  
- **Spacing**: Standardized padding and margins
- **Borders**: Consistent border radius and styles

### **Custom Styling**
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

## 📚 **Documentation Files**

| File | Purpose | Content |
|------|---------|---------|
| `SHARED_COMPONENTS_README.md` | Main documentation | Overview, features, benefits |
| `IMPLEMENTATION_GUIDE.md` | Implementation instructions | Setup, usage, best practices |
| `COMPONENT_REFERENCE_GUIDE.md` | This reference guide | Complete component list, usage examples |
| `ComponentShowcase.tsx` | Interactive showcase | Live component demonstrations |
| `examples/UsageExamples.tsx` | Usage examples | Real-world implementation examples |

## 🔄 **Component Updates and Maintenance**

### **When to Update Components:**
- Bug fixes in original components
- New features added to ecosystem
- Security updates
- Performance improvements
- UI/UX enhancements

### **How to Update:**
1. **Check for updates** in the shared components library
2. **Copy updated component** to your project
3. **Test functionality** in your implementation
4. **Update documentation** if needed

## 🚀 **Quick Start Checklist**

- [ ] **Import components** using your preferred method
- [ ] **Check component props** in the documentation
- [ ] **Implement basic usage** with required props
- [ ] **Add custom styling** if needed
- [ ] **Test functionality** in your environment
- [ ] **Handle errors** and edge cases
- [ ] **Update documentation** for your team

## 📞 **Support and Resources**

- **Documentation**: Check individual component files for detailed prop descriptions
- **Examples**: See `examples/UsageExamples.tsx` for implementation patterns
- **Showcase**: Use `ComponentShowcase.tsx` to test components interactively
- **Styling**: Reference `styles/shared-styles.css` for consistent theming

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: STOLEN Platform Team
