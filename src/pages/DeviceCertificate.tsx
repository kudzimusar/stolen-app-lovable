import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import { Shield, Download, Home, CheckCircle, Calendar, User, Smartphone } from "lucide-react";

const DeviceCertificate = () => {
  const { deviceId } = useParams();

  // Mock device data - in real app, fetch based on deviceId
  const deviceData = {
    id: deviceId || "dev_123456",
    name: "iPhone 15 Pro",
    brand: "Apple",
    model: "A2848",
    serialNumber: "F2LW0**8P",
    imeiNumber: "35***********03",
    owner: "John D.",
    ownerVerified: true,
    status: "verified",
    registrationDate: "2024-01-15",
    lastVerification: "2024-01-20",
    verificationScore: 98,
    blockchainTxId: "0x7d4f8a9e2b1c6d8f3a5e9c7b2d8f4a6e1c9d7f3a8e5b2c6d9f1a4e7c3d8f6a2e9",
    certificateId: "CERT-2024-001234",
    issuedDate: new Date().toISOString(),
    location: "Cape Town, South Africa"
  };

  const handleDownloadPDF = () => {
    // In a real app, generate and download PDF certificate
    alert("PDF Certificate download would start here");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions - Don't print */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <BackButton />
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              Print Certificate
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Certificate Content */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Shield className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-800 mb-2">
              STOLEN VERIFICATION CERTIFICATE
            </CardTitle>
            <div className="space-y-2">
              <Badge variant="default" className="bg-green-600 text-white text-lg px-4 py-2">
                CLEAN BADGE - VERIFIED DEVICE
              </Badge>
              <p className="text-muted-foreground">
                Certificate ID: {deviceData.certificateId}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Device Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Device Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Device Name:</span>
                      <span>{deviceData.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Brand:</span>
                      <span>{deviceData.brand}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Model:</span>
                      <span>{deviceData.model}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Serial Number:</span>
                      <span className="font-mono">{deviceData.serialNumber}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">IMEI Number:</span>
                      <span className="font-mono">{deviceData.imeiNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Ownership Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Current Owner:</span>
                      <div className="flex items-center gap-2">
                        <span>{deviceData.owner}</span>
                        {deviceData.ownerVerified && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Registration Date:</span>
                      <span>{deviceData.registrationDate}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Location:</span>
                      <span>{deviceData.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Verification Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Verified Clean
                      </Badge>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Verification Score:</span>
                      <span className="font-bold text-green-600">{deviceData.verificationScore}%</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Last Verification:</span>
                      <span>{deviceData.lastVerification}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Certificate Issued:</span>
                      <span>{new Date(deviceData.issuedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Blockchain Verification</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      This device's ownership history is permanently recorded on the blockchain:
                    </p>
                    <p className="text-xs font-mono text-blue-600 break-all">
                      {deviceData.blockchainTxId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Security Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Not reported stolen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Legitimate ownership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Blockchain verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">No fraud detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Clean transaction history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Valid registration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-muted-foreground mb-2">
                This certificate is digitally signed and verified by STOLEN's blockchain infrastructure.
              </p>
              <p className="text-xs text-muted-foreground">
                Generated on {new Date(deviceData.issuedDate).toLocaleString()} | 
                Valid as of {new Date().toLocaleString()}
              </p>
              <div className="mt-4">
                <Badge variant="outline" className="text-xs">
                  Powered by STOLEN Blockchain Technology
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions for receiver */}
        <Card className="mt-6 print:hidden">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">For Buyers/Receivers:</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This certificate proves that the device has been verified through STOLEN's blockchain registry. 
              The device is clean, not reported stolen, and has legitimate ownership history.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/register">Join STOLEN Community</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/learn">Learn About Device Security</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceCertificate;