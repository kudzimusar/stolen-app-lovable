import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOLENLogo } from "@/components/STOLENLogo";
import { TrustBadge } from "@/components/TrustBadge";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  MapPin,
  Calendar,
  DollarSign,
  History,
  AlertTriangle,
  Smartphone,
  Share2,
  Download
} from "lucide-react";

const DeviceDetails = () => {
  const { id } = useParams();
  
  // Mock device data
  const device = {
    id: id || "1",
    name: "iPhone 15 Pro",
    brand: "Apple",
    model: "A2848",
    serial: "ABC123DEF456",
    status: "verified",
    purchaseDate: "2024-01-15",
    purchasePrice: "$999",
    location: "San Francisco, CA",
    description: "Space Black 128GB, excellent condition",
    owner: "John D.",
    registrationDate: "2024-01-16",
    insuranceLinked: true,
    photos: [
      "/placeholder.svg",
      "/placeholder.svg"
    ]
  };

  const repairHistory = [
    {
      id: 1,
      date: "2024-02-20",
      shop: "TechFix Pro",
      issue: "Screen replacement",
      cost: "$199",
      verified: true
    },
    {
      id: 2,
      date: "2024-01-16",
      shop: "STOLEN Platform",
      issue: "Initial registration",
      cost: "Free",
      verified: true
    }
  ];

  const ownershipHistory = [
    {
      date: "2024-01-16",
      event: "Device registered",
      details: "Registered by John D. with proof of purchase",
      verified: true
    },
    {
      date: "2024-01-15",
      event: "Purchased",
      details: "Purchased from Apple Store",
      verified: true
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <TrustBadge type="secure" text="Verified Clean" />;
      case "stolen":
        return <Badge variant="destructive">Reported Stolen</Badge>;
      case "needs-attention":
        return <Badge variant="secondary">Needs Attention</Badge>;
      default:
        return <Badge variant="outline">Unknown Status</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <STOLENLogo />
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Device Overview */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">{device.name}</h1>
                {getStatusBadge(device.status)}
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{device.brand} • {device.model}</p>
                <p className="font-mono">{device.serial}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Registered {device.registrationDate}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {device.location}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Download className="w-5 h-5" />
            <span className="text-xs">Download Certificate</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs">Report Issue</span>
          </Button>
        </div>

        {/* Device Information Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="repairs">Repairs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold">Device Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span>{device.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span>{device.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serial Number:</span>
                  <span className="font-mono">{device.serial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Date:</span>
                  <span>{device.purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <span>{device.purchasePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span>{device.description}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="font-semibold">Security Features</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blockchain Verification</span>
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Insurance Linked</span>
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Location Tracking</span>
                  <Shield className="w-4 h-4 text-success" />
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              {ownershipHistory.map((event, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{event.event}</p>
                        <span className="text-xs text-muted-foreground">{event.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                      {event.verified && (
                        <div className="flex items-center gap-1 text-xs text-success">
                          <Shield className="w-3 h-3" />
                          Blockchain Verified
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="repairs" className="space-y-4">
            <div className="space-y-3">
              {repairHistory.map((repair) => (
                <Card key={repair.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{repair.issue}</p>
                      <span className="text-sm font-medium">{repair.cost}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{repair.shop}</span>
                      <span>{repair.date}</span>
                    </div>
                    {repair.verified && (
                      <div className="flex items-center gap-1 text-xs text-success">
                        <Shield className="w-3 h-3" />
                        Verified Repair Shop
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            <Button variant="outline" className="w-full">
              <History className="w-4 h-4 mr-2" />
              Log New Repair
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeviceDetails;