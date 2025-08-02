import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { DocumentDownloader } from "@/components/DocumentDownloader";
import { 
  Search, 
  Calendar, 
  User, 
  Shield, 
  ExternalLink,
  Download,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const OwnershipHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("device-1");

  const mockDevices = [
    { id: "device-1", name: "iPhone 14 Pro", serial: "F2LLD123ABC" },
    { id: "device-2", name: "MacBook Air M2", serial: "C02YL456DEF" },
  ];

  const mockHistory = [
    {
      id: "1",
      date: "2024-01-15",
      time: "14:30",
      fromOwner: "John Smith",
      toOwner: "You",
      transferType: "Purchase",
      verificationStatus: "verified",
      blockchainHash: "0x1234567890abcdef1234567890abcdef12345678",
      location: "Cape Town, WC",
      price: "R12,500",
      documents: ["receipt", "warranty"]
    },
    {
      id: "2",
      date: "2023-08-22",
      time: "09:15",
      fromOwner: "Apple Store Century City",
      toOwner: "John Smith",
      transferType: "Retail Purchase",
      verificationStatus: "verified",
      blockchainHash: "0xabcdef1234567890abcdef1234567890abcdef12",
      location: "Cape Town, WC",
      price: "R18,999",
      documents: ["receipt", "warranty", "registration"]
    },
    {
      id: "3",
      date: "2023-08-22",
      time: "08:00",
      fromOwner: "Apple Manufacturing",
      toOwner: "Apple Store Century City",
      transferType: "Initial Registration",
      verificationStatus: "verified",
      blockchainHash: "0x567890abcdef1234567890abcdef1234567890ab",
      location: "Cupertino, CA",
      price: "N/A",
      documents: ["manufacturing_cert"]
    }
  ];

  const filteredHistory = mockHistory.filter(entry =>
    entry.fromOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.toOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.transferType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDeviceData = mockDevices.find(d => d.id === selectedDevice);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ownership History</h1>
          <p className="text-muted-foreground">Complete immutable ownership trail</p>
        </div>

        {/* Device Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Device</CardTitle>
            <CardDescription>Choose a device to view its ownership history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {mockDevices.map((device) => (
                <div
                  key={device.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDevice === device.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <h3 className="font-medium">{device.name}</h3>
                  <p className="text-sm text-muted-foreground">{device.serial}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Export */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search ownership history..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DocumentDownloader 
            documentType="ownership_history"
            deviceData={selectedDeviceData}
            variant="outline"
          />
        </div>

        {/* Ownership Timeline */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Ownership Trail: {selectedDeviceData?.name}
            </h2>
            <Badge variant="outline">{filteredHistory.length} transfers</Badge>
          </div>

          <div className="space-y-4">
            {filteredHistory.map((entry, index) => (
              <Card key={entry.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{entry.date}</span>
                          <span className="text-sm text-muted-foreground">{entry.time}</span>
                        </div>
                        <Badge 
                          variant={entry.verificationStatus === 'verified' ? 'default' : 'secondary'}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {entry.verificationStatus}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{entry.fromOwner}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{entry.toOwner}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Transfer Type:</span>
                          <p className="font-medium">{entry.transferType}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{entry.location}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value:</span>
                          <p className="font-medium">{entry.price}</p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground">Blockchain Hash:</span>
                            <p className="font-mono text-sm">{entry.blockchainHash}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {entry.documents.length > 0 && (
                        <div className="mt-4">
                          <span className="text-sm text-muted-foreground">Available Documents:</span>
                          <div className="flex gap-2 mt-2">
                            {entry.documents.map((doc) => (
                              <DocumentDownloader
                                key={doc}
                                documentType={doc}
                                deviceData={selectedDeviceData}
                                size="sm"
                                variant="outline"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline connector */}
                    {index < filteredHistory.length - 1 && (
                      <div className="absolute left-8 -bottom-6 w-0.5 h-6 bg-border"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No ownership history found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No results match your search." : "This device has no recorded ownership transfers."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OwnershipHistory;