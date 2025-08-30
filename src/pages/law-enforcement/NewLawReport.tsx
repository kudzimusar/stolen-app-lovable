import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  User,
  MapPin
} from "lucide-react";

const NewLawReport = () => {
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceBrand: '',
    deviceModel: '',
    serialNumber: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    incidentType: '',
    incidentDate: '',
    incidentLocation: '',
    description: '',
    evidence: '',
    caseNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold">Report Submitted Successfully!</h2>
              <p className="text-muted-foreground">
                Your law enforcement report has been submitted and is being processed. 
                You will receive updates via email and SMS.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Report Reference:</strong> LER-{Date.now().toString().slice(-6)}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Case Number:</strong> {formData.caseNumber || 'Pending Assignment'}
                </p>
              </div>
              <Button onClick={() => setIsSubmitted(false)}>
                Submit Another Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">Submit Law Enforcement Report</h1>
            <p className="text-muted-foreground">
              Submit a report for device-related incidents requiring law enforcement attention
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Device Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Device Information
                </CardTitle>
                <CardDescription>
                  Provide details about the device involved in the incident
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deviceName">Device Name</Label>
                    <Input
                      id="deviceName"
                      value={formData.deviceName}
                      onChange={(e) => handleInputChange('deviceName', e.target.value)}
                      placeholder="e.g., iPhone 15 Pro"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="deviceBrand">Brand</Label>
                    <Input
                      id="deviceBrand"
                      value={formData.deviceBrand}
                      onChange={(e) => handleInputChange('deviceBrand', e.target.value)}
                      placeholder="e.g., Apple"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="deviceModel">Model</Label>
                    <Input
                      id="deviceModel"
                      value={formData.deviceModel}
                      onChange={(e) => handleInputChange('deviceModel', e.target.value)}
                      placeholder="e.g., iPhone 15 Pro"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="serialNumber">Serial Number/IMEI</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                      placeholder="e.g., ABC123DEF456"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Owner Information
                </CardTitle>
                <CardDescription>
                  Provide details about the device owner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerPhone">Owner Phone</Label>
                    <Input
                      id="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                      placeholder="e.g., +27123456789"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerEmail">Owner Email</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                      placeholder="e.g., john.doe@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="caseNumber">Case Number (if available)</Label>
                    <Input
                      id="caseNumber"
                      value={formData.caseNumber}
                      onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                      placeholder="e.g., CAS-2024-001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Incident Details
                </CardTitle>
                <CardDescription>
                  Provide information about the incident
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incidentType">Incident Type</Label>
                    <Select value={formData.incidentType} onValueChange={(value) => handleInputChange('incidentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theft">Theft</SelectItem>
                        <SelectItem value="robbery">Robbery</SelectItem>
                        <SelectItem value="fraud">Fraud</SelectItem>
                        <SelectItem value="possession">Possession of Stolen Property</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="incidentDate">Incident Date</Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="incidentLocation">Incident Location</Label>
                    <Input
                      id="incidentLocation"
                      value={formData.incidentLocation}
                      onChange={(e) => handleInputChange('incidentLocation', e.target.value)}
                      placeholder="e.g., 123 Main Street, Johannesburg CBD"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description of Incident</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of the incident..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Evidence Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Evidence & Documentation
                </CardTitle>
                <CardDescription>
                  Upload relevant evidence and documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="evidence">Evidence Files</Label>
                    <Input
                      id="evidence"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov"
                      multiple
                      onChange={(e) => handleInputChange('evidence', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Photos, videos, documents (PDF, JPG, PNG, MP4, MOV)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewLawReport;
