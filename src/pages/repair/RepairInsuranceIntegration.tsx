import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  FileText, 
  Camera, 
  Download, 
  Upload,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Phone,
  Mail
} from "lucide-react";

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  deviceInfo: string;
  issue: string;
  repairCost: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submittedDate: string;
  insuranceProvider: string;
  estimatedPayout: number;
}

const RepairInsuranceIntegration = () => {
  const [claimInfo, setClaimInfo] = useState({
    policyNumber: "",
    claimNumber: "",
    deviceSerial: "",
    insuranceProvider: "",
    repairCost: "",
    issueDescription: "",
    repairDescription: ""
  });
  const [proofDocuments, setProofDocuments] = useState<File[]>([]);
  const [existingClaims, setExistingClaims] = useState<InsuranceClaim[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const insuranceProviders = [
    "Santam",
    "Old Mutual",
    "Discovery Insure",
    "Outsurance",
    "King Price",
    "Hollard",
    "Momentum",
    "Other"
  ];

  const mockClaims: InsuranceClaim[] = [
    {
      id: "1",
      claimNumber: "CLM-2024-001234",
      deviceInfo: "iPhone 15 Pro - SNK123456789",
      issue: "Screen replacement",
      repairCost: 1200,
      status: 'approved',
      submittedDate: "2024-01-15",
      insuranceProvider: "Discovery Insure",
      estimatedPayout: 1080
    },
    {
      id: "2", 
      claimNumber: "CLM-2024-001235",
      deviceInfo: "Samsung Galaxy S24 - SNK987654321",
      issue: "Water damage repair",
      repairCost: 1800,
      status: 'processing',
      submittedDate: "2024-01-18",
      insuranceProvider: "Santam",
      estimatedPayout: 1620
    }
  ];

  const handleSubmitClaim = async () => {
    if (!claimInfo.policyNumber || !claimInfo.deviceSerial || !claimInfo.repairCost) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newClaim: InsuranceClaim = {
      id: Date.now().toString(),
      claimNumber: `CLM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`,
      deviceInfo: `Device - ${claimInfo.deviceSerial}`,
      issue: claimInfo.issueDescription,
      repairCost: parseFloat(claimInfo.repairCost),
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      insuranceProvider: claimInfo.insuranceProvider,
      estimatedPayout: parseFloat(claimInfo.repairCost) * 0.9
    };

    setExistingClaims(prev => [newClaim, ...prev]);
    
    toast({
      title: "Insurance Claim Submitted",
      description: `Claim ${newClaim.claimNumber} has been submitted successfully`,
      variant: "default"
    });

    // Reset form
    setClaimInfo({
      policyNumber: "",
      claimNumber: "",
      deviceSerial: "",
      insuranceProvider: "",
      repairCost: "",
      issueDescription: "",
      repairDescription: ""
    });
    setProofDocuments([]);
    setIsSubmitting(false);
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setProofDocuments(prev => [...prev, ...files].slice(0, 5));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success border-success';
      case 'processing': return 'bg-warning/10 text-warning border-warning';
      case 'pending': return 'bg-muted text-muted-foreground border-border';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    setExistingClaims(mockClaims);
    document.title = "Insurance Integration | STOLEN – Repair Claims Management";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Insurance Integration" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/repair-shop-dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Insurance Integration
          </h1>
          <p className="text-muted-foreground">
            Submit repair claims and manage insurance documentation
          </p>
        </div>

        {/* New Claim Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Submit New Insurance Claim</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Insurance Policy Number *</Label>
                <Input
                  id="policyNumber"
                  value={claimInfo.policyNumber}
                  onChange={(e) => setClaimInfo({...claimInfo, policyNumber: e.target.value})}
                  placeholder="Enter policy number..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Insurance Provider *</Label>
                <Select value={claimInfo.insuranceProvider} onValueChange={(value) => setClaimInfo({...claimInfo, insuranceProvider: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceSerial">Device Serial Number *</Label>
                <Input
                  id="deviceSerial"
                  value={claimInfo.deviceSerial}
                  onChange={(e) => setClaimInfo({...claimInfo, deviceSerial: e.target.value})}
                  placeholder="Enter device serial number..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repairCost">Repair Cost (ZAR) *</Label>
                <Input
                  id="repairCost"
                  type="number"
                  value={claimInfo.repairCost}
                  onChange={(e) => setClaimInfo({...claimInfo, repairCost: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="issue">Issue Description *</Label>
                <Textarea
                  id="issue"
                  value={claimInfo.issueDescription}
                  onChange={(e) => setClaimInfo({...claimInfo, issueDescription: e.target.value})}
                  placeholder="Describe the device issue..."
                  rows={2}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="repair">Repair Work Performed</Label>
                <Textarea
                  id="repair"
                  value={claimInfo.repairDescription}
                  onChange={(e) => setClaimInfo({...claimInfo, repairDescription: e.target.value})}
                  placeholder="Describe the repair work performed..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Supporting Documentation</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleDocumentUpload}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary file:text-primary-foreground"
                />
                <p className="text-sm text-muted-foreground">
                  Upload photos, receipts, and repair documentation ({proofDocuments.length}/5)
                </p>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                All repair claims are automatically verified through our blockchain system and submitted to your insurance provider with full documentation.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleSubmitClaim} 
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Claim...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Insurance Claim
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Existing Claims */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Insurance Claims</h2>
          
          <div className="space-y-4">
            {existingClaims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No insurance claims submitted yet</p>
              </div>
            ) : (
              existingClaims.map((claim) => (
                <Card key={claim.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{claim.claimNumber}</h3>
                        <Badge className={getStatusColor(claim.status)}>
                          {getStatusIcon(claim.status)}
                          <span className="ml-1 capitalize">{claim.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Device:</span> {claim.deviceInfo}</p>
                        <p><span className="font-medium">Issue:</span> {claim.issue}</p>
                        <p><span className="font-medium">Provider:</span> {claim.insuranceProvider}</p>
                        <p><span className="font-medium">Submitted:</span> {claim.submittedDate}</p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold">R{claim.repairCost.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Repair Cost</div>
                      {claim.status === 'approved' && (
                        <div className="text-sm text-success">
                          Payout: R{claim.estimatedPayout.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download Docs
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact Insurer
                    </Button>
                    {claim.status === 'processing' && (
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-1" />
                        Update Claim
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Insurance Partners */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Supported Insurance Providers</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insuranceProviders.slice(0, -1).map((provider) => (
              <div key={provider} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{provider}</div>
                  <div className="text-xs text-success">✓ Integrated</div>
                </div>
              </div>
            ))
            }
          </div>
          
          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Don't see your insurance provider? Contact us to add integration for your preferred insurer.
            </AlertDescription>
          </Alert>
        </Card>

        {/* Claims Statistics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{existingClaims.length}</div>
            <div className="text-sm text-muted-foreground">Total Claims</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {existingClaims.filter(c => c.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved Claims</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              R{existingClaims
                .filter(c => c.status === 'approved')
                .reduce((sum, c) => sum + c.estimatedPayout, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Payouts</div>
          </Card>
        </div>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default RepairInsuranceIntegration;
