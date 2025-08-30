import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  Package, 
  CheckCircle,
  Users
} from "lucide-react";

const NewDonationRequest = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    deviceType: '',
    deviceCount: '',
    estimatedValue: '',
    targetCommunity: '',
    purpose: '',
    timeline: '',
    location: '',
    additionalInfo: ''
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
              <h2 className="text-2xl font-bold">Donation Request Submitted!</h2>
              <p className="text-muted-foreground">
                Your donation request has been submitted and is being reviewed. 
                We will contact you within 3-5 business days.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Request Reference:</strong> DON-{Date.now().toString().slice(-6)}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Review Timeline:</strong> 3-5 business days
                </p>
              </div>
              <Button onClick={() => setIsSubmitted(false)}>
                Submit Another Request
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
            <h1 className="text-3xl font-bold">Request Device Donation</h1>
            <p className="text-muted-foreground">
              Submit a request for device donations to support your community programs
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Organization Information
                </CardTitle>
                <CardDescription>
                  Provide details about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      placeholder="e.g., Digital Bridge Foundation"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      placeholder="e.g., John Smith"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="e.g., john@organization.org"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="e.g., +27123456789"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Donation Requirements
                </CardTitle>
                <CardDescription>
                  Specify the devices and quantities you need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="deviceType">Device Type</Label>
                    <Select value={formData.deviceType} onValueChange={(value) => handleInputChange('deviceType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select device type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laptops">Laptops</SelectItem>
                        <SelectItem value="desktops">Desktop Computers</SelectItem>
                        <SelectItem value="tablets">Tablets</SelectItem>
                        <SelectItem value="smartphones">Smartphones</SelectItem>
                        <SelectItem value="monitors">Monitors</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="mixed">Mixed Devices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deviceCount">Number of Devices</Label>
                    <Input
                      id="deviceCount"
                      type="number"
                      value={formData.deviceCount}
                      onChange={(e) => handleInputChange('deviceCount', e.target.value)}
                      placeholder="e.g., 25"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedValue">Estimated Value (R)</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                      placeholder="e.g., 500000"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Program Details
                </CardTitle>
                <CardDescription>
                  Describe how the devices will be used
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetCommunity">Target Community</Label>
                    <Input
                      id="targetCommunity"
                      value={formData.targetCommunity}
                      onChange={(e) => handleInputChange('targetCommunity', e.target.value)}
                      placeholder="e.g., Rural schools in Limpopo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (1-2 weeks)</SelectItem>
                        <SelectItem value="short">Short term (1-2 months)</SelectItem>
                        <SelectItem value="medium">Medium term (3-6 months)</SelectItem>
                        <SelectItem value="long">Long term (6+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Johannesburg, South Africa"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose & Impact</Label>
                  <Textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder="Describe the purpose of your program and the expected impact on the community..."
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    placeholder="Any additional information that might help with the donation request..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewDonationRequest;
