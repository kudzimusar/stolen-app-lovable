import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Package,
  Plus,
  Trash2
} from "lucide-react";

interface DeviceData {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  price: number;
  purchaseDate: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

const BulkRegistration = () => {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          processFile(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const mockDevices: DeviceData[] = [
        {
          id: '1',
          name: 'iPhone 15 Pro',
          brand: 'Apple',
          model: 'iPhone 15 Pro',
          serialNumber: 'ABC123DEF456',
          price: 25000,
          purchaseDate: '2024-01-15',
          status: 'completed'
        },
        {
          id: '2',
          name: 'Samsung Galaxy S24',
          brand: 'Samsung',
          model: 'Galaxy S24',
          serialNumber: 'XYZ789GHI012',
          price: 22000,
          purchaseDate: '2024-01-18',
          status: 'completed'
        },
        {
          id: '3',
          name: 'MacBook Pro M3',
          brand: 'Apple',
          model: 'MacBook Pro M3',
          serialNumber: 'MNB456PQR789',
          price: 45000,
          purchaseDate: '2024-01-10',
          status: 'error',
          error: 'Serial number already registered'
        }
      ];

      setDevices(mockDevices);
      setIsProcessing(false);
    }, 2000);
  };

  const handleManualAdd = () => {
    const newDevice: DeviceData = {
      id: Date.now().toString(),
      name: '',
      brand: '',
      model: '',
      serialNumber: '',
      price: 0,
      purchaseDate: '',
      status: 'pending'
    };
    setDevices([...devices, newDevice]);
  };

  const handleDeviceUpdate = (id: string, field: keyof DeviceData, value: any) => {
    setDevices(devices.map(device => 
      device.id === id ? { ...device, [field]: value } : device
    ));
  };

  const handleRemoveDevice = (id: string) => {
    setDevices(devices.filter(device => device.id !== id));
  };

  const handleBulkRegister = async () => {
    setIsProcessing(true);
    
    // Simulate bulk registration
    setTimeout(() => {
      setDevices(devices.map(device => ({
        ...device,
        status: device.status === 'pending' ? 'completed' : device.status
      })));
      setIsProcessing(false);
    }, 3000);
  };

  const downloadTemplate = () => {
    const template = `Name,Brand,Model,Serial Number,Price,Purchase Date
iPhone 15 Pro,Apple,iPhone 15 Pro,ABC123DEF456,25000,2024-01-15
Samsung Galaxy S24,Samsung,Galaxy S24,XYZ789GHI012,22000,2024-01-18`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_registration_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const completedCount = devices.filter(d => d.status === 'completed').length;
  const errorCount = devices.filter(d => d.status === 'error').length;
  const pendingCount = devices.filter(d => d.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Bulk Device Registration</h1>
          <p className="text-muted-foreground">
            Register multiple devices at once using CSV upload or manual entry
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Upload a CSV file with device information for bulk registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={downloadTemplate} className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" onClick={handleManualAdd} className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Manually
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Processing Status */}
        {isProcessing && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <div>
                  <p className="font-medium">Processing devices...</p>
                  <p className="text-sm text-muted-foreground">
                    Registering devices with STOLEN platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {devices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{devices.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold">{errorCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Device List */}
        {devices.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Device List</CardTitle>
                <Button onClick={handleBulkRegister} disabled={isProcessing || pendingCount === 0}>
                  Register All ({pendingCount})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{device.name || 'Unnamed Device'}</h3>
                          {device.status === 'completed' && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Registered
                            </Badge>
                          )}
                          {device.status === 'error' && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                          {device.status === 'pending' && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                        
                        {device.status === 'pending' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`name-${device.id}`}>Device Name</Label>
                              <Input
                                id={`name-${device.id}`}
                                value={device.name}
                                onChange={(e) => handleDeviceUpdate(device.id, 'name', e.target.value)}
                                placeholder="e.g., iPhone 15 Pro"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`brand-${device.id}`}>Brand</Label>
                              <Input
                                id={`brand-${device.id}`}
                                value={device.brand}
                                onChange={(e) => handleDeviceUpdate(device.id, 'brand', e.target.value)}
                                placeholder="e.g., Apple"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`model-${device.id}`}>Model</Label>
                              <Input
                                id={`model-${device.id}`}
                                value={device.model}
                                onChange={(e) => handleDeviceUpdate(device.id, 'model', e.target.value)}
                                placeholder="e.g., iPhone 15 Pro"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`serial-${device.id}`}>Serial Number</Label>
                              <Input
                                id={`serial-${device.id}`}
                                value={device.serialNumber}
                                onChange={(e) => handleDeviceUpdate(device.id, 'serialNumber', e.target.value)}
                                placeholder="e.g., ABC123DEF456"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`price-${device.id}`}>Price (R)</Label>
                              <Input
                                id={`price-${device.id}`}
                                type="number"
                                value={device.price}
                                onChange={(e) => handleDeviceUpdate(device.id, 'price', parseFloat(e.target.value) || 0)}
                                placeholder="25000"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`date-${device.id}`}>Purchase Date</Label>
                              <Input
                                id={`date-${device.id}`}
                                type="date"
                                value={device.purchaseDate}
                                onChange={(e) => handleDeviceUpdate(device.id, 'purchaseDate', e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Brand:</span>
                              <p>{device.brand}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Model:</span>
                              <p>{device.model}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Serial:</span>
                              <p>{device.serialNumber}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <p>R{device.price.toLocaleString()}</p>
                            </div>
                          </div>
                        )}

                        {device.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            {device.error}
                          </div>
                        )}
                      </div>
                      
                      {device.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveDevice(device.id)}
                          className="ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BulkRegistration;
