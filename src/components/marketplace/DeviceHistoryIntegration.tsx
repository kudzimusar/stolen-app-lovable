import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Wrench, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Eye,
  ExternalLink
} from "lucide-react";

interface DeviceHistoryIntegrationProps {
  deviceId: string;
  showInline?: boolean;
}

const DeviceHistoryIntegration = ({ deviceId, showInline = false }: DeviceHistoryIntegrationProps) => {
  const [selectedTab, setSelectedTab] = useState("blockchain");

  // Mock data - in real app would fetch from API
  const blockchainData = {
    contractAddress: "0xABC123...DEF456",
    tokenId: deviceId,
    currentOwner: "0x789GHI...JKL012",
    mintDate: "2024-01-15",
    transfers: 2,
    verified: true,
    lastUpdate: "2024-08-15 14:30:00"
  };

  const repairHistory = [
    {
      id: 1,
      date: "2024-06-20",
      shop: "TechFix Pro",
      shopId: "techfix-123",
      issue: "Screen replacement",
      cost: 1499,
      warranty: "3 months",
      verified: true,
      rating: 4.8
    },
    {
      id: 2,
      date: "2024-03-10",
      shop: "Mobile Medics",
      shopId: "mobile-medics-456",
      issue: "Battery replacement",
      cost: 899,
      warranty: "6 months",
      verified: true,
      rating: 4.9
    }
  ];

  const ownershipHistory = [
    {
      id: 1,
      date: "2024-02-15",
      from: "Retail Store",
      to: "Current Owner",
      transactionHash: "0xABC123...",
      verified: true,
      type: "purchase"
    },
    {
      id: 2,
      date: "2024-01-15",
      from: "Manufacturer",
      to: "Retail Store",
      transactionHash: "0xDEF456...",
      verified: true,
      type: "distribution"
    }
  ];

  const HistoryContent = () => (
    <div className="space-y-4">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="repairs">Repairs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blockchain" className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-verified" />
              <h4 className="font-semibold">Blockchain Verification</h4>
              {blockchainData.verified && (
                <Badge variant="secondary" className="bg-verified/10 text-verified">
                  Verified
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Contract:</span>
                <p className="font-mono text-xs">{blockchainData.contractAddress}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Token ID:</span>
                <p className="font-mono">#{blockchainData.tokenId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Mint Date:</span>
                <p>{blockchainData.mintDate}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Transfers:</span>
                <p>{blockchainData.transfers}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-3">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          </Card>
        </TabsContent>
        
        <TabsContent value="ownership" className="space-y-3">
          {ownershipHistory.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{record.type}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {record.from} → {record.to}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {record.date}
                  </div>
                </div>
                {record.verified ? (
                  <Badge variant="secondary" className="bg-verified/10 text-verified">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="repairs" className="space-y-3">
          {repairHistory.map((repair) => (
            <Card key={repair.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    <span className="font-medium">{repair.issue}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {repair.shop} • R{repair.cost.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {repair.date}
                    </div>
                    <span>Warranty: {repair.warranty}</span>
                    <span>★ {repair.rating}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-verified/10 text-verified">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );

  if (showInline) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Device History</h3>
          <Badge variant="secondary" className="bg-verified/10 text-verified">
            Blockchain Verified
          </Badge>
        </div>
        <HistoryContent />
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Device History & Verification
          </DialogTitle>
        </DialogHeader>
        <HistoryContent />
      </DialogContent>
    </Dialog>
  );
};

export default DeviceHistoryIntegration;