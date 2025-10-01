import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PhotoUpload, 
  DocumentUpload, 
  InteractiveMap, 
  QRScanner, 
  FraudDetection, 
  BlockchainVerification 
} from '../index';
import type { 
  UploadedFile, 
  UploadedDocument, 
  MapLocation, 
  QRScanResult, 
  FraudAnalysisResult, 
  VerificationResult 
} from '../index';

/**
 * STOLEN Platform - Shared Components Usage Examples
 * 
 * This file demonstrates how to use all the shared components
 * extracted from the STOLEN ecosystem. These examples show
 * the proper implementation patterns and best practices.
 */

export const UsageExamples: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [qrResults, setQrResults] = useState<QRScanResult[]>([]);
  const [fraudResult, setFraudResult] = useState<FraudAnalysisResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Photo Upload Example
  const handlePhotoUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    console.log('Photos uploaded:', files);
  };

  // Document Upload Example
  const handleDocumentUpload = (documents: UploadedDocument[]) => {
    setUploadedDocuments(documents);
    console.log('Documents uploaded:', documents);
  };

  // Map Location Selection Example
  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    console.log('Location selected:', location);
  };

  // QR Code Scanning Example
  const handleQRScan = (result: QRScanResult) => {
    setQrResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
    console.log('QR code scanned:', result);
  };

  // Fraud Detection Example
  const handleFraudAnalysis = (result: FraudAnalysisResult) => {
    setFraudResult(result);
    console.log('Fraud analysis completed:', result);
  };

  // Blockchain Verification Example
  const handleBlockchainVerification = (result: VerificationResult) => {
    setVerificationResult(result);
    console.log('Blockchain verification completed:', result);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">STOLEN Platform - Shared Components</h1>
        <p className="text-muted-foreground">
          Reusable components extracted from the ecosystem for consistency and maintainability
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="maps">Maps</TabsTrigger>
          <TabsTrigger value="scanning">Scanning</TabsTrigger>
          <TabsTrigger value="ai">AI/ML</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Upload Components */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Photo Upload Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Device Photo Upload</h3>
                <PhotoUpload
                  onUpload={handlePhotoUpload}
                  variant="device-photo"
                  maxSize={10}
                  multiple={true}
                  autoOptimize={true}
                  enableLocation={true}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Receipt Upload</h3>
                <PhotoUpload
                  onUpload={handlePhotoUpload}
                  variant="receipt"
                  maxSize={5}
                  multiple={false}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
                <DocumentUpload
                  onUpload={handleDocumentUpload}
                  variant="receipt"
                  maxSize={5}
                  multiple={true}
                  enableOCR={true}
                  autoExtract={true}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{file.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Map Components */}
        <TabsContent value="maps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Map Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Interactive Map with Location Selection</h3>
                <InteractiveMap
                  center={[-26.2041, 28.0473]} // Johannesburg, South Africa
                  zoom={10}
                  onLocationSelect={handleLocationSelect}
                  enableSearch={true}
                  enableLayers={true}
                  enableGPS={true}
                  height="400px"
                />
              </div>

              {selectedLocation && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Selected Location</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Coordinates:</strong> {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}</p>
                    {selectedLocation.address && (
                      <p><strong>Address:</strong> {selectedLocation.address}</p>
                    )}
                    {selectedLocation.accuracy && (
                      <p><strong>Accuracy:</strong> {Math.round(selectedLocation.accuracy)}m</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scanning Components */}
        <TabsContent value="scanning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanning Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">QR Code Scanner</h3>
                <QRScanner
                  onScan={handleQRScan}
                  enableCamera={true}
                  enableFileUpload={true}
                  autoStart={false}
                />
              </div>

              {qrResults.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Scan Results ({qrResults.length})</h4>
                  <div className="space-y-2">
                    {qrResults.map((result, index) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Components */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI/ML Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Fraud Detection</h3>
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
                    },
                    userHistory: {
                      previousReports: 1,
                      accountAge: 365,
                      verificationStatus: 'verified'
                    },
                    transactionHistory: {
                      totalTransactions: 5,
                      averageAmount: 150,
                      suspiciousPatterns: []
                    }
                  }}
                  onAnalysisComplete={handleFraudAnalysis}
                  confidenceThreshold={0.8}
                  enableRealTime={false}
                />
              </div>

              {fraudResult && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Fraud Analysis Result</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Risk Score:</strong> {Math.round(fraudResult.riskScore)}%</p>
                    <p><strong>Confidence:</strong> {Math.round(fraudResult.confidence * 100)}%</p>
                    <p><strong>Is Fraudulent:</strong> {fraudResult.isFraudulent ? 'Yes' : 'No'}</p>
                    <p><strong>Recommendations:</strong> {fraudResult.recommendations.length}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Components */}
        <TabsContent value="blockchain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Verification Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Blockchain Verification</h3>
                <BlockchainVerification
                  deviceId="DEVICE123456"
                  onVerificationComplete={handleBlockchainVerification}
                  networks={['ethereum', 'polygon']}
                  enableMultiNetwork={true}
                />
              </div>

              {verificationResult && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Verification Result</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Is Verified:</strong> {verificationResult.isVerified ? 'Yes' : 'No'}</p>
                    <p><strong>Confidence:</strong> {Math.round(verificationResult.confidence * 100)}%</p>
                    <p><strong>Steps Completed:</strong> {verificationResult.verificationSteps.filter(s => s.status === 'completed').length}/{verificationResult.verificationSteps.length}</p>
                    {verificationResult.blockchainRecord && (
                      <p><strong>Transaction Hash:</strong> {verificationResult.blockchainRecord.transactionHash.substring(0, 20)}...</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Examples */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Integration Example</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground">
                <p>This example shows how to integrate multiple shared components in a real-world scenario:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Upload device photos using PhotoUpload</li>
                  <li>Scan QR codes for device verification</li>
                  <li>Select location using InteractiveMap</li>
                  <li>Run fraud detection analysis</li>
                  <li>Verify device on blockchain</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Step 1: Upload Device Photos</h4>
                  <PhotoUpload
                    onUpload={handlePhotoUpload}
                    variant="device-photo"
                    maxSize={10}
                    multiple={true}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Step 2: Scan Device QR Code</h4>
                  <QRScanner
                    onScan={handleQRScan}
                    enableCamera={true}
                    enableFileUpload={true}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Step 3: Select Location</h4>
                  <InteractiveMap
                    center={[-26.2041, 28.0473]}
                    zoom={10}
                    onLocationSelect={handleLocationSelect}
                    height="200px"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Step 4: Run Analysis</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        const deviceData = {
                          serialNumber: 'DEVICE123456',
                          imei: '123456789012345',
                          model: 'iPhone 13 Pro',
                          purchaseDate: new Date('2023-01-15'),
                          price: 1200,
                          location: selectedLocation ? {
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude
                          } : undefined
                        };
                        
                        // This would trigger fraud analysis
                        console.log('Running fraud analysis with:', deviceData);
                      }}
                      className="w-full"
                    >
                      Run Fraud Analysis
                    </Button>
                    
                    <Button
                      onClick={() => {
                        console.log('Running blockchain verification for: DEVICE123456');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Verify on Blockchain
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsageExamples;
