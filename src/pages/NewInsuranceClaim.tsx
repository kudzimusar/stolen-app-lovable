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
  CheckCircle
} from "lucide-react";

const NewInsuranceClaim = () => {
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceBrand: '',
    deviceModel: '',
    serialNumber: '',
    claimType: '',
    claimAmount: '',
    incidentDate: '',
    incidentLocation: '',
    description: '',
    policeReport: '',
    receipts: ''
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
              <h2 className="text-2xl font-bold">Claim Submitted Successfully!</h2>
              <p className="text-muted-foreground">
                Your insurance claim has been submitted and is being reviewed. 
                You will receive updates via email and SMS.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Claim Reference:</strong> CLM-{Date.now().toString().slice(-6)}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Estimated Review Time:</strong> 3-5 business days
                </p>
              </div>
              <Button onClick={() => setIsSubmitted(false)}>
                Submit Another Claim
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
            <h1 className="text-3xl font-bold">Submit New Insurance Claim</h1>
            <p className="text-muted-foreground">
              Submit a claim for your stolen, damaged, or lost device
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
                  Provide details about the device you're claiming for
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
                    <Label htmlFor="serialNumber">Serial Number</Label>
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

            {/* Claim Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Claim Details
                </CardTitle>
                <CardDescription>
                  Provide information about the incident
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="claimType">Claim Type</Label>
                    <Select value={formData.claimType} onValueChange={(value) => handleInputChange('claimType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select claim type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theft">Theft</SelectItem>
                        <SelectItem value="damage">Damage</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="claimAmount">Claim Amount (R)</Label>
                    <Input
                      id="claimAmount"
                      type="number"
                      value={formData.claimAmount}
                      onChange={(e) => handleInputChange('claimAmount', e.target.value)}
                      placeholder="25000"
                      required
                    />
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
                  <div>
                    <Label htmlFor="incidentLocation">Incident Location</Label>
                    <Input
                      id="incidentLocation"
                      value={formData.incidentLocation}
                      onChange={(e) => handleInputChange('incidentLocation', e.target.value)}
                      placeholder="e.g., Johannesburg CBD"
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
                    placeholder="Provide a detailed description of what happened..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supporting Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Supporting Documents
                </CardTitle>
                <CardDescription>
                  Upload relevant documents to support your claim
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="policeReport">Police Report (if applicable)</Label>
                    <Input
                      id="policeReport"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleInputChange('policeReport', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="receipts">Purchase Receipts</Label>
                    <Input
                      id="receipts"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleInputChange('receipts', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewInsuranceClaim;
