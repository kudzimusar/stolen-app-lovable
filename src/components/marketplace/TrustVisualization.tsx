import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Link, 
  Clock,
  User,
  MapPin,
  Fingerprint,
  QrCode,
  FileText,
  Award,
  TrendingUp,
  Zap,
  Info
} from 'lucide-react';

interface DeviceVerification {
  deviceId: string;
  serialNumber: string;
  status: 'clean' | 'stolen' | 'lost' | 'flagged';
  trustScore: number;
  verificationLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  lastVerified: Date;
  blockchainHash?: string;
  ownershipChain: OwnershipRecord[];
  verificationHistory: VerificationRecord[];
  riskFactors: RiskFactor[];
  certifications: Certification[];
}

interface OwnershipRecord {
  id: string;
  previousOwner: string;
  currentOwner: string;
  transferDate: Date;
  transferMethod: 'purchase' | 'gift' | 'warranty_replacement' | 'theft_recovery';
  verified: boolean;
  blockchainTxHash?: string;
  documentation: string[];
}

interface VerificationRecord {
  id: string;
  timestamp: Date;
  method: 'qr_scan' | 'serial_lookup' | 'ocr_document' | 'manual_review';
  result: 'verified' | 'flagged' | 'inconclusive';
  verifiedBy: string;
  confidence: number;
  evidence: string[];
}

interface RiskFactor {
  id: string;
  type: 'theft_report' | 'suspicious_activity' | 'location_anomaly' | 'price_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolved: boolean;
}

interface Certification {
  id: string;
  type: 'warranty' | 'insurance' | 'repair' | 'authenticity';
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  verified: boolean;
  documentUrl?: string;
}

interface TrustVisualizationProps {
  deviceId: string;
  showFullDetails?: boolean;
  size?: 'compact' | 'full';
}

export const TrustVisualization: React.FC<TrustVisualizationProps> = ({
  deviceId,
  showFullDetails = false,
  size = 'full'
}) => {
  const [verification, setVerification] = useState<DeviceVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false);

  useEffect(() => {
    loadVerificationData();
  }, [deviceId]);

  const loadVerificationData = async () => {
    setIsLoading(true);
    try {
      // In real implementation, fetch from Supabase
      // For now, using mock data
      const mockData: DeviceVerification = {
        deviceId,
        serialNumber: `SN${deviceId.toUpperCase()}XYZ789`,
        status: 'clean',
        trustScore: 94,
        verificationLevel: 'premium',
        lastVerified: new Date(),
        blockchainHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
        ownershipChain: [
          {
            id: '1',
            previousOwner: 'Apple Store Sandton',
            currentOwner: 'John Doe',
            transferDate: new Date('2024-01-15'),
            transferMethod: 'purchase',
            verified: true,
            blockchainTxHash: '0xabc123...',
            documentation: ['Receipt', 'Warranty Card']
          },
          {
            id: '2',
            previousOwner: 'John Doe',
            currentOwner: 'TechDeals Pro',
            transferDate: new Date('2024-11-20'),
            transferMethod: 'purchase',
            verified: true,
            blockchainTxHash: '0xdef456...',
            documentation: ['Sales Agreement', 'Device Report']
          }
        ],
        verificationHistory: [
          {
            id: '1',
            timestamp: new Date(),
            method: 'qr_scan',
            result: 'verified',
            verifiedBy: 'STOLEN Platform',
            confidence: 98,
            evidence: ['QR Code', 'Serial Number Match', 'Blockchain Record']
          },
          {
            id: '2',
            timestamp: new Date('2024-11-20'),
            method: 'serial_lookup',
            result: 'verified',
            verifiedBy: 'TechDeals Pro',
            confidence: 95,
            evidence: ['Serial Number', 'Purchase Receipt']
          }
        ],
        riskFactors: [],
        certifications: [
          {
            id: '1',
            type: 'warranty',
            issuer: 'Apple Inc.',
            issueDate: new Date('2024-01-15'),
            expiryDate: new Date('2025-01-15'),
            verified: true
          },
          {
            id: '2',
            type: 'authenticity',
            issuer: 'STOLEN Platform',
            issueDate: new Date(),
            verified: true
          }
        ]
      };

      setVerification(mockData);
    } catch (error) {
      console.error('Failed to load verification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'stolen':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'lost':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getVerificationLevelBadge = (level: string) => {
    const configs = {
      basic: { color: 'bg-gray-100 text-gray-800', icon: <Shield className="w-3 h-3" /> },
      standard: { color: 'bg-blue-100 text-blue-800', icon: <Shield className="w-3 h-3" /> },
      premium: { color: 'bg-purple-100 text-purple-800', icon: <Award className="w-3 h-3" /> },
      enterprise: { color: 'bg-gold-100 text-gold-800', icon: <Award className="w-3 h-3" /> }
    };
    
    const config = configs[level as keyof typeof configs] || configs.basic;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-8 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!verification) {
    return (
      <Card className="p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load verification data. Device may not be registered.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (size === 'compact') {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(verification.status)}
            <span className="font-medium capitalize">{verification.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full border ${getTrustScoreColor(verification.trustScore)}`}>
              <span className="text-sm font-semibold">{verification.trustScore}%</span>
            </div>
            {getVerificationLevelBadge(verification.verificationLevel)}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trust Score Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Device Trust Score</h3>
              <p className="text-sm text-muted-foreground">
                Last verified {verification.lastVerified.toLocaleDateString()}
              </p>
            </div>
          </div>
          {getVerificationLevelBadge(verification.verificationLevel)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Trust Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trust Score</span>
              <span className={`text-2xl font-bold ${verification.trustScore >= 90 ? 'text-green-600' : verification.trustScore >= 75 ? 'text-blue-600' : 'text-yellow-600'}`}>
                {verification.trustScore}%
              </span>
            </div>
            <Progress value={verification.trustScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on ownership history, verifications, and risk assessment
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(verification.status)}
              <span className="font-medium capitalize">{verification.status}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {verification.status === 'clean' && 'No theft reports or suspicious activity'}
              {verification.status === 'stolen' && 'Device reported as stolen'}
              {verification.status === 'lost' && 'Device reported as lost'}
            </div>
          </div>

          {/* Blockchain */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              <span className="text-sm font-medium">Blockchain Verified</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBlockchainDetails(true)}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Proof
            </Button>
          </div>
        </div>
      </Card>

      {/* Detailed Information */}
      {showFullDetails && (
        <Tabs defaultValue="ownership" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ownership">Ownership</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="ownership">
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Ownership History</h4>
              <div className="space-y-4">
                {verification.ownershipChain.map((record, index) => (
                  <div key={record.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{record.currentOwner}</p>
                          <p className="text-sm text-muted-foreground">
                            From: {record.previousOwner}
                          </p>
                        </div>
                        {record.verified ? (
                          <Badge variant="secondary" className="bg-verified/10 text-verified">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Transfer Date: {record.transferDate.toLocaleDateString()}</p>
                        <p>Method: {record.transferMethod.replace('_', ' ')}</p>
                        {record.blockchainTxHash && (
                          <p>Blockchain TX: {record.blockchainTxHash.slice(0, 16)}...</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {record.documentation.map((doc, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Verification History</h4>
              <div className="space-y-4">
                {verification.verificationHistory.map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {record.method === 'qr_scan' && <QrCode className="w-4 h-4" />}
                        {record.method === 'serial_lookup' && <Fingerprint className="w-4 h-4" />}
                        {record.method === 'ocr_document' && <FileText className="w-4 h-4" />}
                        <span className="font-medium">
                          {record.method.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <Badge variant={record.result === 'verified' ? 'default' : 'destructive'}>
                        {record.result}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Verified by: {record.verifiedBy}</p>
                      <p>Confidence: {record.confidence}%</p>
                      <p>Time: {record.timestamp.toLocaleString()}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {record.evidence.map((evidence, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {evidence}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="risks">
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Risk Analysis</h4>
              {verification.riskFactors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">No Risk Factors Detected</p>
                  <p className="text-sm text-muted-foreground">
                    This device has a clean history with no suspicious activity
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verification.riskFactors.map((risk) => (
                    <Alert key={risk.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span>{risk.description}</span>
                          <Badge variant={
                            risk.severity === 'critical' ? 'destructive' :
                            risk.severity === 'high' ? 'destructive' :
                            risk.severity === 'medium' ? 'secondary' : 'outline'
                          }>
                            {risk.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Certificates & Warranties</h4>
              <div className="grid gap-4">
                {verification.certifications.map((cert) => (
                  <div key={cert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span className="font-medium capitalize">{cert.type}</span>
                      </div>
                      {cert.verified ? (
                        <Badge variant="secondary" className="bg-verified/10 text-verified">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unverified</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Issuer: {cert.issuer}</p>
                      <p>Issue Date: {cert.issueDate.toLocaleDateString()}</p>
                      {cert.expiryDate && (
                        <p>Expires: {cert.expiryDate.toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Blockchain Details Modal */}
      <Dialog open={showBlockchainDetails} onOpenChange={setShowBlockchainDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Blockchain Verification Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This device's ownership and transaction history is permanently recorded on the blockchain, ensuring transparency and preventing fraud.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Blockchain Hash:</span>
                    <p className="font-mono text-xs break-all mt-1">
                      {verification.blockchainHash}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Device ID:</span>
                    <p className="font-mono text-xs mt-1">{verification.deviceId}</p>
                  </div>
                  <div>
                    <span className="font-medium">Serial Number:</span>
                    <p className="font-mono text-xs mt-1">{verification.serialNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">Network:</span>
                    <p className="text-xs mt-1">Ethereum Mainnet</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View on Etherscan
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
