import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DeviceInfo {
  id: string;
  device_model: string;
  device_category: string;
  report_type: string;
  location_address: string;
  created_at: string;
  description: string;
}

const ClaimDevicePublic: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundDevice, setFoundDevice] = useState<DeviceInfo | null>(null);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [claimData, setClaimData] = useState({
    claimant_name: '',
    claimant_email: '',
    claimant_phone: '',
    device_serial: '',
    device_imei: '',
    device_mac: '',
    ownership_proof: '',
    claim_description: ''
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(`/api/v1/lost-found/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        // Find the best match (preferably found devices)
        const foundDevices = data.data.filter((device: any) => device.report_type === 'found');
        setFoundDevice(foundDevices.length > 0 ? foundDevices[0] : data.data[0]);
      } else {
        setFoundDevice(null);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foundDevice) return;
    
    try {
      const response = await fetch('/api/v1/lost-found/submit-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_id: foundDevice.id,
          claimant_name: claimData.claimant_name,
          claimant_email: claimData.claimant_email,
          claimant_phone: claimData.claimant_phone,
          claim_type: 'ownership_claim',
          device_serial_provided: claimData.device_serial,
          device_imei_provided: claimData.device_imei,
          device_mac_provided: claimData.device_mac,
          ownership_proof: {
            description: claimData.ownership_proof,
            additional_info: claimData.claim_description
          },
          claim_description: claimData.claim_description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setClaimSubmitted(true);
      } else {
        alert('Failed to submit claim: ' + result.error);
      }
    } catch (error) {
      console.error('Claim submission error:', error);
      alert('Failed to submit claim. Please try again.');
    }
  };

  if (claimSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your device claim has been submitted successfully. Our admin team will review your claim within 24 hours.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You will receive an email notification once your claim is reviewed.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Claim Your Device</h1>
          <p className="text-gray-600 mt-2">
            Search for your lost device and submit a claim to recover it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Search for Your Device
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search by device model, serial number, or description</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g., iPhone 15, MacBook Pro, ABC123..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={searching}
                    className="px-6"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>

              {foundDevice && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Device Found:</strong> {foundDevice.device_model} ({foundDevice.device_category})
                    <br />
                    <strong>Location:</strong> {foundDevice.location_address}
                    <br />
                    <strong>Reported:</strong> {new Date(foundDevice.created_at).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}

              {searchTerm && !foundDevice && !searching && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No matching device found. Try searching with different terms or check if your device has been reported.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Claim Form */}
          {foundDevice && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Ownership Claim</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClaimSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={claimData.claimant_name}
                        onChange={(e) => setClaimData({...claimData, claimant_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={claimData.claimant_email}
                        onChange={(e) => setClaimData({...claimData, claimant_email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={claimData.claimant_phone}
                      onChange={(e) => setClaimData({...claimData, claimant_phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="serial">Device Serial Number *</Label>
                    <Input
                      id="serial"
                      value={claimData.device_serial}
                      onChange={(e) => setClaimData({...claimData, device_serial: e.target.value})}
                      placeholder="Enter the serial number of your device"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="imei">IMEI Number (if applicable)</Label>
                      <Input
                        id="imei"
                        value={claimData.device_imei}
                        onChange={(e) => setClaimData({...claimData, device_imei: e.target.value})}
                        placeholder="For mobile devices"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mac">MAC Address (if applicable)</Label>
                      <Input
                        id="mac"
                        value={claimData.device_mac}
                        onChange={(e) => setClaimData({...claimData, device_mac: e.target.value})}
                        placeholder="For network devices"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="proof">Proof of Ownership *</Label>
                    <Textarea
                      id="proof"
                      value={claimData.ownership_proof}
                      onChange={(e) => setClaimData({...claimData, ownership_proof: e.target.value})}
                      placeholder="Describe how you can prove ownership (purchase receipt, device settings, unique features, etc.)"
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Additional Information</Label>
                    <Textarea
                      id="description"
                      value={claimData.claim_description}
                      onChange={(e) => setClaimData({...claimData, claim_description: e.target.value})}
                      placeholder="Any additional information that might help verify your claim"
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Claim
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimDevicePublic;
