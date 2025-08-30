import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  FileText,
  Percent,
  Clock,
  Phone,
  Mail
} from "lucide-react";

const InsuranceHub = () => {
  const [policyCode, setPolicyCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkedPolicy, setLinkedPolicy] = useState<any>(null);
  const { toast } = useToast();

  // Mock linked devices with insurance
  const insuredDevices = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      serial: "ABC123456789",
      policy: "INS-12345",
      provider: "TechGuard Insurance",
      coverage: "$1,200",
      discount: "15%",
      status: "active",
      expiryDate: "2025-12-31"
    }
  ];

  // Mock insurance providers
  const providers = [
    {
      name: "TechGuard Insurance",
      logo: "/placeholder.svg",
      discount: "15%",
      coverage: "Up to $2,000",
      features: ["Theft Protection", "Accidental Damage", "Global Coverage"]
    },
    {
      name: "DeviceSecure Plus",
      logo: "/placeholder.svg", 
      discount: "12%",
      coverage: "Up to $1,500",
      features: ["Theft Protection", "Water Damage", "Screen Protection"]
    },
    {
      name: "GadgetGuard Pro",
      logo: "/placeholder.svg",
      discount: "10%",
      coverage: "Up to $1,000", 
      features: ["Basic Protection", "Replacement Service", "24/7 Support"]
    }
  ];

  const handleLinkPolicy = async () => {
    setIsLinking(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (policyCode === "INS-67890") {
      setLinkedPolicy({
        code: policyCode,
        provider: "SafeDevice Insurance",
        discount: "20%",
        coverage: "$1,500"
      });
      
      toast({
        title: "Policy Linked Successfully!",
        description: "20% discount applied to your STOLEN premium.",
        variant: "default"
      });
    } else {
      toast({
        title: "Policy Not Found",
        description: "Please check your policy code and try again.",
        variant: "destructive"
      });
    }
    
    setIsLinking(false);
    setPolicyCode("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">Insurance Hub</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Link New Policy */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Link Insurance Policy</h2>
            </div>
            <p className="text-muted-foreground">
              Connect your existing insurance policy to unlock discounts and streamlined claims.
            </p>
            
            <div className="grid gap-4 max-w-md">
              <div>
                <Label htmlFor="policy-code">Insurance Policy Code</Label>
                <Input
                  id="policy-code"
                  placeholder="Enter policy code (e.g., INS-67890)"
                  value={policyCode}
                  onChange={(e) => setPolicyCode(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleLinkPolicy}
                disabled={!policyCode || isLinking}
                className="w-full"
              >
                {isLinking ? "Linking..." : "Link Policy"}
              </Button>
            </div>

            {linkedPolicy && (
              <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium text-success">Policy Linked Successfully!</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><strong>Provider:</strong> {linkedPolicy.provider}</p>
                  <p><strong>Discount:</strong> {linkedPolicy.discount}</p>
                  <p><strong>Coverage:</strong> {linkedPolicy.coverage}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Current Insurance Policies */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Insurance Policies</h2>
          
          {insuredDevices.length > 0 ? (
            <div className="grid gap-4">
              {insuredDevices.map((device) => (
                <Card key={device.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{device.name}</h3>
                        <Badge variant="secondary">{device.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Serial: {device.serial}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span>{device.provider}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Policy: {device.policy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-success" />
                          <span>{device.discount} STOLEN discount applied</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Expires: {device.expiryDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-success">
                        {device.coverage}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coverage
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Insurance Policies</h3>
              <p className="text-muted-foreground mb-4">
                Link your insurance policy to get discounts and streamlined claims processing.
              </p>
              <Button variant="outline">
                Learn More About Insurance
              </Button>
            </Card>
          )}
        </div>

        {/* Partner Insurance Providers */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Partner Insurance Providers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider, index) => (
              <Card key={index} className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-success">{provider.discount} off STOLEN</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Coverage:</span>
                    <span className="text-sm font-medium">{provider.coverage}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Features:</span>
                    <ul className="text-xs space-y-1">
                      {provider.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Get Quote
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Need Help with Insurance?</h3>
            <p className="text-muted-foreground">
              Our insurance specialists are here to help you find the right coverage.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call Support
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Us
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InsuranceHub;