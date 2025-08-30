import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { QRScanner } from "@/components/QRScanner";
import { TrustBadge } from "@/components/TrustBadge";
import {
  Search,
  QrCode,
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Share
} from "lucide-react";

const DeviceCheck = () => {
  const [searchMethod, setSearchMethod] = useState<"serial" | "qr">("serial");
  const [serialNumber, setSerialNumber] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleSearch = () => {
    // Simulate search result
    setSearchResult({
      deviceName: "iPhone 15 Pro Max",
      serialNumber: "F2LWX1234567",
      status: "clean",
      registeredDate: "2024-01-15",
      ownerAlias: "J.Smith",
      verificationScore: 98,
      lastVerified: "2024-07-28",
      repairHistory: [
        {
          date: "2024-03-10",
          shop: "iFixit Pro",
          issue: "Screen replacement",
          verified: true
        }
      ],
      insuranceLinked: true,
      blockchainHash: "0x1234...abcd"
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "clean":
        return {
          icon: <CheckCircle className="w-6 h-6 text-success" />,
          badge: <TrustBadge type="secure" text="Clean Report" />,
          message: "This device is verified and has no theft reports.",
          color: "text-success"
        };
      case "stolen":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
          badge: <Badge variant="destructive">Stolen Report</Badge>,
          message: "This device has been reported as stolen.",
          color: "text-destructive"
        };
      case "flagged":
        return {
          icon: <Clock className="w-6 h-6 text-warning" />,
          badge: <Badge variant="secondary">Under Review</Badge>,
          message: "This device is under investigation.",
          color: "text-warning"
        };
      default:
        return {
          icon: <Search className="w-6 h-6 text-muted-foreground" />,
          badge: <Badge variant="outline">Unknown</Badge>,
          message: "Device status could not be determined.",
          color: "text-muted-foreground"
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Device Check" 
        showBackButton={true} 
        backTo="/dashboard"
        rightActions={
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
            View History
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Mobile Back Navigation - Fallback */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Check Device Status</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Instantly verify any device's authenticity, ownership history, and theft status 
            using our blockchain-powered verification system.
          </p>
        </div>

        {/* Search Methods */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={searchMethod === "serial" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setSearchMethod("serial")}
            >
              <Search className="w-4 h-4" />
              Serial Number
            </Button>
            <Button
              variant={searchMethod === "qr" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setSearchMethod("qr")}
            >
              <QrCode className="w-4 h-4" />
              QR Code Scan
            </Button>
          </div>

          {searchMethod === "serial" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Serial Number</label>
                <Input
                  placeholder="e.g., F2LWX1234567890"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="h-12 text-center font-mono"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="w-full h-12" 
                size="lg"
                disabled={!serialNumber.trim()}
              >
                <Search className="w-4 h-4" />
                Check Device
              </Button>
            </div>
          ) : (
            showQRScanner ? (
              <QRScanner 
                onScanSuccess={(data) => {
                  const serial = data.split(':').pop() || '';
                  setSerialNumber(serial);
                  setShowQRScanner(false);
                  handleSearch();
                }}
                onClose={() => setShowQRScanner(false)}
              />
            ) : (
              <Card className="p-8 text-center space-y-4">
                <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="font-semibold">Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Point your camera at the device's QR code
                  </p>
                </div>
                <Button variant="hero" size="lg" onClick={() => setShowQRScanner(true)}>
                  Open Camera
                </Button>
              </Card>
            )
          )}
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Verification Complete</h2>
              <p className="text-muted-foreground">
                Results retrieved from blockchain in 0.3 seconds
              </p>
            </div>

            {/* Status Card */}
            <Card className="p-6">
              <div className="text-center space-y-4">
                {(() => {
                  const statusDisplay = getStatusDisplay(searchResult.status);
                  return (
                    <>
                      {statusDisplay.icon}
                      {statusDisplay.badge}
                      <p className={`text-lg ${statusDisplay.color}`}>
                        {statusDisplay.message}
                      </p>
                    </>
                  );
                })()}
              </div>
            </Card>

            {/* Device Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Device Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device:</span>
                    <span className="font-medium">{searchResult.deviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serial:</span>
                    <span className="font-mono text-sm">{searchResult.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered:</span>
                    <span>{searchResult.registeredDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span>{searchResult.ownerAlias}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Verification Score</h3>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-success">
                    {searchResult.verificationScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Confidence Score
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${searchResult.verificationScore}%` }}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Additional Information */}
            <div className="grid gap-6">
              {searchResult.repairHistory.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Repair History</h3>
                  <div className="space-y-3">
                    {searchResult.repairHistory.map((repair: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{repair.issue}</div>
                          <div className="text-sm text-muted-foreground">
                            {repair.shop} • {repair.date}
                          </div>
                        </div>
                        {repair.verified && (
                          <TrustBadge type="secure" text="Verified" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Blockchain Verification</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Verified:</span>
                    <span>{searchResult.lastVerified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Blockchain Hash:</span>
                    <span className="font-mono text-sm">{searchResult.blockchainHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance Linked:</span>
                    <span>{searchResult.insuranceLinked ? "Yes" : "No"}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button variant="outline">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4" />
                Share Results
              </Button>
              {searchResult.status === "stolen" && (
                <Button variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  Report Sighting
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceCheck;