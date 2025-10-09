import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  MapPin, 
  QrCode, 
  Brain, 
  Shield, 
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Import all shared components
import {
  PhotoUpload,
  DocumentUpload,
  InteractiveMap,
  QRScanner,
  FraudDetection,
  BlockchainVerification
} from './index';

/**
 * STOLEN Platform - Component Showcase
 * 
 * This component demonstrates all the shared components in action,
 * showing their capabilities and integration patterns.
 */

export const ComponentShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [demoResults, setDemoResults] = useState<any>({});

  const handlePhotoUpload = (files: any[]) => {
    setDemoResults(prev => ({ ...prev, photos: files }));
  };

  const handleDocumentUpload = (documents: any[]) => {
    setDemoResults(prev => ({ ...prev, documents }));
  };

  const handleLocationSelect = (location: any) => {
    setDemoResults(prev => ({ ...prev, location }));
  };

  const handleQRScan = (result: any) => {
    setDemoResults(prev => ({ 
      ...prev, 
      qrResults: [...(prev.qrResults || []), result].slice(0, 5)
    }));
  };

  const handleFraudAnalysis = (result: any) => {
    setDemoResults(prev => ({ ...prev, fraudResult: result }));
  };

  const handleBlockchainVerification = (result: any) => {
    setDemoResults(prev => ({ ...prev, verificationResult: result }));
  };

  const getComponentIcon = (component: string) => {
    const icons = {
      'PhotoUpload': Camera,
      'DocumentUpload': Upload,
      'InteractiveMap': MapPin,
      'QRScanner': QrCode,
      'FraudDetection': Brain,
      'BlockchainVerification': Shield
    };
    return icons[component] || Camera;
  };

  const getComponentDescription = (component: string) => {
    const descriptions = {
      'PhotoUpload': 'Camera capture and photo upload with optimization',
      'DocumentUpload': 'Document scanning and upload with OCR processing',
      'InteractiveMap': 'Interactive maps with location services and GPS',
      'QRScanner': 'QR code scanning with camera and file upload support',
      'FraudDetection': 'AI-powered fraud detection and risk assessment',
      'BlockchainVerification': 'Blockchain-based device verification'
    };
    return descriptions[component] || 'Component description';
  };

  const getComponentFeatures = (component: string) => {
    const features = {
      'PhotoUpload': [
        'Camera access and photo capture',
        'File upload with drag & drop',
        'Image optimization and compression',
        'Location metadata capture',
        'Multiple variants (device-photo, receipt, evidence)'
      ],
      'DocumentUpload': [
        'Document upload with OCR processing',
        'Multiple file format support',
        'Automatic text extraction',
        'Structured data parsing',
        'Receipt and invoice processing'
      ],
      'InteractiveMap': [
        'Google Maps integration with OpenStreetMap fallback',
        'Location search and geocoding',
        'GPS location tracking',
        'Custom markers and clustering',
        'Multiple map styles (default, dark, satellite)'
      ],
      'QRScanner': [
        'Real-time camera scanning',
        'File upload for image scanning',
        'Multiple QR code format support',
        'Automatic result parsing',
        'Copy and external link actions'
      ],
      'FraudDetection': [
        'Multi-factor fraud analysis',
        'Risk scoring and confidence levels',
        'Real-time analysis capabilities',
        'Detailed factor breakdown',
        'Actionable recommendations'
      ],
      'BlockchainVerification': [
        'Multi-network verification (Ethereum, Polygon, BSC)',
        'Transaction history analysis',
        'Ownership verification',
        'Gas usage tracking',
        'Network-specific validation'
      ]
    };
    return features[component] || [];
  };

  const components = [
    'PhotoUpload',
    'DocumentUpload', 
    'InteractiveMap',
    'QRScanner',
    'FraudDetection',
    'BlockchainVerification'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          STOLEN Platform - Shared Components
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Reusable components extracted from the STOLEN ecosystem for consistency, 
          maintainability, and technology preservation across the entire application.
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {components.length} Components
          </Badge>
          <Badge variant="outline" className="text-sm">
            TypeScript
          </Badge>
          <Badge variant="outline" className="text-sm">
            React 18
          </Badge>
          <Badge variant="outline" className="text-sm">
            Tailwind CSS
          </Badge>
        </div>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component) => {
          const Icon = getComponentIcon(component);
          const description = getComponentDescription(component);
          const features = getComponentFeatures(component);
          
          return (
            <Card key={component} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{component}</CardTitle>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                    {features.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveDemo(component.toLowerCase())}
                  className="w-full"
                >
                  View Demo
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Demo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5" />
            Interactive Component Demos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="photoupload">Photo</TabsTrigger>
              <TabsTrigger value="documentupload">Document</TabsTrigger>
              <TabsTrigger value="interactivemap">Map</TabsTrigger>
              <TabsTrigger value="qrscanner">QR</TabsTrigger>
              <TabsTrigger value="ai">AI/Blockchain</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-semibold">Component Library Overview</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  The STOLEN platform shared components library provides a comprehensive 
                  set of reusable tools and features extracted from the ecosystem. 
                  These components ensure consistency in styling, design, and technology 
                  stack across the entire application.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Technology Stack</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>React 18 with TypeScript</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Tailwind CSS for styling</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Shadcn/ui components</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>TensorFlow.js for AI/ML</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Web3.js for blockchain</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Benefits</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Consistent design system</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Reusable across ecosystem</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Technology preservation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Easy maintenance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Performance optimized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photoupload" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Photo Upload Component</h3>
                <PhotoUpload
                  onUpload={handlePhotoUpload}
                  variant="device-photo"
                  maxSize={10}
                  multiple={true}
                  autoOptimize={true}
                  enableLocation={true}
                />
                
                {demoResults.photos && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Upload Results</h4>
                    <p className="text-sm text-muted-foreground">
                      {demoResults.photos.length} file(s) uploaded successfully
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documentupload" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Document Upload Component</h3>
                <DocumentUpload
                  onUpload={handleDocumentUpload}
                  variant="receipt"
                  maxSize={5}
                  multiple={true}
                  enableOCR={true}
                  autoExtract={true}
                />
                
                {demoResults.documents && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Upload Results</h4>
                    <p className="text-sm text-muted-foreground">
                      {demoResults.documents.length} document(s) processed with OCR
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="interactivemap" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Interactive Map Component</h3>
                <InteractiveMap
                  center={[-26.2041, 28.0473]}
                  zoom={10}
                  onLocationSelect={handleLocationSelect}
                  enableSearch={true}
                  enableGPS={true}
                  height="400px"
                />
                
                {demoResults.location && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Location</h4>
                    <p className="text-sm text-muted-foreground">
                      {demoResults.location.latitude.toFixed(6)}, {demoResults.location.longitude.toFixed(6)}
                    </p>
                    {demoResults.location.address && (
                      <p className="text-sm text-muted-foreground">
                        {demoResults.location.address}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="qrscanner" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">QR Scanner Component</h3>
                <QRScanner
                  onScan={handleQRScan}
                  enableCamera={true}
                  enableFileUpload={true}
                  autoStart={false}
                />
                
                {demoResults.qrResults && demoResults.qrResults.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Scan Results</h4>
                    <div className="space-y-2">
                      {demoResults.qrResults.map((result: any, index: number) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{result.data}</span>
                          <span className="text-muted-foreground ml-2">
                            ({result.metadata?.type || 'unknown'})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">AI Fraud Detection</h3>
                  <FraudDetection
                    deviceData={{
                      serialNumber: 'DEVICE123456',
                      imei: '123456789012345',
                      model: 'iPhone 13 Pro',
                      purchaseDate: new Date('2023-01-15'),
                      price: 1200,
                      location: {
                        latitude: -26.2041,
                        longitude: 28.0473
                      }
                    }}
                    onAnalysisComplete={handleFraudAnalysis}
                    confidenceThreshold={0.8}
                    enableRealTime={false}
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Blockchain Verification</h3>
                  <BlockchainVerification
                    deviceId="DEVICE123456"
                    onVerificationComplete={handleBlockchainVerification}
                    networks={['ethereum', 'polygon']}
                    enableMultiNetwork={true}
                  />
                </div>
                
                {(demoResults.fraudResult || demoResults.verificationResult) && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Analysis Results</h4>
                    {demoResults.fraudResult && (
                      <p className="text-sm text-muted-foreground">
                        Fraud Risk: {Math.round(demoResults.fraudResult.riskScore)}%
                      </p>
                    )}
                    {demoResults.verificationResult && (
                      <p className="text-sm text-muted-foreground">
                        Blockchain Verified: {demoResults.verificationResult.isVerified ? 'Yes' : 'No'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Integration Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Integration Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This example shows how multiple shared components work together in a real-world scenario:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium">Device Registration Flow</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Upload device photos using PhotoUpload</li>
                  <li>2. Scan device QR code using QRScanner</li>
                  <li>3. Select location using InteractiveMap</li>
                  <li>4. Run fraud detection analysis</li>
                  <li>5. Verify device on blockchain</li>
                </ol>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Component Benefits</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Consistent styling across all components</li>
                  <li>• Preserved technology stack integration</li>
                  <li>• Easy maintenance and updates</li>
                  <li>• Reusable across entire ecosystem</li>
                  <li>• Performance optimized</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentShowcase;

